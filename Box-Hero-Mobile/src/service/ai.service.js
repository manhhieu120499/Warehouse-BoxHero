import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';
import { Alert } from 'react-native';

export const chatWithBot = async (payload) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/dialog-flow-cx/chat`,
            { ...payload },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse?.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response?.data?.message)
                ? err.response.data.message[0]
                : err.response?.data?.message || 'Có lỗi xảy ra',
        );
        console.log(err);

        return err;
    }
};

export const initChatBox = async () => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/dialog-flow-cx/init`,
            {},
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse?.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response?.data?.message)
                ? err.response.data.message[0]
                : err.response?.data?.message || 'Có lỗi xảy ra',
        );
        console.log(err);

        return err;
    }
};
