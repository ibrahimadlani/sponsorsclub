import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('[SC API]', error);
        return Promise.reject(error);
    }
);

export default apiClient;