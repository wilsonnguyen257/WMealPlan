import React from 'react';
import './Toast.css';

function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export default Toast;
