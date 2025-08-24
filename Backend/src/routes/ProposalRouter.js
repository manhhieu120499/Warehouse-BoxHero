const express = require('express');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');
const ProposalController = require('../controllers/ProposalController');
const {
    checkCreateProposal,
    checkUpdateStatusProposal,
    checkUpdateProposalDetail,
} = require('../validates/proposal.validation');
const validate = require('../validates/validate');
const router = express.Router();

router.post('/create-proposal', checkCreateProposal, validate, authUserIsManager, ProposalController.createProposal);
router.post(
    '/update-status-proposal',
    checkUpdateStatusProposal,
    validate,
    authUserIsManager,
    ProposalController.approveProposal,
);
router.post(
    '/update-proposal-detail',
    checkUpdateProposalDetail,
    validate,
    authUser,
    ProposalController.updateProposalDetail,
);
router.get('/get-proposal/warehouse', authUserIsManager, ProposalController.getProposalByWarehouse);

module.exports = router;
