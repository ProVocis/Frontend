import React from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {type === 'task' && <i className="fas fa-tasks"></i>}
        {type === 'deadline' && <i className="fas fa-clock"></i>}
        {type === 'urgent' && <i className="fas fa-exclamation-triangle"></i>}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="close-notification">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification; 