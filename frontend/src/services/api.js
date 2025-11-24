import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for non-auth check requests
    if (error.response?.status === 401 && !error.config.url.includes('/auth/me')) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;