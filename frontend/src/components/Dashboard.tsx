// Dashboard.tsx - Main dashboard with sidebar and content layout
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import authService from '../services/authService';
import './Dashboard.css';
import Transactions from './Transactions';
import Analytics from './Analytics';
import Settings from './Settings';
import Accounts from './Accounts';

interface Transaction {
  id: number;
  date: string;
  name: string;
  amount: number;
  category: string;
}

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
        return <DashboardContent user={user} />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
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
function DashboardContent({ user }: { user: any }) {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Colors for each category
  const COLORS = {
    'Savings': '#FFD700',
    'Living': '#4A90E2',
    'Hobbies': '#FF8C42',
    'Gambling': '#999999'
  };

  useEffect(() => {
    fetchCategoryData();
    fetchTransactions();
  }, [currentDate]);

  async function fetchCategoryData() {
    try {
      // Use sample data for now since analytics endpoint may not exist yet
      console.log('Using sample category data');
      setCategoryData([
        { name: 'Savings', value: 1200 },
        { name: 'Living', value: 1500 },
        { name: 'Hobbies', value: 200 },
        { name: 'Gambling', value: 100 }
      ]);
    } catch (error) {
      console.log('Error loading category data:', error);
    }
  }

  async function fetchTransactions() {
    try {
      // Use sample data for now since transactions endpoint may not exist yet
      console.log('Using sample transaction data');
      setTransactions([
        { id: 1, date: '2025-10-04', name: 'Uniqlo', amount: 158.67, category: 'Hobbies' },
        { id: 2, date: '2025-10-04', name: 'Publix', amount: 389.67, category: 'Living' },
        { id: 3, date: '2025-10-03', name: 'GameStop', amount: 78.13, category: 'Hobbies' },
        { id: 4, date: '2025-10-15', name: 'Rent Payment', amount: 1200.00, category: 'Living' },
        { id: 5, date: '2025-10-20', name: 'Savings Deposit', amount: 500.00, category: 'Savings' },
        { id: 6, date: '2025-10-12', name: 'Restaurant', amount: 45.32, category: 'Living' },
      ]);
    } catch (error) {
      console.log('Error loading transactions:', error);
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
                  getTransactionsForDate(selectedDate.getDate()).map((transaction) => (
                    <div key={transaction.id} className="transaction-item-mini">
                      <div className="transaction-name">{transaction.name}</div>
                      <div className="transaction-details">
                        <span className={`category-tag-mini category-${transaction.category.toLowerCase()}`}>
                          {transaction.category}
                        </span>
                        <span className="transaction-amount-mini">${transaction.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
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
  return <Accounts />;
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
  return <Settings />;
}

export default Dashboard;