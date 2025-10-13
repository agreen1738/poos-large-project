import { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import './DashboardPage.css';

function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      window.location.href = '/';
    } else {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <Header />
      <Navigation />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default DashboardPage;