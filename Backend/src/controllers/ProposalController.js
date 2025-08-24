const ProposalService = require('../services/ProposalService');

class ProposalController {
    async createProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.createProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async approveProposal(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.approveProposal(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async updateProposalDetail(req, res) {
        try {
            const { statusHttp, ...response } = await ProposalService.updateProposalDetail(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getProposalByWarehouse(req, res) {
        try {
            const warehouseID = req.headers['warehouseid'];
            const { statusHttp, ...response } = await ProposalService.getProposalByWarehouse(warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new ProposalController();
