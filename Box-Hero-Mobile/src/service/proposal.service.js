import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchProposal = async (type = 'warehouse', id, status = 'COMPLETED', page = 1) => {
    try {
        const option = {};
        if (type == 'warehouse') option.warehouseID = id;
        else option.employeeIDCreate = id;
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const res = await request.post(
            '/proposal/filter-proposal',
            {
                status,
                page,
                ...option,
            },
            {
                headers: {
                    token: `Beare ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchProposalMissingOrderPurchase = async () => {
    try {
        const token = await parseToken('tokenUser');

        const res = await request.get('/proposal/get-proposal-missing', {
            params: {
                warehouseID: token.warehouseID,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeid: token.employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchFilterProposal = async (params) => {
    try {
        const token = await parseToken('tokenUser');

        const res = await request.post(
            '/proposal/filter-proposal',
            {
                ...params,
                warehouseID: token.warehouseID,
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
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const createOrderReleaseProposal = async (data) => {
    try {
        const tokenUser = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post('/proposal/create-release-proposal', data, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeID: tokenUser.employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        return res;
    } catch (err) {
        console.log(err);
        throw new Error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
    }
};

export const getAllOrderReleaseProposal = async (page = 1, optionFilter = {}) => {
    try {
        const tokenUser = await parseToken('tokenUser');

        const res = await request.get('/proposal/get-release-proposal', {
            params: {
                page,
                ...optionFilter,
            },
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: tokenUser.warehouseID,
            },
        });
        return res.data;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};

export const getOrderReleaseProposal = async (orderReleaseProposalID) => {
    try {
        const tokenUser = await parseToken('tokenUser');

        const res = await request.get(`/proposal/get-release-proposal-detail/${orderReleaseProposalID}`, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: tokenUser.warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return err;
    }
};

export const updateStatusOrderReleaseProposal = async (data) => {
    try {
        const tokenUser = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.post('/proposal/approve-release-proposal', data, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeID: tokenUser.employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        if (res && res.data.status === 'OK') {
            Alert.alert('Thông báo', 'Cập nhật trạng thái phiếu đề xuất xuất thành công');
        }
        return res;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return err;
    }
};

export const searchOrderReleaseProposal = async (orderReleaseProposalID, option = {}) => {
    try {
        const tokenUser = await parseToken('tokenUser');
        const res = await request.post(
            '/proposal/search-release-proposal',
            {
                orderReleaseProposalID,
                ...option,
            },
            {
                headers: {
                    token: `Bearer ${tokenUser.accessToken}`,
                    employeeID: tokenUser.employeeID,
                },
            },
        );
        return res;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return err;
    }
};

export const getAllOrderReleaseProposalCanApply = async () => {
    try {
        const tokenUser = await parseToken('tokenUser');

        const res = await request.get('/proposal/get-release-order-proposals-can-apply', {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: tokenUser.warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};
