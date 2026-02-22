import React, { useState } from 'react';
import './DiscountInput.css';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com';

/**
 * Discount Input Component
 * Handles promo code and gift card input
 */
const DiscountInput = ({ 
  cartItems = [], 
  cartTotal = 0, 
  shippingCost = 0,
  onDiscountsCalculated,
  apiUrl = `${API_BASE_URL}/api`
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discounts, setDiscounts] = useState(null);
  const [activeTab, setActiveTab] = useState('coupon'); // 'coupon' or 'giftcard'

  const calculateDiscounts = async () => {
    if (!promoCode.trim() && !giftCardCode.trim()) {
      setError('Please enter a promo code or gift card code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get auth token if available
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Try the combined discount endpoint first
      let response = await fetch(`${apiUrl}/discounts/calculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cartItems,
          cartTotal,
          shippingCost,
          couponCode: promoCode.trim() || null,
          giftCardCode: giftCardCode.trim() || null
        })
      });

      // If combined endpoint fails (405 or other errors), try individual endpoints as fallback
      if (!response.ok) {
        // Only use fallback for 405 (Method Not Allowed) or 404 (Not Found)
        if (response.status === 405 || response.status === 404) {
          console.warn('Discount routes not available on server. Please ensure server files are deployed and server is restarted.');
          
          // Calculate discounts separately
          const discounts = {
            coupon: null,
            couponDiscount: 0,
            giftCard: null,
            giftCardDiscount: 0,
            automaticDiscounts: [],
            totalDiscount: 0,
            freeShipping: false,
            finalTotal: cartTotal + shippingCost
          };

          // Apply coupon if provided
          if (promoCode.trim()) {
            try {
              const couponResponse = await fetch(`${apiUrl}/coupons/apply`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  code: promoCode.trim(),
                  cartItems,
                  cartTotal
                })
              });

              if (couponResponse.ok) {
                try {
                  const couponData = await couponResponse.json();
                  if (couponData.success && couponData.discount) {
                    discounts.coupon = couponData.coupon;
                    discounts.couponDiscount = couponData.discountAmount || 0;
                    discounts.freeShipping = couponData.freeShipping || false;
                  } else if (couponData.error) {
                    setError(couponData.error);
                    setDiscounts(null);
                    return;
                  }
                } catch (e) {
                  console.error('Error parsing coupon response:', e);
                }
              } else {
                try {
                  const errorData = await couponResponse.json();
                  if (errorData.error) {
                    setError(errorData.error);
                    setDiscounts(null);
                    return;
                  }
                } catch (e) {
                  // Response is not JSON, ignore
                }
              }
            } catch (e) {
              console.error('Coupon apply error:', e);
            }
          }

          // Apply gift card if provided
          if (giftCardCode.trim()) {
            try {
              const giftCardResponse = await fetch(`${apiUrl}/gift-cards/apply`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  code: giftCardCode.trim(),
                  cartTotal: cartTotal - discounts.couponDiscount
                })
              });

              if (giftCardResponse.ok) {
                try {
                  const giftCardData = await giftCardResponse.json();
                  if (giftCardData.success && giftCardData.discount) {
                    discounts.giftCard = giftCardData.giftCard;
                    discounts.giftCardDiscount = giftCardData.discountAmount || 0;
                  } else if (giftCardData.error) {
                    setError(giftCardData.error);
                    setDiscounts(null);
                    return;
                  }
                } catch (e) {
                  console.error('Error parsing gift card response:', e);
                }
              } else {
                try {
                  const errorData = await giftCardResponse.json();
                  if (errorData.error) {
                    setError(errorData.error);
                    setDiscounts(null);
                    return;
                  }
                } catch (e) {
                  // Response is not JSON, ignore
                }
              }
            } catch (e) {
              console.error('Gift card apply error:', e);
            }
          }

          // Calculate totals
          discounts.totalDiscount = discounts.couponDiscount + discounts.giftCardDiscount;
          discounts.finalTotal = Math.max(0, cartTotal - discounts.totalDiscount + (discounts.freeShipping ? 0 : shippingCost));

          // Only set discounts if we have at least one valid discount
          if (discounts.couponDiscount > 0 || discounts.giftCardDiscount > 0) {
            setDiscounts(discounts);
            if (onDiscountsCalculated) {
              onDiscountsCalculated(discounts);
            }
          } else {
            // If fallback also failed, show helpful error
            setError('Discount system is not available. Please contact support or try again later.');
          }
          return;
        } else {
          // For other errors (not 405/404), show the actual error
          let errorMessage = `Server error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          setError(errorMessage);
          setDiscounts(null);
          return;
        }
      }

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error response, but handle if it's not JSON
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        setError(errorMessage);
        setDiscounts(null);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setDiscounts(data.discounts);
        if (onDiscountsCalculated) {
          onDiscountsCalculated(data.discounts);
        }
      } else {
        setError(data.error || 'Failed to apply discount');
        setDiscounts(null);
      }
    } catch (err) {
      console.error('Discount calculation error:', err);
      setError('Failed to calculate discounts. Please try again.');
      setDiscounts(null);
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = (type) => {
    if (type === 'coupon') {
      setPromoCode('');
    } else {
      setGiftCardCode('');
    }
    setDiscounts(null);
    setError('');
    if (onDiscountsCalculated) {
      onDiscountsCalculated(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      calculateDiscounts();
    }
  };

  return (
    <div className="discount-input-container">
      <div className="discount-tabs">
        <button
          className={activeTab === 'coupon' ? 'active' : ''}
          onClick={() => setActiveTab('coupon')}
        >
          Promo Code
        </button>
        <button
          className={activeTab === 'giftcard' ? 'active' : ''}
          onClick={() => setActiveTab('giftcard')}
        >
          Gift Card
        </button>
      </div>

      <div className="discount-input-section">
        {activeTab === 'coupon' ? (
          <div className="promo-code-input">
            {discounts?.coupon ? (
              <div className="applied-discount">
                <div className="discount-info">
                  <span className="discount-icon">✓</span>
                  <span className="discount-code">{discounts.coupon.code}</span>
                  <span className="discount-amount">-${discounts.couponDiscount.toFixed(2)}</span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeDiscount('coupon')}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button 
                  onClick={calculateDiscounts}
                  disabled={loading || !promoCode.trim()}
                  className="apply-btn"
                >
                  {loading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="gift-card-input">
            {discounts?.giftCard ? (
              <div className="applied-discount">
                <div className="discount-info">
                  <span className="discount-icon">🎁</span>
                  <span className="discount-code">{discounts.giftCard.code}</span>
                  <span className="discount-amount">-${discounts.giftCardDiscount.toFixed(2)}</span>
                  <span className="balance-info">
                    (Balance: ${discounts.giftCard.currentBalance.toFixed(2)})
                  </span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeDiscount('giftcard')}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter gift card code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button 
                  onClick={calculateDiscounts}
                  disabled={loading || !giftCardCode.trim()}
                  className="apply-btn"
                >
                  {loading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="discount-error">
          {error}
        </div>
      )}

      {discounts && discounts.automaticDiscounts?.length > 0 && (
        <div className="automatic-discounts">
          <h4>Automatic Discounts Applied:</h4>
          {discounts.automaticDiscounts.map((discount, index) => (
            <div key={index} className="auto-discount-item">
              <span className="discount-name">{discount.name}</span>
              <span className="discount-amount">-${discount.discount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {discounts && (
        <div className="discount-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {discounts.couponDiscount > 0 && (
            <div className="summary-row discount-row">
              <span>Coupon Discount ({discounts.coupon?.code}):</span>
              <span>-${discounts.couponDiscount.toFixed(2)}</span>
            </div>
          )}
          {discounts.giftCardDiscount > 0 && (
            <div className="summary-row discount-row">
              <span>Gift Card ({discounts.giftCard?.code}):</span>
              <span>-${discounts.giftCardDiscount.toFixed(2)}</span>
            </div>
          )}
          {discounts.automaticDiscounts?.reduce((sum, d) => sum + d.discount, 0) > 0 && (
            <div className="summary-row discount-row">
              <span>Automatic Discounts:</span>
              <span>
                -${discounts.automaticDiscounts.reduce((sum, d) => sum + d.discount, 0).toFixed(2)}
              </span>
            </div>
          )}
          {discounts.freeShipping && (
            <div className="summary-row discount-row">
              <span>Free Shipping:</span>
              <span>-${shippingCost.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Total:</span>
            <span>${discounts.finalTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountInput;

