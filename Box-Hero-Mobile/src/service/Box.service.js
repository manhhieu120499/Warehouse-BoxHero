import { ToastMessage } from '../components/common/ToastMessage';
import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';

export const getBoxDetails = async (warehouseID, boxID) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/batch/box-details`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                boxID: boxID,
            },
        });
        return res;
    } catch (err) {
        console.log('getBoxDetails failed', err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });

        return err;
    }
};

export const getBoxesByBatchID = async (batchID) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get(`/api/batch-box/get-all-box-by-batch-id`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: {
                batchID: batchID,
            },
        });
        return res?.data?.boxes || [];
    } catch (err) {
        console.log('getBoxesByBatchID failed', err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });
        return err;
    }
};
