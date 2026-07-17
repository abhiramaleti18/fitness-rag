import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';
const MAX_SESSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

const api = axios.create({
    baseURL: API_BASE_URL,
});

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    window.location.href = '/login';
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const loginTime = localStorage.getItem('loginTime');

    if (token && loginTime && Date.now() - Number(loginTime) > MAX_SESSION_MS) {
        logout();
        return Promise.reject(new Error('Session expired'));
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
        }
        return Promise.reject(error);
    }
);

export default api;