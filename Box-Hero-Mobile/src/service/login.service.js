import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { getEmployeeInfo } from './employee.service';
import request from '../config/axiosConfig';
import { getWarehouseDetail } from './WarehouseService';
import { setEmployee } from '../redux/employee.reducer';
import { setWarehouse } from '../redux/warehouse.reducer';

export const login = async (userName, password, dispatch) => {
    try {
        const res = await request.post('/account/sign-in', {
            email: userName,
            password: password,
        });
        if (res.data.status === 'OK') {
            // parse token
            const { employeeID, roles, warehouseID, email } = jwtDecode(res.data.accessToken).payload;

            // get employee
            const employeeInfo = await getEmployeeInfo(res.data.accessToken, email, employeeID);
            dispatch(setEmployee({ ...employeeInfo, roles }));

            if (warehouseID) {
                const responseWH = await getWarehouseDetail(res.data.accessToken, warehouseID, employeeID);
                await AsyncStorage.setItem('warehouse', JSON.stringify({ ...responseWH.warehouse }));
                dispatch(setWarehouse(responseWH.warehouse));
            }

            // lưu thông tin vào local
            await AsyncStorage.setItem(
                'tokenUser',
                JSON.stringify({
                    email,
                    employeeID,
                    accessToken: res.data.accessToken,
                    refreshToken: res.data.refreshToken,
                }),
            );

            return res;
        }
    } catch (err) {
        console.log('login failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        return null;
    }
};
