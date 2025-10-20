// Dashboard.tsx - Main dashboard with sidebar and content layout
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  function doLogout() {
    localStorage.removeItem('user_data');
    window.location.href = '/';
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      case 'transactions':
        return <TransactionsContent />;
      case 'accounts':
        return <AccountsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Wealth Tracker</h2>
          <p>Hello [Name]!!</p>
        </div>

        <div className="sidebar-icons">
          <button className="icon-btn">
            <img src="/images/bell.png" alt="Notifications" className="icon-img" />
          </button>
          <button className="icon-btn">
            <img src="/images/settings.png" alt="Settings" className="icon-img" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${activePage === 'transactions' ? 'active' : ''}`}
            onClick={() => setActivePage('transactions')}
          >
            Transactions
          </button>
          <button
            className={`nav-btn ${activePage === 'accounts' ? 'active' : ''}`}
            onClick={() => setActivePage('accounts')}
          >
            Accounts
          </button>
          <button
            className={`nav-btn ${activePage === 'analytics' ? 'active' : ''}`}
            onClick={() => setActivePage('analytics')}
          >
            Analytics
          </button>
          <button
            className={`nav-btn ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>Hello [Name]!!</h1>
          <p className="page-title">Dashboard</p>
          <button className="profile-btn">👤</button>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>

        <button className="logout-btn" onClick={doLogout}>
          Logout
        </button>
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ user }: { user: any }) {
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Colors for each category
  const COLORS = {
    'Savings': '#FFD700',
    'Living': '#4A90E2',
    'Hobbies': '#FF8C42',
    'Gambling': '#999999'
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  async function fetchCategoryData() {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const userParsed = JSON.parse(userData);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/analytics/categories`, {
        method: 'POST',
        body: JSON.stringify({ userId: userParsed.id, accountId: null }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();
      if (!res.error) {
        setCategoryData(res.categories || []);
      }
    } catch (error) {
      console.log('Using sample data for dashboard');
      // Sample data for testing
      setCategoryData([
        { name: 'Savings', value: 1200 },
        { name: 'Living', value: 1500 },
        { name: 'Hobbies', value: 200 },
        { name: 'Gambling', value: 100 }
      ]);
    }
  }

  return (
    <div className="dashboard-grid">
      {/* Accounts Section */}
      <div className="dashboard-card accounts-card">
        <h3>ACCOUNTS</h3>
        <div className="accounts-list">
          <div className="account-item">
            <span>XXXXXXXX</span>
            <span className="amount">$1,204.45</span>
          </div>
          <div className="account-item">
            <span>XXXXXXXX</span>
            <span className="amount">$13,901.28</span>
          </div>
          <div className="account-item">
            <span>XXXXXXXX</span>
            <span className="amount">$67.89</span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Section */}
      <div className="dashboard-card breakdown-card">
        <h3>MONTHLY BREAKDOWN</h3>
        <div className="chart-container">
          <PieChart width={280} height={200}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}`} />
          </PieChart>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FFD700' }}></span>
            <span>- Savings</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4A90E2' }}></span>
            <span>- Living</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF8C42' }}></span>
            <span>- Hobbies</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#999999' }}></span>
            <span>- Gambling</span>
          </div>
        </div>
      </div>

      {/* Upcoming Changes Section */}
      <div className="dashboard-card upcoming-card">
        <h3>UPCOMING CHANGES</h3>
        <div className="placeholder-calendar">
          <p>Calendar Placeholder</p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="dashboard-card transactions-card">
        <h3>RECENT TRANSACTIONS</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10/4</td>
              <td>Uniqlo</td>
              <td>$158.67</td>
            </tr>
            <tr>
              <td>10/4</td>
              <td>Publix</td>
              <td>$389.67</td>
            </tr>
            <tr>
              <td>10/3</td>
              <td>GameStop</td>
              <td>$78.13</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Placeholder Components for Other Pages
function TransactionsContent() {
  return (
    <div className="content-section">
      <h2>Transactions</h2>
      <p>Transactions page content coming soon...</p>
    </div>
  );
}

function AccountsContent() {
  return (
    <div className="content-section">
      <h2>Accounts</h2>
      <p>Accounts page content coming soon...</p>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="content-section">
      <h2>Analytics</h2>
      <p>Analytics page content coming soon...</p>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="content-section">
      <h2>Settings</h2>
      <p>Settings page content coming soon...</p>
    </div>
  );
}

export default Dashboard;