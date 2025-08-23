const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const ProposalController = require('../controllers/ProposalController');
const { checkCreateProposal } = require('../validates/proposal.validation');
const validate = require('../validates/validate');
const router = express.Router();

router.post('/create-proposal', checkCreateProposal, validate, authUserIsManager, ProposalController.createProposal);

module.exports = router;
