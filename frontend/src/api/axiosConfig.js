import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getAssetUrl = (assetPath) => {
  if (!assetPath || assetPath.startsWith('http')) return assetPath;
  return `${API_URL.replace(/\/api\/?$/, '')}${assetPath}`;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isAuthRefreshRequest = requestUrl.includes('/auth/me');

    if (status === 401 && !isLoginRequest && !isAuthRefreshRequest) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;