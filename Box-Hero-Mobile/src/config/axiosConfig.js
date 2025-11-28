import axios from 'axios';

// 1. Quản lý trạng thái Loading Global
let setLoadingCallback = null;

/**
 * Đặt callback để xử lý trạng thái loading global (ví dụ: hiển thị/ẩn spinner).
 * @param {function} callback - Hàm nhận một boolean (true: bắt đầu loading, false: kết thúc).
 */
export const setGlobalLoadingHandler = (callback) => {
    setLoadingCallback = callback;
};

// 2. Khởi tạo Instance Axios
// Thay thế import.meta.env.VITE_API_BASE_URL bằng một hằng số
const API_BASE_URL = 'https://unchafed-unrapturously-pablo.ngrok-free.dev/api';

const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 3000,
});

// 3. Interceptor Request: BẬT Loading
request.interceptors.request.use(
    (config) => {
        // Bật loading spinner trước khi gửi request
        if (setLoadingCallback) setLoadingCallback(true);
        return config;
    },
    (error) => {
        // Tắt nếu có lỗi ngay lập tức (ví dụ: lỗi mạng)
        if (setLoadingCallback) setLoadingCallback(false);
        return Promise.reject(error);
    },
);

// 4. Interceptor Response: TẮT Loading
request.interceptors.response.use(
    (response) => {
        // Tắt loading spinner khi request thành công
        if (setLoadingCallback) setLoadingCallback(false);
        return response;
    },
    (error) => {
        // Tắt loading spinner khi request thất bại (bao gồm 4xx, 5xx)
        if (setLoadingCallback) setLoadingCallback(false);
        return Promise.reject(error);
    },
);

export default request;
