import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

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
        throw new Error(err);
    }
};

export const fetchProposalMissingOrderPurchase = async () => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

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
        console.log(err);

        throw new Error(err);
    }
};
