import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/dashboard" className="nav-link active">Dashboard</Link>
        <Link to="/accounts" className="nav-link">Accounts</Link>
        <Link to="/transactions" className="nav-link">Transactions</Link>
        <Link to="/analytics" className="nav-link">Analytics</Link>
        <Link to="/settings" className="nav-link">Settings</Link>
      </div>
    </nav>
  );
}

export default Navigation;