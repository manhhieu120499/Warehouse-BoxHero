import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAllInventoryCheck = async (warehouseID, currentPage) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/inventory-check/get-all-inventory-checks`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                page: currentPage,
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
export const updateInventoryCheck = async (status, inventoryCheckID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.post(
            `/inventory-check/update-inventory-checks`,
            {
                warehouseID: warehouseID,
                status: status,
                inventoryCheckID: inventoryCheckID,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeID: employeeID,
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
export const getFilterInventoryCheck = async ({
    warehouseID,
    inventoryCheckID,
    status,
    checkStatus,
    createdAt,
    employeeName,
    currentPage,
}) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.get(`/inventory-check/filter-inventory-checks`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                inventoryCheckID: inventoryCheckID,
                status: status,
                checkStatus: checkStatus,
                createdAt: createdAt,
                employeeName: employeeName,
                page: currentPage,
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
