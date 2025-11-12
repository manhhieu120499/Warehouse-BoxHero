const db = require('../../models/index');
const bcrypt = require('bcrypt');
const Account = db.Account;
const Employee = db.Employee;
const AccountRoles = db.AccountRoles;
const Role = db.Role;
const Product = db.Product;
const Batch = db.Batch;
const Box = db.Box;
const dotenv = require('dotenv');
const { detectIntent } = require('../utils/DialogFlowCxHelper');

const { v4: uuidv4 } = require('uuid');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class DialogFlowCXService {
    checkInventoryProduct(productId) {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.findByPk(productId);
                if (!product) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                inventory_status: 'NOT_FOUND',
                                product_code_not_found: productId,
                            },
                        },
                    });
                }
                return resolve({
                    sessionInfo: {
                        parameters: {
                            inventory_status: 'OK',
                            product_name: product.productName,
                            product_amount: product.amount,
                        },
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    batchOfProduct(productId) {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.findByPk(productId);
                if (!product) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'NOT_FOUND',
                                product_code_not_found: productId,
                            },
                        },
                    });
                }
                const batches = await Batch.findAll({
                    where: { productID: productId, remainAmount: { [db.Sequelize.Op.gt]: 0 } },
                    include: [
                        {
                            model: Box,
                            as: 'boxes',
                            attributes: ['boxID', 'boxName'],
                            through: { attributes: [] },
                            required: true,
                        },
                    ],
                });

                if (batches.length === 0) {
                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'OK',
                                product_code_found: productId,
                                batches_list_formatted: `Không có lô hàng nào cho sản phẩm với mã là ${productId}.`,
                            },
                        },
                    });
                } else {
                    const batchDetails = batches
                        .map(
                            (batch) =>
                                `- Lô ${batch.batchID}: Ngày sản xuất ${
                                    batch.manufactureDate.toISOString().split('T')[0]
                                }, Ngày hết hạn ${batch.expiryDate.toISOString().split('T')[0]}, Số lượng còn lại ${
                                    batch.remainAmount
                                }, Ô chứa: ${batch.boxes.map((box) => box.boxName).join(', ')}
                            `,
                        )
                        .join('\n');

                    return resolve({
                        sessionInfo: {
                            parameters: {
                                batch_of_product_status: 'OK',
                                product_code_found: productId,
                                batches_list_formatted: `Các lô hàng chứa "${productId}":\n` + batchDetails,
                            },
                        },
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    default() {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve({
                    statusHttp: HTTP_OK,
                    fulfillment_response: {
                        messages: [
                            {
                                text: {
                                    text: ['Default response from DialogFlowCXService.'],
                                },
                            },
                        ],
                    },
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    chatWithDialogFlowCX(message, sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!sessionId) sessionId = uuidv4();

                const dfResponse = await detectIntent(message, sessionId);
                const frontendMessages = [];

                for (const msg of dfResponse.queryResult.responseMessages) {
                    // --- XỬ LÝ TEXT (Phần này của bạn đã đúng) ---
                    if (msg.text && msg.text.text) {
                        for (const txt of msg.text.text) {
                            if (txt) {
                                frontendMessages.push({
                                    from: 'bot',
                                    type: 'text',
                                    text: txt,
                                });
                            }
                        }
                    }

                    // --- XỬ LÝ PAYLOAD (Phần này đã được sửa) ---
                    if (msg.payload && msg.payload.fields) {
                        const payload = msg.payload.fields;

                        // 1. Kiểm tra richContent
                        if (
                            payload.richContent &&
                            payload.richContent.listValue &&
                            payload.richContent.listValue.values
                        ) {
                            // 2. Lặp qua các 'row'
                            for (const row of payload.richContent.listValue.values) {
                                // 3. Lặp qua các 'item' trong row
                                if (row.listValue && row.listValue.values) {
                                    for (const item of row.listValue.values) {
                                        // 4. Lấy 'fields' từ 'structValue' của item
                                        const itemFields = item.structValue.fields;

                                        // 5. Lấy 'type' và 'options' một cách an toàn
                                        const itemType = itemFields.type?.stringValue;
                                        const itemOptionsArray = itemFields.options?.listValue?.values; // Đây là mảng các options

                                        // 6. Kiểm tra đúng 'type' và 'options'
                                        if (itemType === 'chips' && itemOptionsArray) {
                                            // 7. Map mảng 'itemOptionsArray'
                                            const buttons = itemOptionsArray.map((opt) => {
                                                // 8. Lấy 'text' từ structValue của mỗi option
                                                const optText = opt.structValue.fields.text?.stringValue;
                                                return {
                                                    label: optText,
                                                    value: optText, // Dùng text làm value
                                                };
                                            });

                                            frontendMessages.push({
                                                from: 'bot',
                                                type: 'buttons',
                                                buttons: buttons,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // --- KẾT QUẢ TRẢ VỀ (Sửa lại theo yêu cầu ban đầu) ---
                return resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: `Nhắn tin tới DialogFlow CX thành công.`,
                    sessionId: sessionId,
                    data: frontendMessages,
                });
            } catch (e) {
                console.log(e);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new DialogFlowCXService();
