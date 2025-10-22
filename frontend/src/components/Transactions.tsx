// Transactions.tsx - Transactions page with calendar and list
import { useState, useEffect } from 'react';
import './Transactions.css';

interface Transaction {
  id: number;
  date: string;
  name: string;
  amount: number;
  category: string;
}

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Living',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user.id,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();
      if (!res.error) {
        setTransactions(res.transactions || []);
      }
    } catch (error) {
      console.log('Using sample data for testing');
      // Sample data for testing
      setTransactions([
        { id: 1, date: '2025-10-04', name: 'Uniqlo', amount: 158.67, category: 'Hobbies' },
        { id: 2, date: '2025-10-04', name: 'Publix', amount: 389.67, category: 'Living' },
        { id: 3, date: '2025-10-03', name: 'GameStop', amount: 78.13, category: 'Hobbies' },
        { id: 4, date: '2025-10-15', name: 'Rent Payment', amount: 1200.00, category: 'Living' },
        { id: 5, date: '2025-10-20', name: 'Savings Deposit', amount: 500.00, category: 'Savings' },
        { id: 6, date: '2025-10-12', name: 'Restaurant', amount: 45.32, category: 'Living' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend integration will go here
    console.log('Transaction to be added:', formData);
    
    // Close modal and reset form
    setShowModal(false);
    setFormData({
      name: '',
      amount: '',
      category: 'Living',
      date: new Date().toISOString().split('T')[0]
    });
    
    // Show confirmation
    alert('Transaction will be added when backend is ready!');
  };

  return (
    <>
      <div className="transactions-page">
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

        {/* Transactions List Section */}
        <div className="transactions-list-section">
          <div className="transactions-list-header">
            <h3>
              {selectedDate 
                ? `Transactions on ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`
                : 'All Recent Transactions'
              }
            </h3>
            <div className="header-buttons">
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="clear-filter-btn">
                  Show All
                </button>
              )}
              <button onClick={() => setShowModal(true)} className="add-transaction-btn">
                + Add Transaction
              </button>
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
                      <th>Name</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.name}</td>
                        <td>
                          <span className={`category-badge category-${transaction.category.toLowerCase()}`}>
                            {transaction.category}
                          </span>
                        </td>
                        <td className="amount-cell">${transaction.amount.toFixed(2)}</td>
                      </tr>
                    ))}
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
                <label htmlFor="amount">Amount</label>
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
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
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