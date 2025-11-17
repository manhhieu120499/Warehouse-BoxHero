import axiosInstance from '../config/axiosConfig';

export const getEmployeeInfo = async (token, employeeEmail, employeeID) => {
    try {
        const res = await axiosInstance({
            token: `Beare ${token}`,
            employeeid: employeeID,
        }).post('/employee/employee-detail', {
            email: employeeEmail,
        });
        return res.data.employee || null;
    } catch (err) {
        console.log(err);
    }
};
