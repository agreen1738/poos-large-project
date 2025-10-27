import { useState, useEffect } from 'react';
import './VerifyEmailPage.css';

function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Get user email from localStorage (set during login)
  const pendingUser = localStorage.getItem('pending_verification');
  const userEmail = pendingUser ? JSON.parse(pendingUser).email : '';

  useEffect(() => {
    // Redirect if no pending verification
    if (!pendingUser) {
      window.location.href = '/';
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const user = JSON.parse(pendingUser!);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user.id,
          code: code 
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        setIsSuccess(false);
      } else {
        setMessage('Email verified successfully! Redirecting...');
        setIsSuccess(true);
        
        // Clear pending verification and set user data
        localStorage.removeItem('pending_verification');
        localStorage.setItem('user_data', JSON.stringify(res.user));
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.log('Backend not responding');
      setMessage('Email verification will work when backend is ready!');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setMessage('');

    try {
      const user = JSON.parse(pendingUser!);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/resend-verification`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        setIsSuccess(false);
      } else {
        setMessage('Verification code sent! Check your email.');
        setIsSuccess(true);
        
        // Restart timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.log('Backend not responding');
      setMessage('Resend will work when backend is ready!');
      setIsSuccess(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="email-icon">📧</div>
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          We've sent a verification code to<br />
          <strong>{userEmail}</strong>
        </p>
        
        <form className="verify-email-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            className="code-input"
          />
          
          <button type="submit" disabled={isLoading || code.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="resend-section">
          {canResend ? (
            <button onClick={handleResendCode} className="resend-btn">
              Resend Code
            </button>
          ) : (
            <p className="resend-timer">
              Resend code in {resendTimer}s
            </p>
          )}
        </div>

        <div className="back-to-login">
          <a href="/">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;