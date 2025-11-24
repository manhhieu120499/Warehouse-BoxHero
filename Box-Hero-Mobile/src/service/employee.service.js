import { Alert } from 'react-native';
import request from '../config/axiosConfig';
import axiosInstance from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';

export const getEmployeeInfo = async (token, employeeEmail, employeeID) => {
    try {
        const res = await request.post(
            '/employee/employee-detail',
            {
                email: employeeEmail,
            },
            {
                headers: {
                    token: `Bearer ${token}`,
                    employeeid: employeeID,
                },
            },
        );
        return res.data.employee || null;
    } catch (err) {
        console.log(err);
    }
};

export const getEmployeeList = async () => {
    try {
        const { employeeID, accessToken } = await parseToken('tokenUser');
        const response = await request.post(
            '/employee/list',
            { employeeID: employeeID },
            {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeid: employeeID,
                },
            },
        );

        return response?.data || [];
    } catch (err) {
        console.log('err', err);
        console.log('fetch employee list err', err.response.data.message);
        return null;
    }
};

export const searchEmployee = async (filter) => {
    try {
        const { employeeID, accessToken } = await parseToken('tokenUser');
        const resultSearch = await request.get('/employee/filter', {
            params: { ...filter },
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
            },
        });

        console.log('response', resultSearch);

        return resultSearch?.data || [];
    } catch (err) {
        console.log(err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return null;
    }
};

export const createEmployee = async (employeeData) => {
    try {
        const { employeeID, accessToken } = await parseToken('tokenUser');
        const res = await request.post('/account/sign-up', employeeData, {
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
                warehouseid: employeeData.warehouseId,
            },
        });
        if (res.data.status === 'OK') {
            Alert.alert('Thông báo', 'Tạo nhân viên thành công');
            return true;
        }
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};

export const updateEmployee = async (updateData) => {
    try {
        const { employeeID, accessToken } = await parseToken('tokenUser');
        const res = await request.put('/employee/update', updateData, {
            headers: {
                token: `Beare ${accessToken}`,
                employeeid: employeeID,
                warehouseid: updateData.warehouseId,
            },
        });
        if (res.data.status === 'OK') {
            Alert.alert('Thông báo', 'Cập nhật nhân viên thành công');
            return true;
        }
    } catch (err) {
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};
