const EmployeeService = require('../services/EmployeeService');

class EmployeeController {
    // post /employee-detail
    async getEmployee(req, res) {
        try {
            const { employeeID } = req.body;
            const { statusHttp, ...response } = await EmployeeService.findEmployee(employeeID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: err.message,
            });
        }
    }
    async getAllEmployee(req, res) {
        try {
            const { statusHttp, ...response } = await EmployeeService.findAllEmployee();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json({
                status: 'ERR',
                message: err.message,
            });
        }
    }
}

module.exports = new EmployeeController();
