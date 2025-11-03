// Settings.tsx - Settings page component
import { useState, useEffect } from 'react';
import userService from '../services/userService';
import authService from '../services/authService';
import './Settings.css';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

function Settings() {
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [settingsData, setSettingsData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setSettingsData(prev => ({
        ...prev,
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      }));
    }
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await userService.updateUserInfo({
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
        phone: settingsData.phone
      });
      
      // Update local storage
      const updatedUser = {
        ...user,
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
        phone: settingsData.phone
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      showNotification('success', 'Profile updated successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!settingsData.currentPassword) {
      showNotification('error', 'Please enter your current password');
      return;
    }

    if (!settingsData.newPassword) {
      showNotification('error', 'Please enter a new password');
      return;
    }

    if (settingsData.newPassword !== settingsData.confirmPassword) {
      showNotification('error', 'New passwords do not match!');
      return;
    }

    if (settingsData.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long!');
      return;
    }

    try {
      await userService.changePassword({
        currentPassword: settingsData.currentPassword,
        newPassword: settingsData.newPassword
      });
      
      // Clear password fields
      setSettingsData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      showNotification('success', 'Password changed successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteError('');
    setDeletePassword('');
  };

  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await userService.deleteAccount(deletePassword);
      
      // Show success message before redirecting
      showNotification('success', 'Account deleted successfully. Redirecting to login...');
      
      // Delay logout to show the message
      setTimeout(() => {
        authService.logout();
      }, 2000);
    } catch (error: any) {
      // If there's an error (like wrong password), show it and stay on the modal
      const errorMessage = error.message || 'Failed to delete account';
      setDeleteError(errorMessage);
      setIsDeleting(false);
      // Don't close the modal or logout - let the user try again or cancel
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
    setIsDeleting(false);
  };

  return (
    <div className="settings-container">
      {/* Notification Toast */}
      {notification && (
        <div 
          className={`notification-toast notification-${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'slideIn 0.3s ease-out',
            backgroundColor: notification.type === 'success' ? '#d4edda' : 
                           notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
            color: notification.type === 'success' ? '#155724' : 
                   notification.type === 'error' ? '#721c24' : '#0c5460',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : 
                                 notification.type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'success' && <span>✓</span>}
            {notification.type === 'error' && <span>✗</span>}
            {notification.type === 'info' && <span>ℹ</span>}
            {notification.message}
          </span>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'inherit',
              padding: '0 0 0 16px',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
      )}

      <h2 className="settings-title">Settings</h2>

      {/* Profile Settings */}
      <div className="settings-section">
        <h3 className="section-title">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={settingsData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={settingsData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={settingsData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={settingsData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          <button type="submit" className="save-btn">Save Profile</button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="settings-section">
        <h3 className="section-title">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={settingsData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={settingsData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={settingsData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <button type="submit" className="save-btn">Change Password</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3 className="section-title">Danger Zone</h3>
        <div className="danger-content">
          <div className="danger-info">
            <span className="danger-label">Delete Account</span>
            <span className="danger-description">
              Permanently delete your account and all associated data
            </span>
          </div>
          <button type="button" onClick={handleDeleteAccount} className="danger-btn">
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close-btn" onClick={handleDeleteCancel}>×</button>
            </div>
            
            <div className="delete-warning">
              <p>⚠️ <strong>Warning:</strong> This action cannot be undone!</p>
              <p>All your data, including accounts, transactions, and settings will be permanently deleted.</p>
            </div>

            <form onSubmit={handleDeleteConfirm} className="delete-form">
              <div className="form-group">
                <label htmlFor="deletePassword">Enter your password to confirm</label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  disabled={isDeleting}
                />
                {deleteError && (
                  <div className="error-message" style={{ 
                    color: '#dc3545', 
                    fontSize: '0.875rem', 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8d7da',
                    borderRadius: '4px',
                    border: '1px solid #f5c6cb'
                  }}>
                    {deleteError}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleDeleteCancel} 
                  className="cancel-btn"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="delete-confirm-btn"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CSS animation for toast */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;