import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import request from '../config/axiosConfig';

export const getAllCategories = async (page = 1) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const result = await request.get(`/category-product/get-all-categories?page=${page}`, {
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
            },
        });
        return result.data || null;
    } catch (err) {
        console.log(err);
        return;
    }
};

export const createCategoryProduct = async ({ categoryID, categoryName }) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const result = await request.post(
            '/category-product/create-category',
            {
                categoryID,
                categoryName,
            },
            {
                headers: {
                    token: `Beare ${accessToken}`,
                    employeeid: employeeID,
                },
            },
        );
        Alert.alert('Thành công', result.message);
        return result || null;
    } catch (err) {
        console.log(err);
        Alert.alert('Lỗi', err.response.data.message);
        return;
    }
};

export const searchCategoryProduct = async (keyword) => {
    try {
        const userJSON = await AsyncStorage.getItem('tokenUser');
        const { employeeID, accessToken } = JSON.parse(userJSON);
        const res = await request.post(
            '/category-product/search-category',
            {
                categoryID: keyword,
            },
            {
                headers: {
                    token: `Beare ${accessToken}`,
                    employeeid: employeeID,
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
        return err.response.data;
    }
};
