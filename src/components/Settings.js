import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import './Settings.css';
import defaultAvatar from '../assets/MALE.jpeg';

const Settings = () => {
  const [user, setUser] = useState({
    name: 'Team Member',
    email: localStorage.getItem('email') || '',
    avatar: localStorage.getItem('avatar') || defaultAvatar,
    role: 'Team Member',
    joinedDate: 'January 2024'
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result }));
        localStorage.setItem('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      <div className="main-content">
        <div className="settings-content">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className="settings-grid">
            {/* Profile Section */}
            <div className="settings-card profile-section">
              <h2>Profile</h2>
              <div className="avatar-section">
                <div className="avatar-container">
                  <img src={user.avatar} alt="Profile" className="profile-avatar" />
                  <div className="avatar-overlay">
                    <label htmlFor="avatar-upload" className="avatar-upload-label">
                      <i className="fas fa-camera"></i>
                      Change Photo
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
              <div className="profile-info">
                <div className="info-group">
                  <label>Name</label>
                  <div className="info-value">{user.name}</div>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-group">
                  <label>Role</label>
                  <div className="info-value">{user.role}</div>
                </div>
                <div className="info-group">
                  <label>Member Since</label>
                  <div className="info-value">{user.joinedDate}</div>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="settings-card">
              <h2>Account Settings</h2>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-item-content">
                    <i className="fas fa-bell"></i>
                    <div>
                      <h3>Notifications</h3>
                      <p>Manage your notification preferences</p>
                    </div>
                  </div>
                  <button className="settings-button">
                    Configure
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <i className="fas fa-lock"></i>
                    <div>
                      <h3>Password & Security</h3>
                      <p>Update your password and security settings</p>
                    </div>
                  </div>
                  <button className="settings-button">
                    Manage
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-content">
                    <i className="fas fa-sign-out-alt"></i>
                    <div>
                      <h3>Logout</h3>
                      <p>Sign out of your account</p>
                    </div>
                  </div>
                  <button className="settings-button danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 