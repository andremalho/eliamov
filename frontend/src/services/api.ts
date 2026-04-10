import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eliamov_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eliamov_token');
      window.location.href = '/login';
    }
    // Don't retry on 429 - just reject silently
    if (error.response?.status === 429) {
      console.warn('Rate limited - too many requests');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default api;
