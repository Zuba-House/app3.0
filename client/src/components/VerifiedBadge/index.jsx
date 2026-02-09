/**
 * Verified Badge Component for Web
 * Creative blue verified badge with checkmark
 * Similar to social media verified badges
 */

import React from 'react';
import './VerifiedBadge.css';

const VerifiedBadge = ({ size = 24, className = '' }) => {
  return (
    <div 
      className={`verified-badge ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${size * 0.5}px`
      }}
    >
      <div className="verified-badge__outer-glow"></div>
      <div className="verified-badge__background">
        <div className="verified-badge__inner-highlight"></div>
        <div className="verified-badge__checkmark">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VerifiedBadge;
