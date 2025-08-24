const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const ProposalController = require('../controllers/ProposalController');
const { checkCreateProposal, checkUpdateStatusProposal } = require('../validates/proposal.validation');
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

module.exports = router;
