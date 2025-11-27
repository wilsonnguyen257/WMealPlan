import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress, message, stage }) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <p className="progress-message">{message}</p>
        {stage && <p className="progress-stage">{stage}</p>}
      </div>
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        >
          <div className="progress-bar-shine"></div>
        </div>
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>
    </div>
  );
}

export default ProgressBar;
