import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';

export const getLogByProductID = async ({ productID, page }) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.get(`/product-quantity-log/get-log`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: {
                productID,
                page,
            },
        });
        return res;
    } catch (err) {
        console.log('getLogByProductID failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};

export const filterProductQuantityLog = async (filters) => {
    try {
        const token = await parseToken('tokenUser');
        const warehouse = await parseToken('warehouse');

        const res = await request.get(`/product-quantity-log/filter`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: filters,
        });
        return res;
    } catch (err) {
        console.log('filterProductQuantityLog failed', err);
        Alert.alert(
            'Lỗi',
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );

        return err;
    }
};
