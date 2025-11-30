// src/components/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p className="spinner-text">Generating your meal plan...</p>
  </div>
);

export default LoadingSpinner;
