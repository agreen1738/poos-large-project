// Accounts.tsx - Accounts page with add account functionality
import { useState, useEffect } from 'react';
import accountService from '../services/accountService';
import type { Account } from '../services/accountService';
import './Accounts.css';

function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Checking'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      // Show error to user
      alert(error.message || 'Failed to load accounts');
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
      // Create account using service
      await accountService.createAccount({
        name: formData.name,
        type: formData.type
      });
      
      // Refresh accounts list
      await fetchAccounts();
      
      // Close modal and reset form
      setShowModal(false);
      setFormData({
        name: '',
        type: 'Checking'
      });
      
      alert('Account added successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to add account');
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + (account.balanace || 0), 0);
  };

  return (
    <>
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
                    </div>
                    <div className="account-card-body">
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
                <label htmlFor="name">Account Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., My Checking Account"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Account Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
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
    </>
  );
}

export default Accounts;