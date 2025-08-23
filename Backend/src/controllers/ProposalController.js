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
}

module.exports = new ProposalController();
