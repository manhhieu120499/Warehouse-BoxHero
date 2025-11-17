import { ToastMessage } from '../components/common/ToastMessage';
import axiosInstance from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { getEmployeeInfo } from './EmployeeService';
import request from '../config/axiosConfig';

export const login = async (userName, password) => {
    try {
        const res = await request.post('/account/sign-in', {
            email: userName,
            password: password,
        });
        if (res.data.status === 'OK') {
            // parse token
            const token = jwtDecode(res.data.accessToken);

            // get employee
            const employeeInfo = await getEmployeeInfo(
                res.data.accessToken,
                token.payload.email,
                token.payload.employeeID,
            );

            // lưu thông tin vào local
            await AsyncStorage.setItem('user', JSON.stringify(employeeInfo));

            ToastMessage({ status: 'success', message: 'Đăng nhập thành công' });
            return true;
        }
    } catch (err) {
        console.log('login failed', err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });
        return false;
    }
};
