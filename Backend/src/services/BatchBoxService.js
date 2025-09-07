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
                const candidateBoxes = await Box.findAll({
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
                    return resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Không tìm thấy box nào khả dụng',
                        boxes: [],
                    });
                }

                // 4. Hàm tính điểm expiry
                const expiryScore = (batch) => {
                    const now = new Date();
                    const daysToExpiry = Math.max(0, Math.ceil((batch.expiryDate - now) / (1000 * 60 * 60 * 24)));
                    return Math.max(0, 100 - daysToExpiry);
                };

                // 5. Hàm tính điểm box
                const boxScore = (batch, box) => {
                    let score = 0;
                    const unit = batch.unit;
                    const unitVolume = unit.length * unit.width * unit.height;
                    const requiredVolume = unitVolume * batch.remainAmount;

                    if (box.remainingAcreage >= requiredVolume) score += 200;
                    if (box.batches.some((b) => b.productID === batch.productID)) score += 80;
                    if (box.batches.some((b) => b.unitID === batch.unitID)) score += 60;
                    if (box.floor && box.floor.floorName) {
                        const floorNum = parseInt(box.floor.floorName.replace(/\D/g, '')) || 99;
                        score += 10 - floorNum;
                    }
                    score += 40 * (1 - Math.abs(box.remainingAcreage - requiredVolume) / requiredVolume);

                    return score;
                };

                // 6. Sắp xếp batches theo hạn sử dụng (FEFO)
                batches = batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

                let suggestions = [];

                // 7. Phân bổ từng batch
                for (let batch of batches) {
                    let remain = batch.remainAmount;
                    const unit = batch.unit;
                    const unitVolume = unit.length * unit.width * unit.height;

                    while (remain > 0) {
                        // chấm điểm cho các box
                        let scored = candidateBoxes.map((box) => ({
                            box,
                            score: expiryScore(batch) + boxScore(batch, box),
                        }));

                        scored.sort((a, b) => b.score - a.score);
                        const best = scored[0];
                        if (!best) break;

                        const chosenBox = best.box;
                        const maxCapacity = Math.floor(chosenBox.remainingAcreage / unitVolume);
                        const placed = Math.min(remain, maxCapacity);

                        if (placed <= 0) break;

                        suggestions.push({
                            batchID: batch.batchID,
                            boxID: chosenBox.boxID,
                            placed,
                            score: best.score,
                        });

                        // cập nhật dữ liệu tạm
                        chosenBox.remainingAcreage -= placed * unitVolume;
                        remain -= placed;
                    }
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
}

module.exports = new BatchBoxService();
