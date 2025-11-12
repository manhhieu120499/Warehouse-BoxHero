const { default: dialogFlowConstant } = require('../constants/DialogFlowCXFlag');
const dotenv = require('dotenv');
const DialogFlowCXService = require('../services/DialogFlowCXService');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class DialogFlowCXController {
    async handleDialogFlowCXCall(req, res) {
        try {
            const tag = req.body.fulfillmentInfo.tag;
            const params = req.body.sessionInfo.parameters;

            switch (tag) {
                case dialogFlowConstant.CHECK_INVENTORY_PRODUCT: {
                    const { product_code } = params; // Use params as needed
                    const response = await DialogFlowCXService.checkInventoryProduct(product_code);
                    return res.status(HTTP_OK).json(response);
                }
                case dialogFlowConstant.BATCH_OF_PRODUCT: {
                    const { product_code } = params; // Use params as needed
                    const response = await DialogFlowCXService.batchOfProduct(product_code);
                    return res.status(HTTP_OK).json(response);
                }
                default: {
                    const response = await DialogFlowCXService.default();
                    return res.status(HTTP_OK).json(response);
                }
            }
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
    async chatWithDialogFlowCX(req, res) {
        try {
            const { message, sessionId } = req.body;
            const { statusHttp, ...response } = await DialogFlowCXService.chatWithDialogFlowCX(message, sessionId);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
}

module.exports = new DialogFlowCXController();
