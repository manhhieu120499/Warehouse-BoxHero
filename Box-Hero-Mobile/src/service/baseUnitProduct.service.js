import { Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import request from '../config/axiosConfig';

export const getAllBaseUnitProduct = async () => {
    try {
        const res = await request.get('/base-unit-product/get-all');
        return res.data;
    } catch (err) {
        console.log(err);
        return null;
    }
};
