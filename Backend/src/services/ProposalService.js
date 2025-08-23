const dotenv = require('dotenv');
const db = require('../../models');
const { Op } = require('sequelize');
const Proposal = db.Proposal;
const ProposalDetail = db.ProposalDetail;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

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
}

module.exports = new ProposalService();
