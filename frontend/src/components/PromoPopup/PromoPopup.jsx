import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';
import './PromoPopup.css';

const PromoPopup = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);

  // Default promos - can be fetched from API
  const promos = [
    {
      code: 'WELCOME10',
      discount: '10% OFF',
      description: 'Your first order',
      minPurchase: '$50',
      type: 'percentage'
    },
    {
      code: 'FREESHIP',
      discount: 'FREE SHIPPING',
      description: 'On orders over $75',
      minPurchase: '$75',
      type: 'shipping'
    },
    {
      code: 'HOLIDAY25',
      discount: '25% OFF',
      description: 'Holiday Special Sale',
      minPurchase: '$100',
      type: 'percentage'
    }
  ];

  useEffect(() => {
    // Check if popup was dismissed recently (within 24 hours)
    const lastDismissed = localStorage.getItem('promoPopupDismissed');
    const dismissedTime = lastDismissed ? parseInt(lastDismissed) : 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (Date.now() - dismissedTime > twentyFourHours) {
      // Show popup after 3 seconds of page load
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Select random promo
        setCurrentPromo(promos[Math.floor(Math.random() * promos.length)]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('promoPopupDismissed', Date.now().toString());
  };

  const copyCode = () => {
    if (currentPromo?.code) {
      navigator.clipboard.writeText(currentPromo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible || !currentPromo) return null;

  return (
    <div className="promo-popup-overlay" onClick={handleClose}>
      <div className="promo-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="popup-content">
          <div className="popup-icon">
            🎁
          </div>

          <div className="popup-header">
            <span className="exclusive-tag">🎉 EXCLUSIVE OFFER</span>
            <h2>{currentPromo.discount}</h2>
            <p className="promo-description">{currentPromo.description}</p>
          </div>

          <div className="promo-code-container">
            <span className="code-label">Use code:</span>
            <div className="code-box">
              <span className="code">{currentPromo.code}</span>
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyCode}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {currentPromo.minPurchase && (
            <p className="min-purchase">
              *Min. purchase: {currentPromo.minPurchase}
            </p>
          )}

          <div className="popup-actions">
            <Link to="/sales" className="shop-btn" onClick={handleClose}>
              Shop Now & Save
            </Link>
            <button className="later-btn" onClick={handleClose}>
              Maybe Later
            </button>
          </div>

          <div className="popup-features">
            <span>✓ Free Returns</span>
            <span>✓ Secure Checkout</span>
            <span>✓ Fast Shipping</span>
          </div>
        </div>

        <div className="popup-decoration">
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="circle c3"></div>
        </div>
      </div>
    </div>
  );
});

export default PromoPopup;


