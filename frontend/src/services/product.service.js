import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
export const fetchProduct = async (page = 1) => {
    try {
        // call api
        const tokenUser = parseToken('tokenUser');
        const res = await request.get('/api/product/list', {
            params: {
                page,
            },
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
            },
        });
        return res?.data?.products || [];
    } catch (err) {
        throw new Error(err);
    }
};

export const fetchProductById = async (productID) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const res = await request.get(`/api/product?productID=${productID}`, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
            },
        });
        return res?.data?.product || null;
    } catch {
        return null;
    }
};
