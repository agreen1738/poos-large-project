// src/services/authService.ts - Authentication service matching backend
import api from './api';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;  // ADDED: Backend requires phone
  password: string;
  confirmPassword: string;  // ADDED: Backend requires confirmPassword
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  status?: string;
}

export interface LoginResponse {
  token: string;
}

class AuthService {
  // Login user - returns only token (works without /api/me endpoint)
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('Sending login request to:', '/login');
      console.log('Login payload:', { login: credentials.login, password: '***' });
      
      // Step 1: Get token from login endpoint
      // Backend expects { login, password } and uses login as email
      const loginResponse = await api.post<LoginResponse>('/login', {
        login: credentials.login,
        password: credentials.password
      });
      console.log('Login response received:', loginResponse.data);
      
      const token = loginResponse.data.token;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Step 2: Store token
      localStorage.setItem('auth_token', token);
      console.log('Token stored successfully');
      
      // Step 3: Try to fetch user details, but if /api/me doesn't exist, create a temporary user
      try {
        console.log('Attempting to fetch user data from /me endpoint...');
        const user = await this.getCurrentUserFromAPI();
        console.log('User data received:', user);
        localStorage.setItem('user_data', JSON.stringify(user));
        return user;
      } catch (meError) {
        console.warn('/api/me endpoint not available, creating temporary user data');
        // If /api/me doesn't exist, decode token or use temporary data
        const tempUser: User = {
          _id: 'temp',
          firstName: credentials.login.split('@')[0], // Use email username as firstName
          lastName: 'User',
          email: credentials.login,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user_data', JSON.stringify(tempUser));
        return tempUser;
      }
    } catch (error: any) {
      console.error('Login error details:', error.response?.data || error);
      console.error('Status code:', error.response?.status);
      
      // Clear any stored data on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Provide more specific error messages
      let errorMessage = 'Login failed';
      if (error.response?.status === 401) {
        // Check if it's an email verification error
        if (error.response?.data?.error?.includes('not verified')) {
          errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
        } else {
          errorMessage = 'Invalid email or password';
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Register new user - returns success message (no auto-login)
  async register(data: RegisterData): Promise<void> {
    try {
      console.log('Sending registration request with data:', data);
      console.log('Number of fields:', Object.keys(data).length);
      
      // Backend expects exactly 6 fields: firstName, lastName, email, phone, password, confirmPassword
      const response = await api.post('/register', data);
      console.log('Registration successful:', response.data);
      // Registration successful - user needs to verify email then login
    } catch (error: any) {
      console.error('Registration failed!');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Full error:', error);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  // Fetch current user from /api/me endpoint
  async getCurrentUserFromAPI(): Promise<User> {
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch user data';
      throw new Error(errorMessage);
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get current user data from localStorage
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Refresh user data from API
  async refreshUserData(): Promise<User> {
    try {
      const user = await this.getCurrentUserFromAPI();
      localStorage.setItem('user_data', JSON.stringify(user));
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to refresh user data';
      throw new Error(errorMessage);
    }
  }
}

export default new AuthService();