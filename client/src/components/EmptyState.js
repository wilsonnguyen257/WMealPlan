import React from 'react';
import './EmptyState.css';

function EmptyState({ 
  icon = 'default', 
  title, 
  message, 
  action, 
  actionText,
  tips = []
}) {
  const renderIcon = () => {
    switch(icon) {
      case 'saved-plans':
        return (
          <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F0F9F1"/>
            <path d="M70 90 L85 105 L130 60" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="60" y="50" width="80" height="100" rx="8" stroke="#4CAF50" strokeWidth="4" fill="white"/>
            <line x1="70" y1="75" x2="130" y2="75" stroke="#EAEAEA" strokeWidth="3" strokeLinecap="round"/>
            <line x1="70" y1="95" x2="120" y2="95" stroke="#EAEAEA" strokeWidth="3" strokeLinecap="round"/>
            <line x1="70" y1="115" x2="110" y2="115" stroke="#EAEAEA" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      case 'search':
        return (
          <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#FFF9F0"/>
            <circle cx="85" cy="85" r="35" stroke="#FFB55A" strokeWidth="6" fill="white"/>
            <line x1="110" y1="110" x2="135" y2="135" stroke="#FFB55A" strokeWidth="8" strokeLinecap="round"/>
            <path d="M75 85 Q85 75 95 85" stroke="#FFB55A" strokeWidth="4" fill="none"/>
          </svg>
        );
      case 'pantry':
        return (
          <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F0F9F1"/>
            <rect x="60" y="70" width="80" height="70" rx="4" fill="white" stroke="#4CAF50" strokeWidth="4"/>
            <path d="M60 90 L140 90" stroke="#4CAF50" strokeWidth="3"/>
            <circle cx="85" cy="105" r="8" fill="#FFB55A"/>
            <circle cx="115" cy="105" r="8" fill="#4CAF50"/>
            <circle cx="85" cy="125" r="6" fill="#FF6B6B"/>
            <circle cx="105" cy="125" r="6" fill="#4CAF50"/>
            <circle cx="125" cy="125" r="6" fill="#FFB55A"/>
          </svg>
        );
      case 'filter':
        return (
          <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F5F5F5"/>
            <path d="M60 70 L140 70 L115 105 L115 140 L85 140 L85 105 Z" fill="white" stroke="#CCCCCC" strokeWidth="4"/>
            <line x1="75" y1="100" x2="125" y2="100" stroke="#CCCCCC" strokeWidth="3"/>
          </svg>
        );
      default:
        return (
          <svg className="empty-icon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#FAFAFA"/>
            <circle cx="100" cy="90" r="25" stroke="#CCCCCC" strokeWidth="4" fill="white"/>
            <path d="M100 125 Q100 140 85 145 Q75 148 75 160 L125 160 Q125 148 115 145 Q100 140 100 125" fill="#CCCCCC"/>
          </svg>
        );
    }
  };

  return (
    <div className="empty-state">
      {renderIcon()}
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      
      {tips.length > 0 && (
        <div className="empty-tips">
          <p className="tips-label">💡 Tips:</p>
          <ul className="tips-list">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      {action && (
        <button onClick={action} className="empty-action-btn">
          {actionText || 'Get Started'}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
