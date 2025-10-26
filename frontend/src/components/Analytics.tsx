// Analytics.tsx - Analytics page with pie chart
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';

function Analytics() {
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Colors for each category
  const COLORS = {
    'Savings': '#FFD700',
    'Living': '#4A90E2',
    'Hobbies': '#FF8C42',
    'Gambling': '#999999'
  };

  useEffect(() => {
    fetchAccounts();
    fetchCategoryData(selectedAccount);
  }, [selectedAccount]);

  async function fetchAccounts() {
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
      console.log('Using sample accounts for testing');
      // Sample data for testing
      setAccounts([
        { id: 1, name: 'Chase Checking', type: 'Checking' },
        { id: 2, name: 'Savings Account', type: 'Savings' },
        { id: 3, name: 'Credit Card', type: 'Credit' }
      ]);
    }
  }

  async function fetchCategoryData(accountId: string) {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/analytics/categories`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user.id,
          accountId: accountId === 'all' ? null : accountId
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();
      if (!res.error) {
        setCategoryData(res.categories || []);
      }
    } catch (error) {
      console.log('Using sample data for testing');
      // Sample data for testing
      setCategoryData([
        { name: 'Savings', value: 1200, percentage: 40 },
        { name: 'Living', value: 1500, percentage: 50 },
        { name: 'Hobbies', value: 200, percentage: 7 },
        { name: 'Gambling', value: 100, percentage: 3 }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const totalSpending = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Spending Analytics</h2>
        <div className="account-selector">
          <label htmlFor="account-select">Account:</label>
          <select 
            id="account-select"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="all">All Accounts</option>
            {accounts.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading analytics...</div>
      ) : (
        <div className="analytics-content">
          <div className="chart-section">
            <h3>Spending by Category</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="category-breakdown">
            <h3>Category Breakdown</h3>
            <div className="total-spending">
              <span>Total Spending:</span>
              <span className="amount">${totalSpending.toFixed(2)}</span>
            </div>
            
            <div className="category-list">
              {categoryData.map((category: any) => (
                <div key={category.name} className="category-item">
                  <div className="category-header">
                    <div className="category-name">
                      <span 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[category.name as keyof typeof COLORS] }}
                      ></span>
                      <span>{category.name}</span>
                    </div>
                    <span className="category-amount">${category.value.toFixed(2)}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-bar-fill"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[category.name as keyof typeof COLORS]
                      }}
                    ></div>
                  </div>
                  <div className="category-percentage">{category.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;