// src/hooks/useAccounts.ts - Custom hook for accounts
import { useState, useEffect } from 'react';
import accountService, { type Account, type CreateAccountData } from '../services/accountService';

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
      const newAccount = await accountService.createAccount(data);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Delete account
  const deleteAccount = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update account
  const updateAccount = async (id: string, data: Partial<CreateAccountData>) => {
    try {
      const updated = await accountService.updateAccount(id, data);
      setAccounts(prev => prev.map(acc => acc.id === id ? updated : acc));
      return updated;
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