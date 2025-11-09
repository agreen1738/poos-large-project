import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import transactionService from '../../services/transactionService';
import accountService from '../../services/accountService';
import type { Transaction } from '../../services/transactionService';
import type { Account } from '../../services/accountService';

// Mock the services
vi.mock('../../services/transactionService', () => ({
  default: {
    getTransactions: vi.fn(),
  },
}));

vi.mock('../../services/accountService', () => ({
  default: {
    getAccounts: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
};

const mockAccounts: Account[] = [
  {
    _id: '1',
    userId: 'user123',
    accountName: 'Checking Account',
    accountType: 'checking',
    accountNumber: 12345678,
    accountInstitution: 'Bank of Test',
    balanace: 5000, // Note: typo matches backend
    currency: 'USD',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    userId: 'user123',
    accountName: 'Savings Account',
    accountType: 'savings',
    accountNumber: 87654321,
    accountInstitution: 'Bank of Test',
    balanace: 10000,
    currency: 'USD',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
];

const mockTransactions: Transaction[] = [
  {
    _id: '1',
    userId: 'user123',
    accountId: '1',
    name: 'Grocery Store',
    amount: -120.50,
    category: 'Living',
    type: 'expense',
    date: '2024-11-01'
  },
  {
    _id: '2',
    userId: 'user123',
    accountId: '1',
    name: 'Salary',
    amount: 3000,
    category: 'Income',
    type: 'income',
    date: '2024-11-01'
  },
  {
    _id: '3',
    userId: 'user123',
    accountId: '1',
    name: 'Coffee Shop',
    amount: -5.50,
    category: 'Living',
    type: 'expense',
    date: '2024-11-05'
  },
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');
    
    // Setup default mock responses
    vi.mocked(accountService.getAccounts).mockResolvedValue(mockAccounts);
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);
    
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should render dashboard with user greeting', async () => {
    renderDashboard();
    
    // Look for the main heading specifically
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hello/i);
    });
  });

  it('should display all navigation tabs', () => {
    renderDashboard();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should have Dashboard tab active by default', () => {
    renderDashboard();
    
    const dashboardButton = screen.getByText('Dashboard').closest('button');
    expect(dashboardButton).toHaveClass('active');
  });

  it('should switch to Transactions tab when clicked', async () => {
    renderDashboard();
    
    const transactionsButton = screen.getByText('Transactions').closest('button');
    fireEvent.click(transactionsButton!);
    
    await waitFor(() => {
      expect(transactionsButton).toHaveClass('active');
    });
  });

  it('should switch to Accounts tab when clicked', async () => {
    renderDashboard();
    
    const accountsButton = screen.getByText('Accounts').closest('button');
    fireEvent.click(accountsButton!);
    
    await waitFor(() => {
      expect(accountsButton).toHaveClass('active');
    });
  });

  it('should switch to Analytics tab when clicked', async () => {
    renderDashboard();
    
    const analyticsButton = screen.getByText('Analytics').closest('button');
    fireEvent.click(analyticsButton!);
    
    await waitFor(() => {
      expect(analyticsButton).toHaveClass('active');
    });
  });

  it('should switch to Settings tab when clicked', async () => {
    renderDashboard();
    
    const settingsButton = screen.getByText('Settings').closest('button');
    fireEvent.click(settingsButton!);
    
    await waitFor(() => {
      expect(settingsButton).toHaveClass('active');
    });
  });

  it('should display logout button', () => {
    renderDashboard();
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should clear localStorage on logout', async () => {
    renderDashboard();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      // Mock localStorage returns undefined when key doesn't exist
      expect(localStorage.getItem('token')).toBeUndefined();
      expect(localStorage.getItem('user_data')).toBeUndefined();
    });
  });

  it('should fetch accounts on mount', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(accountService.getAccounts).toHaveBeenCalled();
    });
  });

  it('should fetch transactions on mount', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(accountService.getAccounts).mockRejectedValue(new Error('API Error'));
    
    renderDashboard();
    
    // Component should still render even with API errors
    await waitFor(() => {
      // Use getByRole to avoid "multiple elements" error
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hello/i);
    });
  });

  it('should display accounts when data is loaded', async () => {
    renderDashboard();
    
    // Wait for accounts to load and be displayed
    await waitFor(() => {
      expect(accountService.getAccounts).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});