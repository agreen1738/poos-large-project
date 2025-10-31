// src/services/transactionService.ts - Transaction service for managing transactions
import api from './api';

export interface Transaction {
  _id?: string;
  id?: number;
  userId?: string;
  accountId?: string;
  amount: number;
  category: string;
  type: string;
  date: string;  // Changed from Date to string for frontend compatibility
  name?: string;
}

export interface CreateTransactionData {
  name: string;
  amount: number;
  category: string;
  type: string;
  date: Date;
}

class TransactionService {
  // Get all transactions for the logged-in user
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transactions';
      throw new Error(errorMessage);
    }
  }

  // Get transactions for a specific account
  async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    try {
      const response = await api.get(`/transactions/${accountId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch account transactions';
      throw new Error(errorMessage);
    }
  }

  // Get a single transaction
  async getTransaction(accountId: string, transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get(`/transactions/${accountId}/${transactionId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transaction';
      throw new Error(errorMessage);
    }
  }

  // Create a new transaction and update account balance
  async createTransaction(accountId: string, data: CreateTransactionData): Promise<void> {
    try {
      // Backend expects: amount, category, type, date
      // The amount should already be negative from the frontend
      await api.post(`/transactions/${accountId}`, {
        amount: data.amount,
        category: data.category,
        type: data.type,
        date: data.date
      });
      // Backend automatically updates the account balance
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create transaction';
      throw new Error(errorMessage);
    }
  }

  // Delete a transaction and restore account balance
  async deleteTransaction(accountId: string, transactionId: string): Promise<void> {
    try {
      await api.delete(`/transactions/${accountId}/${transactionId}`);
      // Backend automatically restores the account balance
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete transaction';
      throw new Error(errorMessage);
    }
  }
}

export default new TransactionService();