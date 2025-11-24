import { Alert } from 'react-native';
import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getReportStockWarehouse = async (option = { quarter: '', year: '' }) => {
    try {
        const token = await parseToken('tokenUser');

        const res = await request.post(
            '/report',
            {
                ...option,
            },
            {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: token.warehouseID,
                },
            },
        );
        return res.data || null;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        throw new Error(err);
    }
};
