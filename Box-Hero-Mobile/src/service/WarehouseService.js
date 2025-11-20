import request from '../config/axiosConfig';
import axiosInstance from '../config/axiosConfig';

export const getWarehouseDetail = async (token, warehouseID, employeeID) => {
    try {
        const res = await request.get(`/warehouse/get-detail/${warehouseID}`, {
            headers: {
                token: `Bearer ${token}`,
                employeeid: employeeID,
            },
        });

        return res.data || null;
    } catch (err) {
        console.log(err);
        return null;
    }
};
