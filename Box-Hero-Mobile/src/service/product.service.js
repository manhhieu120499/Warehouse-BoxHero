import AsyncStorage from '@react-native-async-storage/async-storage';
import request from '../config/axiosConfig';
import { uploadImage } from '../utilities/uploadImage';
import { Alert } from 'react-native';
import parseToken from '../utilities/parseToken';
export const fetchProduct = async (page = 1, optionFilter = {}) => {
    try {
        // call api
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const res = await request.get('/product/list', {
            params: {
                page,
                ...optionFilter,
            },
            headers: {
                token: `Bearer ${accessToken}`,
                employeeid: employeeID,
            },
        });
        return res?.data || [];
    } catch (err) {
        throw new Error(err);
    }
};

export const fetchProductById = async (productID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const res = await request.get(`/product?productID=${productID}`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeid: employeeID,
            },
        });
        return res?.data?.product || null;
    } catch {
        return null;
    }
};

export const getProductById = async (productID, warehouseID) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const warehouse = await parseToken('warehouse');

        const res = await request.get(`/product?productID=${productID}`, {
            headers: {
                token: `Bearer ${accessToken}`,
                employeeID: employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        console.log('res', res.data.product);
        return res.data.product;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const fetchAllProductCanExport = async (status = 'AVAILABLE') => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const res = await request.post(
            '/product/filter-option',
            {
                status,
            },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeid: employeeID,
                },
            },
        );
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const createProduct = async (data) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        //const image = await uploadImage(data.image);
        const res = await request.post(
            '/product/create-product',
            { ...data, image: '' },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeID: employeeID,
                    warehouseID: warehouseID,
                },
            },
        );

        if (res.data.status === 'OK') {
            Alert.alert('Thành công', res.data.message);
            return true;
        }
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return false;
    }
};

export const getProductCanExportById = async (productID, warehouseID) => {
    try {
        const token = await parseToken('tokenUser');

        const res = await request.get(`/product/export/${productID}`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouseID,
            },
        });
        return res?.data?.product || null;
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};

export const handleFilterProduct = async ({ productID, productName, minStock, page }) => {
    try {
        const params = {
            productID,
            productName,
            minStock,
            page,
        };
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const res = await request.get('/product/filter', {
            params,
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
                warehouseid: warehouseID ? warehouseID : null,
            },
        });
        console.log('data 1', res);
        return res.data || null;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);

        return err;
    }
};

export const updateProduct = async (dataUpdate) => {
    try {
        // call api
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);
        const result = await request.put(
            `/product/update/${dataUpdate.productID}`,
            {
                productName: dataUpdate.productName,
                minStock: dataUpdate.minStock,
                status: dataUpdate.status,
            },
            {
                headers: {
                    token: `Beare ${accessToken}`,
                    employeeid: employeeID,
                    warehouseid: warehouseID,
                },
            },
        );
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
        return true;
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        console.log(err);
        return false;
    }
};
