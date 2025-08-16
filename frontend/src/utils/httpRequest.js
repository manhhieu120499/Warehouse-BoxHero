import axios from 'axios';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const get = async (path, options = {}) => {
    const response = await request.get(path, options);
    return response.data;
};

export const post = async (path, options = {}, token, employeeID) => {
    const response = await request.post(path, options, {
        headers: {
            token: `Beare ${token}`,
            employeeid: employeeID,
        }
    });
    return response.data;
};

export const put = async (path, options = {}, token, employeeID) => {
    try {
        console.log(`Making PUT request to ${path} with options:`, options);
        const response = await request.put(path, options, {
            headers: {
                token: `Bearer ${token}`,
                employeeID: employeeID,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error occurred while making PUT request:', error);
        throw error;
    }
};

export const del = async (path, token, employeeId) => {
    const response = await request.delete(path, {
        headers: {
            token: `Beare ${token}`,
            employeeid: employeeId,
        },
    });
    return response.data;
};

export default request;
