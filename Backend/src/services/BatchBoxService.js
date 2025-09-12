const db = require('../../models');
const { Op } = require('sequelize');
const Warehouse = db.Warehouse;
const Batch = db.Batch;
const Product = db.Product;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const Unit = db.Unit;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class BatchBoxService {
    async suggestBoxes(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { warehouseID, batchIDs } = data;

                // 1. Kiểm tra kho
                const warehouseExist = await Warehouse.findOne({ where: { warehouseID } });
                if (!warehouseExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }

                // 2. Lấy danh sách batch trong kho
                let batches = [];
                for (const id of batchIDs) {
                    const batch = await Batch.findOne({
                        where: { batchID: id },
                        include: [
                            { model: Unit, as: 'unit' },
                            { model: Product, as: 'product' },
                            { model: Box, as: 'boxes', attributes: ['boxID'], through: { attributes: [] } },
                        ],
                    });

                    if (!batch) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${id} không tồn tại`,
                        });
                    }

                    if (batch.warehouseID !== warehouseID) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} không thuộc kho ${warehouseID}`,
                        });
                    }

                    if (batch.status !== 'AVAILABLE') {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} không khả dụng (status = ${batch.status})`,
                        });
                    }

                    if (batch.remainAmount <= 0) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} đã hết hàng (remainAmount = 0)`,
                        });
                    }

                    if (batch.boxes && batch.boxes.length > 0) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Batch ${id} đã có nơi lưu trữ (boxID = ${batch.boxes
                                .map((b) => b.boxID)
                                .join(', ')})`,
                        });
                    }

                    // Nếu ok thì add vào mảng hợp lệ
                    batches.push(batch);
                }

                // 3. Lấy danh sách box khả dụng
                let candidateBoxes = await Box.findAll({
                    where: {
                        status: { [Op.in]: ['AVAILABLE', 'RESERVED', 'OCCUPIED'] },
                        remainingAcreage: { [Op.gt]: 0 },
                    },
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: ['productID', 'unitID'],
                        },
                    ],
                });

                if (!candidateBoxes.length) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Không tìm thấy box nào khả dụng',
                    });
                }

                // 4. Hàm tính điểm expiry
                const expiryScore = (batch) => {
                    const now = new Date();
                    const daysToExpiry = Math.max(0, Math.ceil((batch.expiryDate - now) / (1000 * 60 * 60 * 24)));
                    return Math.max(0, 5000 / (daysToExpiry + 1));
                };

                // 5. Hàm tính điểm box
                const boxScore = (batch, box) => {
                    let score = 0;
                    const unit = batch.unit;
                    const unitVolume = unit.length * unit.width * unit.height;
                    const requiredVolume = unitVolume * batch.remainAmount;

                    if (box.remainingAcreage >= requiredVolume) {
                        score += 60;
                        score += 50 * (1 - (box.remainingAcreage - requiredVolume) / requiredVolume);
                    }
                    if (box.batches.some((b) => b.productID === batch.productID)) score += 30;
                    if (box.batches.some((b) => b.unitID === batch.unitID)) score += 10;
                    if (box.floor && box.floor.floorName) {
                        const floorNum = parseInt(box.floor.floorName.replace(/\D/g, '')) || 99;
                        score += 10 - floorNum;
                    }

                    return score;
                };

                // 6. Phân bổ batch vào box theo global best match
                let suggestions = [];
                let remainingBatches = [...batches];
                let availableBoxes = [...candidateBoxes];

                while (remainingBatches.length > 0 && availableBoxes.length > 0) {
                    // Tạo toàn bộ batch-box pairs
                    let scoredPairs = [];
                    for (let batch of remainingBatches) {
                        for (let box of availableBoxes) {
                            const score = expiryScore(batch) + boxScore(batch, box);
                            scoredPairs.push({ batch, box, score });
                        }
                    }

                    if (scoredPairs.length === 0) break;

                    // Chọn pair có score cao nhất
                    scoredPairs.sort((a, b) => b.score - a.score);
                    const { batch, box } = scoredPairs[0];

                    const unit = batch.unit;
                    const unitVolume = unit.length * unit.width * unit.height;

                    const maxCapacity = Math.floor(box.remainingAcreage / unitVolume);
                    const isBatchLarger = batch.remainAmount > maxCapacity;
                    let placed;

                    if (isBatchLarger) {
                        placed = maxCapacity;
                        availableBoxes = availableBoxes.filter((b) => b.boxID !== box.boxID);
                        batch.remainAmount -= placed;
                    } else {
                        placed = batch.remainAmount;
                        remainingBatches = remainingBatches.filter((b) => b.batchID !== batch.batchID);
                        box.remainingAcreage -= placed * unitVolume;
                    }

                    // Ghi kết quả
                    suggestions.push({
                        batchID: batch.batchID,
                        box: { boxID: box.boxID, boxName: box.boxName },
                        floor: { floorID: box.floor.floorID, floorName: box.floor.floorName },
                        shelf: { shelfID: box.floor.shelf.shelfID, shelfName: box.floor.shelf.shelfName },
                        zone: { zoneID: box.floor.shelf.zone.zoneID, zoneName: box.floor.shelf.zone.zoneName },
                        placedAmount: placed,
                    });
                }

                // Nếu hết box mà vẫn còn batch => lỗi
                if (remainingBatches.length > 0 && availableBoxes.length === 0) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Không đủ chỗ để chứa toàn bộ batch',
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Gợi ý vị trí box thành công',
                    boxes: suggestions,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message || err,
                });
            }
        });
    }
    async updateLocationBatch(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { warehouseID, locations } = data;
                // 1. Kiểm tra kho
                const warehouseExist = await Warehouse.findOne({ where: { warehouseID } });
                if (!warehouseExist) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }
                // 2. Duyệt từng location để kiểm tra và cập nhật
                for (const loc of locations) {
                    const { batchID, box, quantity } = loc;
                    const batch = await Batch.findOne({
                        where: { batchID, warehouseID },
                        include: [{ model: Unit, as: 'unit' }],
                    });
                    if (!batch) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Batch ${batchID} không tồn tại hoặc không hợp lệ`,
                        });
                    }
                    if (quantity > batch.remainAmount) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Số lượng đặt (${quantity}) vượt quá số lượng còn lại của batch ${batchID} (${batch.remainAmount})`,
                        });
                    }
                    // box is one
                    // join box with warehouse through floor, shelf, zone
                    const boxExist = await Box.findOne({
                        where: { boxID: box.boxID },
                        include: [
                            {
                                model: Floor,
                                as: 'floor',
                                include: [
                                    {
                                        model: Shelf,
                                        as: 'shelf',
                                        include: [
                                            {
                                                model: Zone,
                                                as: 'zone',
                                                where: { warehouseID },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });
                    if (!boxExist) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: `Box ${box.boxID} không tồn tại`,
                        });
                    }
                    const unitVolume = batch.unit.length * batch.unit.width * batch.unit.height;
                    const requiredVolume = unitVolume * quantity;
                    if (boxExist.remainingAcreage < requiredVolume) {
                        reject({
                            status: 'ERR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Box ${box.boxID} không đủ diện tích (còn ${boxExist.remainingAcreage}, cần ${requiredVolume})`,
                        });
                    } else {
                        // Cập nhật BatchBox
                        await db.BatchBox.create(
                            {
                                batchID: batch.batchID,
                                boxID: boxExist.boxID,
                                quantity,
                            },
                            { transaction },
                        );
                        // Cập nhật remain của box
                        boxExist.remainingAcreage -= requiredVolume;
                        if (boxExist.remainingAcreage === 0) {
                            boxExist.status = 'FULL';
                        } else if (boxExist.status === 'AVAILABLE') {
                            boxExist.status = 'OCCUPIED';
                        }
                        await boxExist.save({ transaction });
                    }
                }
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật vị trí batch thành công',
                });
            } catch (err) {
                await transaction.rollback();
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message || err,
                });
            }
        });
    }
}

module.exports = new BatchBoxService();
