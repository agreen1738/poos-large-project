// Accounts.tsx - Accounts page with add account functionality
import { useState, useEffect } from 'react';
import accountService from '../services/accountService';
import type { Account } from '../services/accountService';
import './Accounts.css';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Form state - includes all 5 required fields
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'Checking',
    accountNumber: '',
    accountInstitution: '',
    balance: '0.00'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  async function fetchAccounts() {
    setLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create account using service with all required fields
      await accountService.createAccount({
        accountName: formData.accountName,
        accountType: formData.accountType,
        accountNumber: parseInt(formData.accountNumber),
        accountInstitution: formData.accountInstitution,
        balance: parseFloat(formData.balance)
      });
      
      // Refresh accounts list
      await fetchAccounts();
      
      // Close modal and reset form
      setShowModal(false);
      setFormData({
        accountName: '',
        accountType: 'Checking',
        accountNumber: '',
        accountInstitution: '',
        balance: '0.00'
      });

      showNotification('success', 'Account added successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to add account');
    }
  };

  const handleDeleteClick = (accountId: string, accountName: string) => {
    setAccountToDelete({ id: accountId, name: accountName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await accountService.deleteAccount(accountToDelete.id);
      
      // Refresh accounts list
      await fetchAccounts();
      
      // Close modal and reset
      setShowDeleteModal(false);
      setAccountToDelete(null);

      showNotification('success', 'Account deleted successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete account');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + (account.balanace || 0), 0);
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div 
          className={`notification-toast notification-${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'slideIn 0.3s ease-out',
            backgroundColor: notification.type === 'success' ? '#d4edda' : 
                           notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
            color: notification.type === 'success' ? '#155724' : 
                   notification.type === 'error' ? '#721c24' : '#0c5460',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : 
                                 notification.type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'success' && <span>✓</span>}
            {notification.type === 'error' && <span>✗</span>}
            {notification.type === 'info' && <span>ℹ</span>}
            {notification.message}
          </span>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'inherit',
              padding: '0 0 0 16px',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Add CSS animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="accounts-page">
        {/* Summary Section */}
        <div className="accounts-summary">
          <div className="summary-card total-balance">
            <h3>Total Balance</h3>
            <p className="balance-amount">${getTotalBalance().toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Accounts</h3>
            <p className="account-count">{accounts.length}</p>
          </div>
          <div className="summary-card">
            <h3>Account Types</h3>
            <p className="account-types">{new Set(accounts.map(a => a.accountType)).size}</p>
          </div>
        </div>

        {/* Accounts List Section */}
        <div className="accounts-list-section">
          <div className="accounts-list-header">
            <h3>My Accounts</h3>
            <button onClick={() => setShowModal(true)} className="add-account-btn">
              + Add Account
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading accounts...</div>
          ) : (
            <div className="accounts-grid">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <div key={account._id} className="account-card">
                    <div className="account-card-header">
                      <div className="account-type-badge" data-type={account.accountType.toLowerCase()}>
                        {account.accountType}
                      </div>
                      <h4>{account.accountName}</h4>
                      <button 
                        className="account-delete-btn"
                        onClick={() => handleDeleteClick(account._id, account.accountName)}
                        title="Delete account"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="account-card-body">
                      <div className="account-info">
                        <span className="info-label">Account Number</span>
                        <span className="info-value">****{account.accountNumber.toString().slice(-4)}</span>
                      </div>
                      <div className="account-info">
                        <span className="info-label">Institution</span>
                        <span className="info-value">{account.accountInstitution}</span>
                      </div>
                      <div className="account-info">
                        <span className="info-label">Currency</span>
                        <span className="info-value">{account.currency}</span>
                      </div>
                      <div className="account-info">
                        <span className="info-label">Status</span>
                        <span className="info-value">{account.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="account-balance">
                        <span className="balance-label">Balance</span>
                        <span className={`balance-value ${(account.balanace || 0) < 0 ? 'negative' : 'positive'}`}>
                          ${Math.abs(account.balanace || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-accounts">
                  <p>No accounts found. Add your first account to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Account</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="account-form">
              <div className="form-group">
                <label htmlFor="accountName">Account Name</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="e.g., My Checking Account"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountType">Account Type</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit">Credit Card</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  type="number"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567890"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountInstitution">Financial Institution</label>
                <input
                  type="text"
                  id="accountInstitution"
                  name="accountInstitution"
                  value={formData.accountInstitution}
                  onChange={handleInputChange}
                  placeholder="e.g., Chase Bank, Wells Fargo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="balance">Initial Balance</label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && accountToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close-btn" onClick={handleCancelDelete}>×</button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete the account <strong>"{accountToDelete.name}"</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button onClick={handleCancelDelete} className="cancel-btn">
                No, Cancel
              </button>
              <button onClick={handleConfirmDelete} className="delete-confirm-btn">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Accounts;