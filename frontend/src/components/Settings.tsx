// Settings.tsx - Settings page component
import { useState, useEffect } from 'react';
import userService from '../services/userService';
import authService from '../services/authService';
import './Settings.css';

function Settings() {
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailUpdateMessage, setEmailUpdateMessage] = useState('');
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
        phone: settingsData.phone
      });
      
      // Update local storage
      const updatedUser = {
        ...user,
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        phone: settingsData.phone
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settingsData.email) {
      alert('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settingsData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    try {
      await userService.updateUserInfo({
        email: settingsData.email
      });
      
      // Update local storage
      const updatedUser = {
        ...user,
        email: settingsData.email
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setEmailUpdateMessage('Success! Check Email for Verification');
      // Clear message after 5 seconds
      setTimeout(() => setEmailUpdateMessage(''), 5000);
    } catch (error: any) {
      alert('Failed to update email: ' + error.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!settingsData.currentPassword) {
      alert('Please enter your current password');
      return;
    }

    if (!settingsData.newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (settingsData.newPassword !== settingsData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (settingsData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
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
      
      alert('Password changed successfully!');
    } catch (error: any) {
      alert('Failed to change password: ' + error.message);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletePassword) {
      alert('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      await userService.deleteAccount(deletePassword);
      
      alert('Account deleted successfully. You will be redirected to the login page.');
      
      // Clear all local storage and redirect
      authService.logout();
    } catch (error: any) {
      alert('Failed to delete account: ' + error.message);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
  };

  return (
    <div className="settings-container">
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

      {/* Email Settings */}
      <div className="settings-section">
        <h3 className="section-title">Email Information</h3>
        <p style={{ marginBottom: '1.5rem', color: '#6c757d', fontSize: '0.95rem' }}>
          Update your email address. This will be used for account recovery and important notifications.
        </p>
        <form onSubmit={handleEmailUpdate} className="settings-form">
          {emailUpdateMessage && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '1rem',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              {emailUpdateMessage}
            </div>
          )}
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
          <button type="submit" className="save-btn">Update Email</button>
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
              <button className="modal-close-btn" onClick={handleDeleteCancel}>Ã—</button>
            </div>
            
            <div className="delete-warning">
              <p>âš ï¸ <strong>Warning:</strong> This action cannot be undone!</p>
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
    </div>
  );
}

export default Settings;