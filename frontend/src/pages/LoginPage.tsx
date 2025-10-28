import { useState } from 'react';
import authService from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function doLogin(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Use authService to login
      await authService.login({
        login: loginName,
        password: loginPassword
      });

      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (error: any) {
      setMessage(error.message || 'Login failed. Please try again.');
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

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Create one here</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;