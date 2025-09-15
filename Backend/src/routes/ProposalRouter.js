const express = require('express');
const { authUserIsManager, authUser, authUserIsManagerOrStockReceiver } = require('../middleware/AuthMiddleware');
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
    ProposalController.updateStatusProposal,
);
router.post(
    '/update-proposal-detail',
    checkUpdateProposalDetail,
    validate,
    authUser,
    ProposalController.updateProposalDetail,
);
router.get('/get-proposal/warehouse', authUserIsManager, ProposalController.getProposalByWarehouse);
router.get('/get-proposal/employee', authUser, ProposalController.getProposalByEmployee);
router.get('/get-proposal-detail/:id', authUserIsManager, ProposalController.getProposalDetail);
router.get('/get-proposal-missing', authUserIsManager, ProposalController.getProposalMissing);

router.post('/filter-proposal', authUserIsManagerOrStockReceiver, ProposalController.filterProposal);
module.exports = router;
