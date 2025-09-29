import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const updateLocationBatch = async (warehouseID, locations) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.post(
            `/api/batch-box/update-location-batch`,
            {
                warehouseID,
                locations,
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
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
