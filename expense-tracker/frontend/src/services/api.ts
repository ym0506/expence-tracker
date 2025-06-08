import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token utility functions
const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Basic token validation
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem('token');
      return null;
    }
    
    return token;
  } catch (error) {
    // Invalid token format
    localStorage.removeItem('token');
    return null;
  }
};

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status, error.response?.data, error.message);
    }
    if (error.response?.status === 401) {
      // Redux 상태 초기화
      store.dispatch(logout());
      
      // 사용자에게 알림
      console.warn('세션이 만료되었습니다. 다시 로그인해주세요.');
      
      // 로그인 페이지로 리다이렉트 (현재 페이지 정보 보존)
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;