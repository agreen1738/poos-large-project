// Settings.tsx - Settings page component
import { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [settingsData, setSettingsData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: false,
      transactionAlerts: true,
      budgetAlerts: true
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light'
    }
  });

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setSettingsData(prev => ({
        ...prev,
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || ''
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: string) => {
    setSettingsData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setSettingsData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend integration
    console.log('Profile update:', {
      firstName: settingsData.firstName,
      lastName: settingsData.lastName,
      email: settingsData.email
    });
    alert('Profile will be updated when backend is ready!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settingsData.newPassword !== settingsData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // TODO: Backend integration
    console.log('Password change requested');
    alert('Password will be changed when backend is ready!');
    
    // Clear password fields
    setSettingsData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleNotificationSave = () => {
    // TODO: Backend integration
    console.log('Notifications saved:', settingsData.notifications);
    alert('Notification preferences will be saved when backend is ready!');
  };

  const handlePreferencesSave = () => {
    // TODO: Backend integration
    console.log('Preferences saved:', settingsData.preferences);
    alert('Preferences will be saved when backend is ready!');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletePassword) {
      alert('Please enter your password to confirm deletion.');
      return;
    }

    // TODO: Backend integration - verify password and delete account
    console.log('Account deletion confirmed with password');
    alert('Account deletion will be implemented when backend is ready!');
    
    // Close modal and clear password
    setShowDeleteModal(false);
    setDeletePassword('');
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

      {/* Notification Settings */}
      <div className="settings-section">
        <h3 className="section-title">Notifications</h3>
        <div className="settings-form">
          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Email Notifications</span>
                <span className="toggle-description">Receive notifications via email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsData.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Push Notifications</span>
                <span className="toggle-description">Receive push notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsData.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Transaction Alerts</span>
                <span className="toggle-description">Get notified of new transactions</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsData.notifications.transactionAlerts}
                  onChange={() => handleNotificationChange('transactionAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Budget Alerts</span>
                <span className="toggle-description">Receive budget threshold alerts</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsData.notifications.budgetAlerts}
                  onChange={() => handleNotificationChange('budgetAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <button type="button" onClick={handleNotificationSave} className="save-btn">
            Save Notifications
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h3 className="section-title">Preferences</h3>
        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={settingsData.preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dateFormat">Date Format</label>
            <select
              id="dateFormat"
              value={settingsData.preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settingsData.preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <button type="button" onClick={handlePreferencesSave} className="save-btn">
            Save Preferences
          </button>
        </div>
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
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleDeleteCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="delete-confirm-btn">
                  Delete My Account
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