import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import request from '../config/axiosConfig';

export const getStatisticalInventory = async (type, year) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/dashboard/statistical-inventory`, {
            params: {
                type,
                year,
            },
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
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
export const getStatisticalImportExport = async (type, year) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/dashboard/statistical-import-export`, {
            params: {
                type,
                year,
            },
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
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

export const getStaticPercentUseWarehouse = async () => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const res = await request.get(`/dashboard/statistical-percent-used-warehouse?warehouseID=${warehouseID}`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

// lấy top 5 sản phẩm bán nhiều nhất
export const getStaticTopProduct = async () => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const res = await request.get('/dashboard/statistic-product-export-high', {
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
                warehouseid: warehouseID,
            },
        });
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return;
    }
};

export const getProductLowMinStock = async (page = 1) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/dashboard/statistical-min-stock-product`, {
            params: {
                page,
            },
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        return;
    }
};

export const getTopFineProductMinExport = async () => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get('/dashboard/statistical-product-old', {
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
                warehouse: warehouseID,
            },
        });
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return;
    }
};
