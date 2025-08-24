const dotenv = require('dotenv');
const db = require('../../models');
const { Op } = require('sequelize');
const Proposal = db.Proposal;
const Employee = db.Employee;
const Product = db.Product;
const Warehouse = db.Warehouse;
const Unit = db.Unit;
const ProposalDetail = db.ProposalDetail;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_FORBIDDEN = process.env.HTTP_FORBIDDEN;
const LIMIT_PAGE = parseInt(process.env.LIMIT_PAGE, 10);

class ProposalService {
    // create proposal
    createProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const newProposal = await Proposal.create({ ...data, status: 'PENDING' }, { transaction });
                // create proposal detail
                await ProposalDetail.bulkCreate(
                    data.proposalDetails.map((item) => ({
                        ...item,
                        proposalID: newProposal.proposalID,
                    })),
                    { transaction },
                );
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo đề xuất thành công',
                    proposal: newProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // approval proposal
    approveProposal(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const proposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                });
                if (!proposal) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Không tìm thấy đề xuất',
                    });
                }
                // update proposal
                proposal.status = data.status;
                proposal.approverID = data.employeeIDApproval;
                await proposal.save({ transaction });

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Phê duyệt đề xuất thành công',
                    proposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // update proposal detail
    updateProposalDetail(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const proposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                });
                if (!proposal) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Không tìm thấy đề xuất',
                    });
                }
                if (data.employeeIDCreate !== proposal.employeeIDCreate) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_FORBIDDEN,
                        message: 'Bạn không phải người tạo đề xuất này',
                    });
                }
                if (proposal.status !== 'PENDING') {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_FORBIDDEN,
                        message: 'Chỉ có thể cập nhật khi đề xuất đang chờ duyệt',
                    });
                }
                // update proposal detail
                // xóa hết detail cũ
                await ProposalDetail.destroy({
                    where: { proposalID: data.proposalID },
                    transaction,
                });
                // thêm lại detail mới
                await ProposalDetail.bulkCreate(
                    data.proposalDetails.map((item) => ({
                        ...item,
                        proposalID: data.proposalID,
                    })),
                    { transaction },
                );

                // Lấy lại proposal kèm danh sách detail
                const updatedProposal = await Proposal.findOne({
                    where: { proposalID: data.proposalID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails', // phải đúng alias
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    transaction,
                });

                await transaction.commit();

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật chi tiết đề xuất thành công',
                    proposal: updatedProposal,
                });
            } catch (err) {
                await transaction.rollback();
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    // get proposal by warehouseID
    getProposalByWarehouse(warehouseID, page) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    where: { warehouseID: warehouseID },
                    include: [
                        {
                            model: ProposalDetail,
                            as: 'proposalDetails',
                            include: [
                                { model: Product, as: 'product' },
                                { model: Unit, as: 'unit' },
                            ],
                        },
                        { model: Employee, as: 'employeeCreate' },
                        { model: Employee, as: 'approver' },
                        { model: Warehouse, as: 'warehouse' },
                    ],
                    order: [['createdAt', 'DESC']], // để bản mới nhất lên trước
                };

                if (page) {
                    const offset = (page - 1) * LIMIT_PAGE;

                    options.limit = LIMIT_PAGE;
                    options.offset = offset;
                }

                const proposals = await Proposal.findAll(options);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đề xuất theo kho thành công',
                    proposals,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
}

module.exports = new ProposalService();
