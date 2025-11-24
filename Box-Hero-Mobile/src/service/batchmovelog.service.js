import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';
import { Alert } from 'react-native';

export const filterBatchMoveLog = async (filters) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.get(`/batch-move-log/filter`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: filters,
        });
        return res;
    } catch (err) {
        console.log('filterBatchMoveLog failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};
