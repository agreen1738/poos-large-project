import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [totalWealth, setTotalWealth] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData(): Promise<void> {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/dashboard', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.error) {
        setError(res.error);
      } else {
        setTotalWealth(res.totalWealth || 0);
        setAccounts(res.accounts || []);
      }
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="wealth-summary">
        <h2>Total Net Worth</h2>
        <p className="total-wealth">${totalWealth.toFixed(2)}</p>
      </div>

      <div className="accounts-section">
        <h3>Your Accounts</h3>
        {error && <div className="error-message">{error}</div>}
        
        {accounts.length > 0 ? (
          <div className="accounts-grid">
            {accounts.map((account: any) => (
              <div key={account.id} className="account-card">
                <h4>{account.name}</h4>
                <p className="account-type">{account.type}</p>
                <p className="account-balance">${account.balance.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No accounts found. Create your first account to get started!</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;