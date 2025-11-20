import { ToastMessage } from '../components/common/ToastMessage';
import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';

export const updateLocationBatch = async (warehouseID, locations, employeeID) => {
    try {
        const token = await parseToken('tokenUser');

        const res = await request.post(
            `/batch-box/update-location-batch`,
            {
                warehouseID,
                locations,
                employeeID: token.employeeID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: token.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        console.log('updateLocationBatch failed', err.response.data.message);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });

        return err;
    }
};
export const changeLocationBatch = async (payload) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/batch-box/change-location-batch`,
            { ...payload, employeeID: token.employeeID },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        console.log('changeLocationBatch failed', err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });

        return err;
    }
};
export const suggestBoxes = async (payload) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/batch-box/suggest-boxes`,
            { warehouseID: warehouse.warehouseID, ...payload },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        console.log('suggestBoxes failed', err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });

        return err;
    }
};
