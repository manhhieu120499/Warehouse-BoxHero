import axios from 'axios';

const axiosInstance = (option = {}) =>
    axios.create({
        baseURL: 'https://top-knowing-crayfish.ngrok-free.app/api',
        timeout: 3000,
        headers: {
            ...option,
        },
    });

axiosInstance().interceptors.response.use(undefined, async (error) => {
    if (error.response?.status === 401 && error.config?.url === '/account/sign-in') {
        //await refreshToken();
        return axiosInstance(error.config); // Retry original request
    }

    throw error;
});

export default axiosInstance;
