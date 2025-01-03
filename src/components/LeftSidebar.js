import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LeftSidebar.css';
import logo from '../assets/provocis-webheaderlogo.png';
import { API_URL } from '../config';

const LeftSidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': token
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: 'fas fa-home', label: 'Dashboard', path: '/dashboard' },
    { icon: 'fas fa-tasks', label: 'Tasks', path: '/tasks' },
    { icon: 'fas fa-users', label: 'User Manager', path: '/users' },
    { icon: 'fas fa-hashtag', label: 'Social Media', path: '/social' },
    { icon: 'fas fa-ticket-alt', label: 'Tickets', path: '/tickets' },
    { icon: 'fas fa-dollar-sign', label: 'Finance', path: '/finance' },
    { icon: 'fas fa-envelope', label: 'Messages', path: '/messages' },
    { icon: 'fas fa-cog', label: 'Settings', path: '/settings' }
  ];

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="ProVocis Logo" className="sidebar-logo" />
      </div>
      <nav className="menu-items">
        {menuItems.map((item) => (
          <Link to={item.path} key={item.label} className="menu-item">
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button className="logout-button" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default LeftSidebar; 