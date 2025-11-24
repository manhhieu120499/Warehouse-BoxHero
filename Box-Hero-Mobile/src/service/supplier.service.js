import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';

export const findSupplier = async (supplierID) => {
    try {
        const res = await request.get(`/supplier/${supplierID}`);
        return res.data.supplier ? res.data.supplier : null;
    } catch (err) {
        throw new Error(err);
    }
};

export const getAllSupplier = async (page) => {
    try {
        const res = await request.get(`/supplier?page=${page}`);
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

export const filterSupplier = async (optionFilter = {}) => {
    try {
        const res = await request.get('/supplier', {
            params: {
                ...optionFilter,
            },
        });
        console.log('data', res);
        return res?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const createSupplier = async (supplierData) => {
    try {
        const token = await parseToken('tokenUser');
        const res = await request.post(
            '/supplier',
            { ...supplierData },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeid: token.employeeID,
                },
            },
        );
        if (res?.data?.status === 'OK') Alert.alert('Thông báo', res?.data?.message || 'Tạo nhà cung cấp thành công');
        return res?.data || null;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response?.data?.message)
                ? err.response.data.message[0]
                : err.response?.data?.message || 'Không thể tạo nhà cung cấp',
        );
        throw err;
    }
};

export const updateSupplier = async (supplierID, supplierData) => {
    try {
        const token = await parseToken('tokenUser');
        const res = await request.put(`/supplier/${supplierID}`, supplierData, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeid: token.employeeID,
            },
        });
        if (res?.data?.status === 'OK')
            Alert.alert('Thông báo', res?.data?.message || 'Cập nhật nhà cung cấp thành công');
        return res?.data || null;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response?.data?.message)
                ? err.response.data.message[0]
                : err.response?.data?.message || 'Không thể cập nhật nhà cung cấp',
        );
        throw err;
    }
};

export const findProductOfSupplier = async (supplierID) => {
    try {
        const tokenUser = await parseToken('tokenUser');
        // call api
        const response = await request.get(`/supplier/provided-products/${supplierID}`, {
            headers: {
                token: `Beare ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
            },
        });
        return response?.data?.products || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};
