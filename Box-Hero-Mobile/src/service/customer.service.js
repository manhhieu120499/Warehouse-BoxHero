import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const searchCustomer = async (customerID) => {
    try {
        const res = await request.get(`/customer/find/${customerID}`);
        return res?.data?.data || null;
    } catch (error) {
        console.error('Error searching customer:', error);
        throw new Error(error.response.data);
    }
};

export const getAllCustomer = async (page) => {
    try {
        const res = await request.get(`/customer/list?page=${page}`);
        return res?.data || [];
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return err;
    }
};

export const filterCustomer = async (optionFilter = {}) => {
    try {
        const res = await request.post('/customer/filter', {
            ...optionFilter,
        });
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const fetchListHistoryOrderCustomer = async (customerID, page = 1) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

        const res = await request.post(
            `/customer/history-customer`,
            {
                customerID: customerID,
                page,
            },
            {
                headers: {
                    token: `Beare ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouseID,
                },
            },
        );
        return res.data || null;
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const getCustomerNotPagination = async () => {
    try {
        const res = await request.get(`/customer/list-not-pagination`);
        return res?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};
