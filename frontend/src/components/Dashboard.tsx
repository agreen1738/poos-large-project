// Dashboard.tsx - Main dashboard with sidebar and content layout
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import authService from '../services/authService';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import analyticsService from '../services/analyticsService';
import './Dashboard.css';
import Transactions from './Transactions';
import Analytics from './Analytics';
import Settings from './Settings';
import Accounts from './Accounts';

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Get user data from authService
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  function doLogout() {
    authService.logout();
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Wealth Tracker</h2>
          <p>Hello {user?.firstName || 'User'}!</p>
        </div>

        <div className="sidebar-icons">
          <button className="icon-btn">
            <img src="/images/bell.png" alt="Notifications" className="icon-img" />
          </button>
          <button className="icon-btn" onClick={() => setActivePage('settings')}>
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
          <h1>Hello {user?.firstName || 'User'}!</h1>
          <button className="icon-btn">
            <img src="/images/user.png" alt="Profile" className="icon-img" />
          </button>
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
function DashboardContent() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Colors for each category
  const COLORS = {
    'Savings': '#FFD700',
    'Living': '#4A90E2',
    'Hobbies': '#FF8C42',
    'Gambling': '#999999'
  };

  useEffect(() => {
    fetchAllData();
  }, [currentDate]);

  async function fetchAllData() {
    setLoading(true);
    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchCategoryData(),
        fetchTransactions(),
        fetchAccounts()
      ]);
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoryData() {
    try {
      const data = await analyticsService.getCategoryAnalytics('all');
      setCategoryData(data.categories || []);
    } catch (error) {
      console.log('Error loading category data:', error);
      setCategoryData([]);
    }
  }

  async function fetchTransactions() {
    try {
      const transactionsData = await transactionService.getTransactions();
      // Ensure dates are in YYYY-MM-DD format
      const formattedTransactions = transactionsData.map(t => ({
        ...t,
        date: new Date(t.date).toISOString().split('T')[0]
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.log('Error loading transactions:', error);
      setTransactions([]);
    }
  }

  async function fetchAccounts() {
    try {
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.log('Error loading accounts:', error);
      setAccounts([]);
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getTransactionsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get total balance from all accounts
  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + (account.balanace || 0), 0);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Accounts Section */}
      <div className="dashboard-card accounts-card">
        <h3>ACCOUNTS</h3>
        <div className="accounts-list">
          {accounts.length > 0 ? (
            accounts.slice(0, 3).map((account) => (
              <div key={account._id} className="account-item">
                <span>****{account.accountNumber.toString().slice(-4)}</span>
                <span className="amount">${account.balanace.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="no-data">No accounts found</div>
          )}
          {accounts.length > 3 && (
            <div className="account-item more-accounts">
              <span>+{accounts.length - 3} more accounts</span>
              <span className="amount total-label">Total: ${getTotalBalance().toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown Section */}
      <div className="dashboard-card breakdown-card">
        <h3>MONTHLY BREAKDOWN</h3>
        {categoryData.length > 0 ? (
          <>
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
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </div>
            <div className="chart-legend">
              {categoryData.map((category) => (
                <div key={category.name} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[category.name as keyof typeof COLORS] }}></span>
                  <span>- {category.name} (${category.value.toFixed(2)})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No spending data available</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Add transactions to see breakdown</p>
          </div>
        )}
      </div>

      {/* Upcoming Changes Section with Calendar */}
      <div className="dashboard-card upcoming-card">
        <h3>UPCOMING CHANGES</h3>
        <div className="calendar-with-sidebar">
          <div className="mini-calendar">
            <div className="calendar-header-mini">
              <button onClick={previousMonth} className="calendar-nav-btn-mini">←</button>
              <h4>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
              <button onClick={nextMonth} className="calendar-nav-btn-mini">→</button>
            </div>

            <div className="calendar-grid-mini">
              <div className="calendar-weekday-mini">S</div>
              <div className="calendar-weekday-mini">M</div>
              <div className="calendar-weekday-mini">T</div>
              <div className="calendar-weekday-mini">W</div>
              <div className="calendar-weekday-mini">T</div>
              <div className="calendar-weekday-mini">F</div>
              <div className="calendar-weekday-mini">S</div>

              {[...Array(startingDayOfWeek)].map((_, index) => (
                <div key={`empty-${index}`} className="calendar-day-mini empty"></div>
              ))}

              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1;
                const dayTransactions = getTransactionsForDate(day);
                const hasTransactions = dayTransactions.length > 0;
                const isSelected = selectedDate?.getDate() === day && 
                                  selectedDate?.getMonth() === currentDate.getMonth() &&
                                  selectedDate?.getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={day}
                    className={`calendar-day-mini ${hasTransactions ? 'has-transactions' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      }
                    }}
                  >
                    <span className="day-number-mini">{day}</span>
                    {hasTransactions && (
                      <div className="transaction-indicator-mini">
                        {dayTransactions.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Sidebar */}
          {selectedDate && (
            <div className="transactions-sidebar-mini">
              <div className="transactions-sidebar-header">
                <h4>{monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</h4>
                <button onClick={() => setSelectedDate(null)} className="close-sidebar-btn">×</button>
              </div>
              <div className="transactions-sidebar-list">
                {getTransactionsForDate(selectedDate.getDate()).length > 0 ? (
                  getTransactionsForDate(selectedDate.getDate()).map((transaction) => {
                    const account = accounts.find(a => a._id === transaction.accountId);
                    return (
                      <div key={transaction._id || transaction.id} className="transaction-item-mini">
                        <div className="transaction-name">{transaction.name || 'Transaction'}</div>
                        <div className="transaction-details">
                          <span className={`category-tag-mini category-${transaction.category.toLowerCase()}`}>
                            {transaction.category}
                          </span>
                          <span className="transaction-amount-mini">${Math.abs(transaction.amount).toFixed(2)}</span>
                        </div>
                        {account && (
                          <div className="transaction-account">
                            <small>{account.accountName}</small>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-transactions-mini">No transactions</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="dashboard-card transactions-card">
        <h3>RECENT TRANSACTIONS</h3>
        {recentTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => {
                const date = new Date(transaction.date);
                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <tr key={transaction._id || transaction.id}>
                    <td>{formattedDate}</td>
                    <td>{transaction.name || 'Transaction'}</td>
                    <td>${Math.abs(transaction.amount).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;