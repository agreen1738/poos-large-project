// src/services/accountService.ts - Account service
import api from './api';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  institution: string;
  userId: string;
}

export interface CreateAccountData {
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  institution: string;
}

export interface UpdateAccountData {
  name?: string;
  type?: string;
  balance?: number;
  accountNumber?: string;
  institution?: string;
}

class AccountService {
  // Get all accounts for the logged-in user
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await api.get('/accounts');
      return response.data.accounts || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }

  // Get a single account by ID
  async getAccountById(id: string): Promise<Account> {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data.account || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch account');
    }
  }

  // Create a new account
  async createAccount(data: CreateAccountData): Promise<Account> {
    try {
      const response = await api.post('/account', data);
      return response.data.account || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create account');
    }
  }

  // Update an existing account
  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    try {
      const response = await api.put(`/account/${id}`, data);
      return response.data.account || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update account');
    }
  }

  // Delete an account
  async deleteAccount(id: string): Promise<void> {
    try {
      await api.delete(`/account/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
}

export default new AccountService();