// src/services/api.ts - Base API configuration
import axios from 'axios';

// Get API URL from environment variable (default to port 5050)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const method = error.config?.method || '';
      
      // Don't auto-logout for these specific scenarios:
      // 1. POST /login - Login attempt with wrong credentials
      // 2. POST /register - Registration (shouldn't get 401, but just in case)
      // 3. DELETE /me - Account deletion with wrong password
      // 4. PUT /me/password - Password change with wrong current password
      const isLoginAttempt = url.includes('/login') && method === 'post';
      const isRegisterAttempt = url.includes('/register') && method === 'post';
      const isAccountDeletion = url.includes('/me') && method === 'delete';
      const isPasswordChange = url.includes('/me/password') && method === 'put';
      
      if (!isLoginAttempt && !isRegisterAttempt && !isAccountDeletion && !isPasswordChange) {
        // Auto-logout only for unexpected 401 errors (expired token, etc.)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;