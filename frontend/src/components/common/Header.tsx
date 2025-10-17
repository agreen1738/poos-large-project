import { useState } from 'react';
import './Header.css';
import React from 'react';

function Header() {
  const [userName, setUserName] = useState('');

  React.useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(`${user.firstName} ${user.lastName}`);
    }
  }, []);

  function doLogout() {
    localStorage.removeItem('user_data');
    window.location.href = '/';
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1>Wealth Tracker</h1>
        <div className="header-right">
          <span className="user-name">Welcome, {userName}</span>
          <button className="logout-btn" onClick={doLogout}>Log Out</button>
        </div>
      </div>
    </header>
  );
}

export default Header;