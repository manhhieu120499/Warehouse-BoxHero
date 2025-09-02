const db = require('../../models/index');
const Unit = db.Unit;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class UnitService {
    // get all unit
    getAllUnit() {
        return new Promise(async (resolve, reject) => {
            try {
                const unitFind = await Unit.findAll();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: unitFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new UnitService();
