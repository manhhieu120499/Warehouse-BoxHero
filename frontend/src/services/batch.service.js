import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getBatchesWithoutLocation = async (warehouseID) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/batch/batches-without-location`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const countBatchesWithoutLocation = async () => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const warehouseID = warehouse.warehouseID;

        const res = await request.get(`/api/batch/count-batches-without-location`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const getAllBatchWithProductID = async (productID) => {
    try {
        const warehouse = parseToken('warehouse');
        const token = parseToken('tokenUser');
        const res = await request.get(`/api/batch/all-batch-by-product`, {
            params: {
                productID: productID,
                warehouseID: warehouse.warehouseID,
            },

            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        return res?.data?.data || null;
    } catch (err) {
        console.log(err);
        throw new Error(err.response.data);
    }
};

export const getBoxContainProduct = async (warehouseID, productID) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.get(`/api/batch/boxes-containing-product`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                productID: productID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const getBoxContainBatch = async (warehouseID, batchID) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.get(`/api/batch/boxes-containing-batch`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                batchID: batchID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
