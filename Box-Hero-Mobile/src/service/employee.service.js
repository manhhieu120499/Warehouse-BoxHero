import request from '../config/axiosConfig';
import axiosInstance from '../config/axiosConfig';

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
