// Accounts.tsx - Accounts page with add account functionality
import { useState, useEffect } from 'react';
import './Accounts.css';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  institution: string;
}

function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Checking',
    balance: '',
    accountNumber: '',
    institution: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();
      if (!res.error) {
        setAccounts(res.accounts || []);
      }
    } catch (error) {
      console.log('Using sample data for testing');
      // Sample data for testing
      setAccounts([
        { id: 1, name: 'Chase Checking', type: 'Checking', balance: 1204.45, accountNumber: '****1234', institution: 'Chase Bank' },
        { id: 2, name: 'Savings Account', type: 'Savings', balance: 13901.28, accountNumber: '****5678', institution: 'Bank of America' },
        { id: 3, name: 'Credit Card', type: 'Credit', balance: -67.89, accountNumber: '****9012', institution: 'Capital One' },
        { id: 4, name: 'Investment Account', type: 'Investment', balance: 25430.50, accountNumber: '****3456', institution: 'Vanguard' },
      ]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend integration will go here
    console.log('Account to be added:', formData);
    
    // Close modal and reset form
    setShowModal(false);
    setFormData({
      name: '',
      type: 'Checking',
      balance: '',
      accountNumber: '',
      institution: ''
    });
    
    // Show confirmation
    alert('Account will be added when backend is ready!');
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const getAccountsByType = (type: string) => {
    return accounts.filter(account => account.type === type);
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
            <p className="account-types">{new Set(accounts.map(a => a.type)).size}</p>
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
                  <div key={account.id} className="account-card">
                    <div className="account-card-header">
                      <div className="account-type-badge" data-type={account.type.toLowerCase()}>
                        {account.type}
                      </div>
                      <h4>{account.name}</h4>
                    </div>
                    <div className="account-card-body">
                      <div className="account-info">
                        <span className="info-label">Institution</span>
                        <span className="info-value">{account.institution}</span>
                      </div>
                      <div className="account-info">
                        <span className="info-label">Account Number</span>
                        <span className="info-value">{account.accountNumber}</span>
                      </div>
                      <div className="account-balance">
                        <span className="balance-label">Balance</span>
                        <span className={`balance-value ${account.balance < 0 ? 'negative' : 'positive'}`}>
                          ${Math.abs(account.balance).toFixed(2)}
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

              <div className="form-group">
                <label htmlFor="institution">Financial Institution</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">Account Number (Last 4 digits)</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="balance">Current Balance</label>
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
    </>
  );
}

export default Accounts;