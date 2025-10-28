const express = require('express');
const { authUserIsManager, authUser, authUserIsManagerOrStockReceiver } = require('../middleware/AuthMiddleware');
const ProposalController = require('../controllers/ProposalController');
const {
    checkCreateProposal,
    checkUpdateStatusProposal,
    checkUpdateProposalDetail,
    checkCreateOrderReleaseProposal,
    checkStatusOrderReleaseProposal,
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

router.post(
    '/create-release-proposal',
    authUserIsManager,
    checkCreateOrderReleaseProposal,
    validate,
    ProposalController.createOrderReleaseProposal,
);

router.get('/get-release-proposal', authUserIsManager, ProposalController.getAllOrderReleaseProposal);
router.get('/get-release-proposal-detail/:id', authUserIsManager, ProposalController.getOrderReleaseProposalDetail);
router.get(
    '/get-release-order-proposals-can-apply',
    authUserIsManager,
    ProposalController.getOrderReleaseProposalsCanApply,
);
router.post(
    '/approve-release-proposal',
    authUserIsManager,
    checkStatusOrderReleaseProposal,
    validate,
    ProposalController.approveOrderReleaseProposal,
);
router.post('/search-release-proposal', authUser, ProposalController.searchOrderReleaseProposal);

module.exports = router;
