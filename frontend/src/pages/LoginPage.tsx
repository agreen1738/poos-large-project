import { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.id <= 0 || res.error) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = {
          firstName: res.firstName,
          lastName: res.lastName,
          id: res.id
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      // TEMPORARY TEST LOGIN - Remove this after backend is connected
      console.log('Backend not responding, using temporary test login');
      
      if (loginName && loginPassword) {
        const user = {
          firstName: 'Test',
          lastName: 'User',
          id: 1
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/dashboard';
      } else {
        setMessage('Please enter username and password');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Wealth Tracker</h1>
        <p className="subtitle">Manage Your Financial Assets</p>
        
        <form className="login-form" onSubmit={doLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="form-footer">
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <div className="error-message">{message}</div>}
        
        {/* TEMPORARY - Remove this after backend is connected */}
        <div className="temp-test-notice">
          <p style={{ fontSize: '12px', color: '#999', marginTop: '15px', textAlign: 'center' }}>
            ⚠️ Temporary Test Mode: Enter any username/password ⚠️
          </p>
        </div>

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Create one here</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;