import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShippingRates.css';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ShippingRates = ({ cartItems, shippingAddress, onRateSelected }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRate, setSelectedRate] = useState(null);
  const [source, setSource] = useState('');

  useEffect(() => {
    // Only fetch if we have valid address and cart items (worldwide support)
    const hasValidAddress = shippingAddress && (
      (shippingAddress.postal_code && shippingAddress.city) ||
      (shippingAddress.city && shippingAddress.countryCode)
    );
    
    if (hasValidAddress && cartItems?.length > 0) {
      // Debounce to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchShippingRates();
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      // Reset rates if address is invalid
      setRates([]);
      setSelectedRate(null);
      onRateSelected && onRateSelected(null);
    }
  }, [shippingAddress?.postal_code, shippingAddress?.city, shippingAddress?.province, shippingAddress?.countryCode, cartItems?.length]);

  const fetchShippingRates = async () => {
    // TODO: Implement new shipping calculation method
    setLoading(true);
    setError('');
    
    try {
      // New shipping calculation will be implemented here
      setRates([]);
      setSelectedRate(null);
      setSource('');
      setError('Shipping calculation will be available soon');
    } catch (err) {
      console.error('Shipping rates error:', err);
      setError('Unable to calculate shipping. Please try again later.');
      setRates([]);
      setSelectedRate(null);
      onRateSelected && onRateSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRateSelect = (rate) => {
    setSelectedRate(rate);
    onRateSelected && onRateSelected(rate);
  };

  const hasValidAddress = shippingAddress && (
    (shippingAddress.postal_code && shippingAddress.city) ||
    (shippingAddress.city && shippingAddress.countryCode)
  );

  if (!hasValidAddress) {
    return (
      <div className="shipping-rates-placeholder" style={{ 
        padding: '20px', 
        background: '#fff3cd', 
        border: '1px solid #ffc107', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p className="font-semibold text-amber-700">
          ⚠️ Shipping Address Required
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Please enter your shipping address (city and country) above to see shipping options
        </p>
        <small className="text-gray-500 text-xs mt-2 block">
          🌍 We ship worldwide! Use the address search above.
        </small>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="shipping-rates-loading">
        <div className="spinner"></div>
        <p>Calculating shipping rates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shipping-rates-error">
        <p>⚠️ {error}</p>
        <button onClick={fetchShippingRates} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="shipping-rates-container">
      <h3 className="shipping-rates-title">
        🚚 Shipping Options
        {source === 'fallback' && (
          <span className="fallback-badge">Estimated</span>
        )}
      </h3>

      {rates.length === 0 ? (
        <p className="no-rates">No shipping options available</p>
      ) : (
        <div className="shipping-rates-list">
          {rates.map((rate, index) => (
            <div
              key={index}
              className={`shipping-rate-card ${selectedRate === rate ? 'selected' : ''} ${index === 0 ? 'cheapest' : ''}`}
              onClick={() => handleRateSelect(rate)}
            >
              <div className="rate-radio">
                <input
                  type="radio"
                  name="shippingRate"
                  checked={selectedRate === rate}
                  onChange={() => handleRateSelect(rate)}
                />
              </div>

              <div className="rate-details">
                <div className="rate-header">
                  <span className="rate-carrier">{rate.carrier}</span>
                  {index === 0 && (
                    <span className="cheapest-badge">Cheapest</span>
                  )}
                </div>
                
                <div className="rate-service">{rate.service}</div>
                
                {rate.deliveryDays && (
                  <div className="rate-delivery">
                    📦 Estimated delivery: {rate.deliveryDays} business days
                    {rate.region && (
                      <span className="text-gray-500 text-xs ml-2">({rate.region})</span>
                    )}
                  </div>
                )}
                
                {rate.deliveryDate && (
                  <div className="rate-delivery-date">
                    📅 Expected by: {new Date(rate.deliveryDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="rate-price">
                <span className="rate-cost">
                  ${typeof rate.cost === 'number' ? rate.cost.toFixed(2) : '0.00'}
                </span>
                <span className="rate-currency">{rate.currency || 'USD'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {source === 'calculator' && (
        <p className="rate-source-info">
          ℹ️ Shipping rates calculated based on location, weight, and category
        </p>
      )}
      
      {source === 'fallback' && (
        <p className="rate-source-info">
          ℹ️ Estimated shipping cost (final rate calculated at shipment)
        </p>
      )}
    </div>
  );
};

export default ShippingRates;

