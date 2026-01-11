import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './FloatingSaleBadge.css';

const FloatingSaleBadge = memo(() => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check if badge was minimized in this session
    const minimized = sessionStorage.getItem('saleBadgeMinimized');
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  const handleMinimize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMinimized(true);
    sessionStorage.setItem('saleBadgeMinimized', 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    sessionStorage.removeItem('saleBadgeMinimized');
  };

  if (!isVisible) return null;

  return (
    <div className={`floating-sale-badge ${isMinimized ? 'minimized' : ''}`}>
      {isMinimized ? (
        <button className="minimized-badge" onClick={handleExpand}>
          🏷️ Sale
        </button>
      ) : (
        <Link to="/sales" className="sale-badge-content">
          <button 
            className="minimize-btn" 
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <FaTimes />
          </button>
          <div className="badge-icon">
            🏷️
          </div>
          <div className="badge-text">
            <span className="badge-title">Sale</span>
            <span className="badge-subtitle">Up to 50% OFF</span>
          </div>
          <span className="badge-cta">Shop →</span>
        </Link>
      )}
    </div>
  );
});

export default FloatingSaleBadge;

