import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setStatus({ 
        type: 'error', 
        message: 'Please enter your email address' 
      });
      return;
    }

    if (!agreedToTerms) {
      setStatus({ 
        type: 'error', 
        message: 'Please agree to the terms and privacy policy' 
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Send welcome email to subscriber
      // Note: Make sure your EmailJS template has "To Email" field set to {{to_email}} or {{user_email}}
      const result = await emailjs.send(
        'service_y3mbdme',
        'template_hc44wic',
        {
          to_email: email, // Recipient email (required - use this in template "To Email" field)
          to_name: 'Subscriber', // Optional: recipient name
          user_email: email, // User's email for template content
          subscription_date: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          reply_to: 'info@zubahouse.com', // Reply-to address
        },
        'BEDoJ4iqpx2e53MtC'
      );

      console.log('✅ Email sent successfully:', result);

      setStatus({ 
        type: 'success', 
        message: '🎉 Successfully subscribed! Check your inbox for a welcome email.' 
      });
      
      // Reset form
      setEmail('');
      setAgreedToTerms(false);

      // Clear success message after 6 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 6000);

    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Subscription failed. Please try again or contact info@zubahouse.com' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mb-2 text-[#e5e2db]">
        Subscribe to newsletter
      </h3>
      
      {/* Description */}
      <p className="text-[12px] sm:text-[13px] text-[#e5e2db] mb-3">
        Get news about special discounts and exclusive offers.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-2">
        {/* Email Input */}
        <input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-[42px] sm:h-[45px] border outline-none pl-3 pr-3 sm:pl-4 sm:pr-4 rounded-sm mb-3 focus:border-[rgba(229,226,219,0.5)] text-[14px]"
          style={{ 
            backgroundColor: '#e5e2db', 
            color: '#0b2735',
            border: '2px solid transparent'
          }}
          required
        />

        {/* Subscribe Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-org w-full sm:w-auto mb-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              {/* Loading Spinner */}
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
              SUBSCRIBING...
            </span>
          ) : (
            'SUBSCRIBE'
          )}
        </button>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mt-0 block w-full">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 mt-1 cursor-pointer"
            style={{ accentColor: '#efb291' }}
            required
          />
          <span 
            className="text-[11px] sm:text-[12px] group-hover:opacity-100 transition-opacity" 
            style={{ color: '#e5e2db', opacity: 0.9 }}
          >
            I agree to the{' '}
            <Link 
              to="/terms-of-use" 
              className="underline hover:no-underline" 
              style={{ color: '#efb291' }}
            >
              terms
            </Link>
            {' '}and{' '}
            <Link 
              to="/privacy-policy" 
              className="underline hover:no-underline" 
              style={{ color: '#efb291' }}
            >
              privacy policy
            </Link>
          </span>
        </label>

        {/* Status Message */}
        {status.message && (
          <div 
            className={`mt-4 p-4 rounded-lg flex items-start gap-3 animate-fade-in ${
              status.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            {status.type === 'success' ? (
              <FaCheckCircle 
                className="text-xl flex-shrink-0 mt-0.5" 
                style={{ color: '#10b981' }} 
              />
            ) : (
              <FaExclamationTriangle 
                className="text-xl flex-shrink-0 mt-0.5" 
                style={{ color: '#ef4444' }} 
              />
            )}
            <span className="text-[12px] sm:text-[13px]" style={{ color: '#e5e2db' }}>{status.message}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Newsletter;

