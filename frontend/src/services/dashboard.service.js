import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getStatisticalInventory = async (type, year) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.get(`/api/dashboard/statistical-inventory`, {
            params: {
                type,
                year,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
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
export const getStatisticalImportExport = async (type, year) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.get(`/api/dashboard/statistical-import-export`, {
            params: {
                type,
                year,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
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

export const getStaticPercentUseWarehouse = async () => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get(
            `/api/dashboard/statistical-percent-used-warehouse?warehouseID=${warehouse.warehouseID}`,
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            },
        );
        return res.data.data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const getStaticTopProduct = async () => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
    } catch (err) {
        console.log(err);
        return;
    }
};

export const getProductLowMinStock = async (page = 1) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get(`/api/dashboard/statistical-min-stock-product`, {
            params: {
                page,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        return;
    }
};
