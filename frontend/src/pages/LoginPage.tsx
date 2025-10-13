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
      const response = await fetch('http://localhost:5000/api/login', {
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
      setMessage('Error: ' + error.toString());
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <div className="error-message">{message}</div>}
      </div>
    </div>
  );
}

export default LoginPage;