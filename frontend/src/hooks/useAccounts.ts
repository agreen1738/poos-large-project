// src/hooks/useAccounts.ts - Custom hook for accounts
import { useState, useEffect } from 'react';
import accountService, { type Account, type CreateAccountData, type UpdateAccountData } from '../services/accountService';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new account
  const createAccount = async (data: CreateAccountData) => {
    try {
      await accountService.createAccount(data);
      // Refetch accounts after creating since backend doesn't return the created account
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Delete account
  const deleteAccount = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      // Filter using _id which is the actual MongoDB field name
      setAccounts(prev => prev.filter(acc => acc._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update account
  const updateAccount = async (id: string, data: UpdateAccountData) => {
    try {
      await accountService.updateAccount(id, data);
      // Refetch accounts after updating since backend doesn't return the updated account
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    deleteAccount,
    updateAccount
  };
}