import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
import { styleMessage } from '../constants';

export const fetchProposal = async (type = 'warehouse', id, status = 'COMPLETED', page = 1) => {
    try {
        const option = {};
        if (type == 'warehouse') option.warehouseID = id;
        else option.employeeIDCreate = id;
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/proposal/filter-proposal',
            {
                status,
                page,
                ...option,
            },
            {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const fetchProposalMissingOrderPurchase = async () => {
    try {
        const token = parseToken('tokenUser');

        const warehouse = parseToken('warehouse');
        const res = await request.get('/api/proposal/get-proposal-missing', {
            params: {
                warehouseID: warehouse.warehouseID,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeid: token.employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const fetchFilterProposal = async (params) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/proposal/filter-proposal',
            {
                ...params,
                warehouseID: warehouse.warehouseID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
