// Transactions.tsx - Transactions page with calendar and list
import { useState, useEffect } from 'react';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import type { Transaction } from '../services/transactionService';
import './Transactions.css';

interface Account {
  _id: string;
  accountName: string;
  accountType: string;
  balanace: number;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFormDate, setSelectedFormDate] = useState(new Date());
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Living',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [currentDate]);

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
    try {
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
      
      // Set first account as default if available
      if (accountsData.length > 0 && !formData.accountId) {
        setFormData(prev => ({
          ...prev,
          accountId: accountsData[0]._id
        }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

  async function fetchTransactions() {
    setLoading(true);
    try {
      const transactionsData = await transactionService.getTransactions();
      // Ensure dates are in YYYY-MM-DD format
      const formattedTransactions = transactionsData.map(t => ({
        ...t,
        date: new Date(t.date).toISOString().split('T')[0]
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      // Use sample data for testing
      setTransactions([
        { id: 1, date: '2025-10-04', name: 'Uniqlo', amount: 158.67, category: 'Hobbies', type: 'expense' },
        { id: 2, date: '2025-10-04', name: 'Publix', amount: 389.67, category: 'Living', type: 'expense' },
        { id: 3, date: '2025-10-03', name: 'GameStop', amount: 78.13, category: 'Hobbies', type: 'expense' },
        { id: 4, date: '2025-10-15', name: 'Rent Payment', amount: 1200.00, category: 'Living', type: 'expense' },
        { id: 5, date: '2025-10-20', name: 'Savings Deposit', amount: 500.00, category: 'Savings', type: 'income' },
        { id: 6, date: '2025-10-12', name: 'Restaurant', amount: 45.32, category: 'Living', type: 'expense' },
      ]);
    } finally {
      setLoading(false);
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
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    return dayTransactions;
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

  const filteredTransactions = selectedDate
    ? transactions.filter(t => t.date === `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`)
    : transactions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(selectedFormDate.getFullYear(), selectedFormDate.getMonth(), day);
    const dateStr = selected.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      date: dateStr
    }));
    setShowDatePicker(false);
  };

  const previousFormMonth = () => {
    setSelectedFormDate(new Date(selectedFormDate.getFullYear(), selectedFormDate.getMonth() - 1));
  };

  const nextFormMonth = () => {
    setSelectedFormDate(new Date(selectedFormDate.getFullYear(), selectedFormDate.getMonth() + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      showNotification('error', 'Please select an account');
      return;
    }

    try {
      // Convert amount to negative if it's positive (spending money)
      const amount = Math.abs(parseFloat(formData.amount)) * -1;
      
      await transactionService.createTransaction(formData.accountId, {
        name: formData.name,
        amount: amount,
        category: formData.category,
        type: 'expense',
        date: new Date(formData.date)
      });
      
      // Refresh transactions and accounts list
      await fetchTransactions();
      await fetchAccounts();
      
      // Close modal and reset form
      setShowModal(false);
      setFormData({
        name: '',
        amount: '',
        category: 'Living',
        accountId: accounts.length > 0 ? accounts[0]._id : '',
        date: new Date().toISOString().split('T')[0]
      });

      showNotification('success', 'Transaction added successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (accountId: string, transactionId: string) => {
    if (deletingTransactionId) return; // Prevent multiple deletes
    
    setDeletingTransactionId(transactionId);
    try {
      await transactionService.deleteTransaction(accountId, transactionId);
      
      // Refresh transactions and accounts list
      await fetchTransactions();
      await fetchAccounts();

      showNotification('success', 'Transaction deleted successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete transaction');
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const getFormDateDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth: formDaysInMonth, startingDayOfWeek: formStartingDay } = getFormDateDaysInMonth(selectedFormDate);

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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

      <div className="transactions-page">
        <div className="transactions-header">
          <h2>Transactions</h2>
          <button className="add-transaction-btn" onClick={() => setShowModal(true)}>
            + Add Transaction
          </button>
        </div>

        <div className="transactions-content">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button onClick={previousMonth} className="calendar-nav-btn">←</button>
              <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <button onClick={nextMonth} className="calendar-nav-btn">→</button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekday">Sun</div>
              <div className="calendar-weekday">Mon</div>
              <div className="calendar-weekday">Tue</div>
              <div className="calendar-weekday">Wed</div>
              <div className="calendar-weekday">Thu</div>
              <div className="calendar-weekday">Fri</div>
              <div className="calendar-weekday">Sat</div>

              {[...Array(startingDayOfWeek)].map((_, index) => (
                <div key={`empty-${index}`} className="calendar-day empty"></div>
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
                    className={`calendar-day ${hasTransactions ? 'has-transactions' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      }
                    }}
                  >
                    <span className="day-number">{day}</span>
                    {hasTransactions && (
                      <div className="transaction-indicator">
                        {dayTransactions.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading transactions...</div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.length > 0 ? (
                <table className="transactions-table-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Account</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const account = accounts.find(a => a._id === transaction.accountId);
                      return (
                        <tr key={transaction._id || transaction.id}>
                          <td>{transaction.date}</td>
                          <td>{account ? account.accountName : 'Unknown'}</td>
                          <td>
                            <span className={`category-badge category-${transaction.category.toLowerCase()}`}>
                              {transaction.category}
                            </span>
                          </td>
                          <td className="amount-cell">${Math.abs(transaction.amount).toFixed(2)}</td>
                          <td className="actions-cell">
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteTransaction(transaction.accountId as string, transaction._id as string)}
                              disabled={deletingTransactionId === transaction._id}
                              title="Delete transaction"
                            >
                              <img src="/images/trash.png" alt="Delete" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="no-transactions">
                  No transactions found for this {selectedDate ? 'date' : 'month'}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-group">
                <label htmlFor="accountId">Account</label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.accountName} (${account.balanace.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Transaction Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Grocery Store"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount (will be deducted from account)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
                <small className="amount-helper">Enter positive number - will be automatically deducted</small>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Savings">Savings</option>
                  <option value="Living">Living</option>
                  <option value="Hobbies">Hobbies</option>
                  <option value="Gambling">Gambling</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <div className="date-picker-wrapper">
                  <input
                    type="text"
                    id="date"
                    value={formatDateForDisplay(formData.date)}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    readOnly
                    className="date-input"
                    required
                  />
                  <img src="/images/calendar.png" alt="Calendar" className="calendar-icon" onClick={() => setShowDatePicker(!showDatePicker)} />
                </div>

                {/* Custom Date Picker */}
                {showDatePicker && (
                  <div className="custom-date-picker">
                    <div className="date-picker-header">
                      <button type="button" onClick={previousFormMonth} className="date-nav-btn">←</button>
                      <span className="date-picker-title">
                        {monthNames[selectedFormDate.getMonth()]} {selectedFormDate.getFullYear()}
                      </span>
                      <button type="button" onClick={nextFormMonth} className="date-nav-btn">→</button>
                    </div>

                    <div className="date-picker-grid">
                      <div className="date-picker-weekday">S</div>
                      <div className="date-picker-weekday">M</div>
                      <div className="date-picker-weekday">T</div>
                      <div className="date-picker-weekday">W</div>
                      <div className="date-picker-weekday">T</div>
                      <div className="date-picker-weekday">F</div>
                      <div className="date-picker-weekday">S</div>

                      {[...Array(formStartingDay)].map((_, index) => (
                        <div key={`empty-${index}`} className="date-picker-day empty"></div>
                      ))}

                      {[...Array(formDaysInMonth)].map((_, index) => {
                        const day = index + 1;
                        const isSelectedDay = formData.date === 
                          `${selectedFormDate.getFullYear()}-${String(selectedFormDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        
                        return (
                          <div
                            key={day}
                            className={`date-picker-day ${isSelectedDay ? 'selected' : ''}`}
                            onClick={() => handleDateSelect(day)}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Transactions;