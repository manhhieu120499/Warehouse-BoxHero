import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import parseToken from '../utilities/parseToken';

export const validatePayloadCreateReceipt = (payload) => {
    if (!payload.proposalID) {
        Alert.alert('Lỗi', 'Vui lòng chọn phiếu đề xuất');
        return false;
    }
    if (!payload.orderPurchaseID) {
        Alert.alert('Lỗi', 'Vui lòng tạo mã phiếu');
        return false;
    }
    if (payload.orderPurchaseDetails.length === 0) {
        Alert.alert('Lỗi', 'Vui lòng thêm danh sách sản phẩm cần nhập');
        return false;
    }
    for (const item of payload.orderPurchaseDetails) {
        if (!item.batchID) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã lô');
            return false;
        }
        if (!item.supplierID) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã nhà cung cấp');
            return false;
        }
        if (!item.productID) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã sản phẩm');
            return false;
        }
        if (!item.unitID) {
            Alert.alert('Lỗi', 'Vui lòng chọn đơn vị tính');
            return false;
        }
        if (!item.manufactureDate) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày sản xuất tại phần thêm chi tiết');
            return false;
        }
        if (!item.expiryDate) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn tại phần thêm chi tiết');
            return false;
        }
        if (!item.actualQuantity) {
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng sản phẩm thực tế');
            return false;
        }
        if (item.positions.length == 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn vị trí lưu trữ tại phần thêm chi tiết');
            return false;
        }
    }
    return true;
};

export const saveReceipt = async (payload) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.post(
            '/order-purchase/create-order-purchase',
            {
                ...payload,
                employeeID: employeeID,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeID: employeeID,
                    warehouseID: warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchOrderMissing = async (warehouseID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/order-purchase-missing/filter`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
            },
            params: {
                warehouseID: warehouseID,
                employeeID: employeeID,
                status: 'PENDING',
            },
        });
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchOrderMissingById = async (orderMissingID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/order-purchase-missing/get-by-id/${orderMissingID}`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
            },
            params: {
                warehouseID: warehouseID,
                employeeID: employeeID,
                status: 'PENDING',
            },
        });
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};
export const filterOrderMissing = async (params) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/order-purchase-missing/filter`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
            },
            params: {
                ...params,
            },
        });
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchOrderPurchase = async (page = 1) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/order-purchase/get-all-order-purchase`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
            params: {
                employeeID: employeeID,
                page: page,
            },
        });
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const filterOrderPurchase = async (filter) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);

        const warehouseID = await parseToken('warehouse').warehouseID;

        const res = await request.get(`/order-purchase/filter-order-purchase`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                ...filter,
            },
        });
        return res;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const validatePayloadCreateReceiptMissing = (payload) => {
    if (!payload.orderPurchaseID) {
        Alert.alert('Lỗi', 'Vui lòng tạo mã phiếu');
        return false;
    }
    for (const item of payload.orderPurchaseDetails) {
        if (!item.batchID) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã lô');
            return false;
        }
        if (!item.manufactureDate) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày sản xuất');
            return false;
        }
        if (!item.expiryDate) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn');
            return false;
        }
        if (!item.actualQuantity) {
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng nhập bù');
            return false;
        }
    }
    return true;
};

export const saveOrderRelease = async (payload) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const res = await request.post('/order-release/create', payload, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
        });
        return res;
    } catch (err) {
        console.log('login failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};

export const filterOrderRelease = async (params) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            '/order-release/filter-order-release',
            {
                ...params,
                warehouseID: warehouse.warehouseID,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        console.log('login failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};

export const fetchOrderReleaseById = async (orderReleaseID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const warehouse = await parseToken('warehouse');

        const res = await request.get(`/order-release/get-order-release-by-id/${orderReleaseID}`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeid: employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data;
    } catch (err) {
        console.log('fetchOrderReleaseById failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};

export const completeOrderRelease = async (orderReleaseID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/order-release/complete`,
            {
                orderReleaseID,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        console.log('completeOrderRelease failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};

export const refuseOrderRelease = async (orderReleaseID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const warehouse = await parseToken('warehouse');

        const res = await request.post(
            `/order-release/refuse`,
            {
                orderReleaseID,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        console.log('refuseOrderRelease failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};
