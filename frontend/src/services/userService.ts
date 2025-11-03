// src/services/userService.ts - User service for profile management
import api from './api';

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  // Get current user information
  async getUserInfo(): Promise<User> {
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch user info';
      throw new Error(errorMessage);
    }
  }

  // Update user information
  async updateUserInfo(data: UpdateUserData): Promise<void> {
    try {
      await api.put('/me', data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update user info';
      throw new Error(errorMessage);
    }
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.put('/me/password', data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to change password';
      throw new Error(errorMessage);
    }
  }

  // Delete user account (requires password verification)
  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete('/me', {
        data: { password }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete account';
      throw new Error(errorMessage);
    }
  }
}

export default new UserService();