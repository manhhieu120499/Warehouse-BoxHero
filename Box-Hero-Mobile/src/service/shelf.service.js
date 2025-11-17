import axiosInstance from '../config/axiosConfig';

export const getAllShelfOfWarehouse = async ({ warehouseID, token, employeeID }) => {
    try {
        const res = await request.get(`/api/shelf/get-shelf-of-warehouse/${warehouseID}`, {
            headers: {
                token: `Bearer ${token}`,
                employeeid: employeeID,
            },
        });
        return res.data;
    } catch (err) {
        console.log(err);
        ToastMessage({
            status: 'error',
            message: Array.isArray(err.response.data.message)
                ? err.response.data.message[0]
                : err.response.data.message,
        });

        return err;
    }
};
