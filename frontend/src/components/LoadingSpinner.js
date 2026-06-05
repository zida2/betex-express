/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium',
  color = 'primary',
  text = 'Chargement...',
  fullScreen = false 
}) => {
  return (
    <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`spinner spinner-${size} spinner-${color}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
