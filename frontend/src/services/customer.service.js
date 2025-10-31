import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import toast from 'react-hot-toast';

export const searchCustomer = async (customerID) => {
    try {
        const res = await request.get(`/api/customer/find/${customerID}`);
        return res?.data?.data || null;
    } catch (error) {
        console.error('Error searching customer:', error);
        throw new Error(error.response.data);
    }
};

export const getAllCustomer = async () => {
    try {
        const res = await request.get('/api/customer/list');
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};

export const filterCustomer = async (optionFilter = {}) => {
    try {
        const res = await request.post('/api/customer/filter', {
            ...optionFilter,
        });
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};
