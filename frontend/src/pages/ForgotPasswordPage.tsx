import { useState } from 'react';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        setIsSuccess(false);
      } else {
        setMessage('Password reset link has been sent to your email!');
        setIsSuccess(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Failed to send reset link. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
        
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="back-to-login">
          <a href="/">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;