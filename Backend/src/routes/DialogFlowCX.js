const express = require('express');
const DialogFlowCXController = require('../controllers/DialogFlowCXController');
const router = express.Router();

router.post('/', DialogFlowCXController.handleDialogFlowCXCall);
router.post('/chat', DialogFlowCXController.chatWithDialogFlowCX);

module.exports = router;
