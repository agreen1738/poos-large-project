import { useState } from 'react';
import authService from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  async function doLogin(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    setIsLoading(true);
    setMessage('');
    setDebugInfo([]);

    const logs: string[] = [];
    logs.push(`✓ Form submitted`);
    logs.push(`✓ Attempting login with: ${loginName}`);
    setDebugInfo([...logs]);

    try {
      logs.push('✓ Calling authService.login...');
      setDebugInfo([...logs]);
      
      const user = await authService.login({
        login: loginName,
        password: loginPassword
      });

      logs.push(`✓ Login successful! User: ${user.firstName}`);
      logs.push(`✓ Redirecting to dashboard...`);
      setDebugInfo([...logs]);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error: any) {
      logs.push(`✗ ERROR: ${error.message}`);
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      setDebugInfo([...logs]);
      setMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
    return;
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

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className="debug-info">
            <strong>Debug Info:</strong>
            {debugInfo.map((log, index) => (
              <div key={index} style={{ fontSize: '11px', padding: '2px 0' }}>
                {log}
              </div>
            ))}
          </div>
        )}

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Create one here</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;