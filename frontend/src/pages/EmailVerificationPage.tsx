import { useState, useEffect } from 'react';
import './EmailVerificationPage.css';

function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    verifyEmail();
  }, []);

  async function verifyEmail() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    try {
      // Use VITE_API_URL which already includes /api
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
      
      // Don't add /api again - it's already in VITE_API_URL
      const response = await fetch(`${API_URL}/verify?token=${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(res.message || 'Email verified successfully! You can now log in.');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        // Check if the error message indicates the account is already verified
        const errorMessage = res.message || res.error || '';
        const isAlreadyVerified = errorMessage.toLowerCase().includes('already verified') || 
                                   errorMessage.toLowerCase().includes('account already verified');
        
        if (isAlreadyVerified) {
          // Treat "already verified" as a success case
          setVerificationStatus('success');
          setMessage('Your account is already verified! You can log in now.');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(errorMessage || 'Verification failed. The link may have expired.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage('Failed to verify email. Please check your connection and try again.');
    }
  }

  const handleResendEmail = () => {
    setShowResendForm(true);
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    setMessage('');

    try {
      // Use VITE_API_URL which already includes /api
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
      
      // Don't add /api again - it's already in VITE_API_URL
      const response = await fetch(`${API_URL}/resend-verification`, {
        method: 'POST',
        body: JSON.stringify({ email: resendEmail }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (response.ok) {
        setMessage('✓ Verification email sent! Please check your inbox and spam folder.');
        setResendEmail('');
        setShowResendForm(false);
      } else {
        setMessage(res.message || res.error || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        {verificationStatus === 'verifying' && (
          <>
            <div className="verification-icon verifying">
              <img src="/images/hourglass.png" alt="Verifying" />
            </div>
            <h1>Verifying Your Email</h1>
            <p className="subtitle">Please wait while we verify your email address...</p>
            <div className="loading-spinner"></div>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="verification-icon success">✓</div>
            <h1>Email Verified!</h1>
            <p className="subtitle">
              Your email has been successfully verified. You will be redirected to the login page in a few seconds.
            </p>
            <div className="message success">{message}</div>
            <div className="action-buttons">
              <a href="/" className="login-btn">Go to Login</a>
            </div>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="verification-icon error">✗</div>
            <h1>Verification Failed</h1>
            <p className="subtitle">
              {message.includes('expired') || message.includes('Expired')
                ? 'This verification link has expired (links are valid for 15 minutes).'
                : 'We couldn\'t verify your email address. This link may have expired or is invalid.'}
            </p>
            <div className="message error">
              {message}
            </div>

            {!showResendForm ? (
              <div className="action-buttons">
                <button onClick={handleResendEmail} className="resend-btn">
                  <img src="/images/mail.png" alt="Email" style={{width: "16px", height: "16px", marginRight: "8px", verticalAlign: "middle"}} />
                  Resend Verification Email
                </button>
                <a href="/" className="login-btn-secondary">Back to Login</a>
              </div>
            ) : (
              <div className="resend-form-container">
                <form onSubmit={handleResendSubmit} className="inline-resend-form">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <div className="form-buttons">
                    <button type="submit" disabled={isResending} className="resend-submit-btn">
                      {isResending ? 'Sending...' : 'Send Email'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowResendForm(false)} 
                      className="cancel-resend-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerificationPage;