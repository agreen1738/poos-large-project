// src/services/accountService.ts - Account service matching backend
import api from './api';

export interface Account {
  _id: string;
  userId: string;
  accountName: string;
  accountType: string;
  balanace: number; // Note: backend has typo "balanace"
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string; // Maps to accountName in backend
  type: string; // Maps to accountType in backend
}

export interface UpdateAccountData {
  accountName?: string;
  accountType?: string;
  balanace?: number;
  currency?: string;
  isActive?: boolean;
}

class AccountService {
  // Get all accounts for the logged-in user
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await api.get('/accounts');
      return response.data; // Backend returns array directly
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch accounts';
      throw new Error(errorMessage);
    }
  }

  // Create a new account
  async createAccount(data: CreateAccountData): Promise<void> {
    try {
      await api.post('/account', data);
      // Backend returns success message, not the created account
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create account';
      throw new Error(errorMessage);
    }
  }

  // Update an existing account
  async updateAccount(id: string, data: UpdateAccountData): Promise<void> {
    try {
      await api.put(`/account/${id}`, data);
      // Backend returns success message
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update account';
      throw new Error(errorMessage);
    }
  }

  // Delete an account
  async deleteAccount(id: string): Promise<void> {
    try {
      await api.delete(`/account/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete account';
      throw new Error(errorMessage);
    }
  }
}

export default new AccountService();