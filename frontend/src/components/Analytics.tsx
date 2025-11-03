// Analytics.tsx - Analytics page with pie chart
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import accountService from '../services/accountService';
import analyticsService from '../services/analyticsService';
import type { Account } from '../services/accountService';
import type { CategoryData } from '../services/analyticsService';
import './Analytics.css';

function Analytics() {
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for each category
  const COLORS: { [key: string]: string } = {
    'Savings': '#FFD700',
    'Living': '#4A90E2',
    'Hobbies': '#FF8C42',
    'Gambling': '#999999'
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchCategoryData();
  }, [selectedAccount]);

  async function fetchAccounts() {
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      setError(error.message || 'Failed to load accounts');
    }
  }

  async function fetchCategoryData() {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getCategoryAnalytics(selectedAccount);
      setCategoryData(data.categories || []);
    } catch (error: any) {
      console.error('Error fetching category data:', error);
      setError(error.message || 'Failed to load analytics');
      setCategoryData([]);
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
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.accountName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading analytics...</div>
      ) : categoryData.length === 0 || totalSpending === 0 ? (
        <div className="no-data-state">
          <p>No spending data available for the selected account.</p>
          <p>Start adding transactions to see your spending breakdown!</p>
        </div>
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
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
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
              {categoryData
                .filter(category => category.value > 0)
                .map((category) => (
                <div key={category.name} className="category-item">
                  <div className="category-header">
                    <div className="category-name">
                      <span 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[category.name] }}
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
                        backgroundColor: COLORS[category.name]
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