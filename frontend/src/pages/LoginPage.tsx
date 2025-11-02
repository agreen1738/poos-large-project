import { useState } from 'react';
import authService from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function doLogin(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    setIsLoading(true);
    setError('');

    try {
      const user = await authService.login({
        login: loginName,
        password: loginPassword
      });

      // Login successful - redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      // Show error message without reloading the page
      setError(error.message || 'Login failed. Please try again.');
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
            placeholder="Email Address"
            value={loginName}
            onChange={(e) => {
              setLoginName(e.target.value);
              setError(''); // Clear error when user starts typing
            }}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error when user starts typing
            }}
            required
            disabled={isLoading}
          />
          
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #f5c6cb',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              {error}
            </div>
          )}
          
          <div className="form-footer">
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Create one here</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;