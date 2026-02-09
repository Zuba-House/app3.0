import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email + OTP, 2: Registration form
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    storeSlug: '',
    description: '',
    phone: '',
    whatsapp: '',
    country: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1a: Send OTP to email
  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vendor/send-otp`, {
        email: email.toLowerCase().trim()
      });

        if (response.data?.error === false) {
        if (response.data?.data?.emailVerified) {
          // Email already verified
          setEmailVerified(true);
          setFormData(prev => ({ ...prev, email: email.toLowerCase().trim() }));
          toast.success('Email already verified! Continue with registration.');
          setTimeout(() => setStep(2), 500);
        } else {
          // OTP sent or generated
          setOtpSent(true);
          
          // Check if email was actually sent
          if (response.data?.data?.emailSent) {
            toast.success('Verification code sent to your email! Check your inbox (and spam folder).');
          } else {
            // Email service issue - show OTP if available (local development)
            const localOtp = response.data?.data?.otp || response.data?.data?.debugOtp;
            if (localOtp) {
              // Auto-fill the OTP for convenience
              setOtp(localOtp);
              toast.success(`📧 Email not configured locally. Your code: ${localOtp}`, { duration: 15000 });
              console.log('🔐 Local OTP:', localOtp);
            } else {
              toast('Verification code generated. Check your email or contact support.', { 
                icon: '⚠️',
                duration: 5000 
              });
            }
          }
        }
      } else {
        toast.error(response.data?.message || 'Failed to send verification code');
      }
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || 'Failed to send verification code';
      
      // Check if user already has a vendor account
      if (errorData?.data?.hasVendorAccount) {
        toast.error(`${errorMsg}`);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(errorMsg);
      }
      console.error('Send OTP error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 1b: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vendor/verify-otp`, {
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });

      if (response.data?.error === false) {
        setEmailVerified(true);
        setFormData(prev => ({ ...prev, email: email.toLowerCase().trim() }));
        toast.success('Email verified successfully!');
        setTimeout(() => setStep(2), 1000);
      } else {
        toast.error(response.data?.message || 'Invalid verification code');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
      console.error('Verify OTP error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate store slug from store name
    if (name === 'storeName') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        storeSlug: slug
      }));
    }
  };

  // Step 2: Complete Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email must be verified
    if (!emailVerified) {
      toast.error('Please verify your email address first');
      setStep(1);
      return;
    }
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.name || !formData.storeName || !formData.storeSlug) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/vendor/apply`, {
        name: formData.name,
        email: email.toLowerCase().trim(),
        password: formData.password,
        storeName: formData.storeName,
        storeSlug: formData.storeSlug,
        description: formData.description,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        country: formData.country,
        city: formData.city,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        postalCode: formData.postalCode
      });

      if (response.data?.error === false) {
        toast.success(response.data?.message || 'Application submitted successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Check if email verification is required
        if (response.data?.data?.requiresEmailVerification) {
          toast.error('Please verify your email first');
          setEmailVerified(false);
          setStep(1);
        } else {
          toast.error(response.data?.message || 'Registration failed');
        }
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.data?.requiresEmailVerification) {
        toast.error('Please verify your email first');
        setEmailVerified(false);
        setStep(1);
      } else if (errorData?.data?.hasVendorAccount) {
        toast.error(errorData?.message || 'You already have a vendor account. Please login instead.');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(errorData?.message || 'Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Email Verification
  if (step === 1) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Become a Vendor</h1>
        <p className="text-gray-600 mb-6">First, let's verify your email address.</p>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              emailVerified ? 'bg-green-500 text-white' : 'bg-[#efb291] text-white'
            }`}>
              {emailVerified ? '✓' : '1'}
            </div>
            <div className={`w-16 h-1 ${emailVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              emailVerified ? 'bg-[#efb291] text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] disabled:bg-gray-100"
              placeholder="your@email.com"
              required
              disabled={emailVerified || otpSent}
            />
          </div>

          {/* Send OTP Button */}
          {!otpSent && !emailVerified && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={otpLoading || !email}
              className="w-full bg-[#efb291] text-white py-3 rounded-lg hover:bg-[#e5a67d] disabled:opacity-50 font-medium transition-colors"
            >
              {otpLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          )}

          {/* OTP Input (shown after OTP is sent) */}
          {otpSent && !emailVerified && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  📧 We sent a 6-digit code to <strong>{email}</strong>
                </p>
                <p className="text-blue-600 text-xs mt-1">Check your inbox and spam folder</p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">Enter Verification Code *</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-[#efb291] text-white py-3 rounded-lg hover:bg-[#e5a67d] disabled:opacity-50 font-medium transition-colors"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-sm text-gray-600 hover:text-[#efb291] disabled:opacity-50 transition-colors underline"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Change email address
              </button>
            </>
          )}

          {/* Email Verified Success */}
          {emailVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Email verified successfully!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">Proceeding to registration...</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center border-t pt-6">
          <p className="text-gray-600">Already have a vendor account?</p>
          <Link
            to="/login"
            className="text-[#efb291] hover:text-[#e5a67d] font-medium transition-colors"
          >
            Login →
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complete Your Registration</h1>
          <p className="text-gray-600 mt-1">Fill out the form below to apply as a vendor.</p>
        </div>
        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{email}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="w-6 h-6 bg-[#efb291] text-white rounded-full text-sm flex items-center justify-center mr-2">1</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="w-6 h-6 bg-[#efb291] text-white rounded-full text-sm flex items-center justify-center mr-2">2</span>
            Store Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Store Name *</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="My Amazing Store"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Store URL Slug *</label>
              <input
                type="text"
                name="storeSlug"
                value={formData.storeSlug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="my-amazing-store"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your store will be at: zubahouse.com/vendor/{formData.storeSlug || 'your-store'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Store Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Tell customers about your store and products..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="w-6 h-6 bg-[#efb291] text-white rounded-full text-sm flex items-center justify-center mr-2">3</span>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="w-6 h-6 bg-[#efb291] text-white rounded-full text-sm flex items-center justify-center mr-2">4</span>
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Canada"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Ottawa"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="123 Main Street"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="Apt 4B"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
                placeholder="K1A 0B1"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#efb291] text-white py-3 rounded-lg hover:bg-[#e5a67d] disabled:opacity-50 font-medium transition-colors text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Application...
            </span>
          ) : (
            'Submit Vendor Application'
          )}
        </button>

        {/* Back to Step 1 */}
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setEmailVerified(false);
            setOtpSent(false);
            setOtp('');
          }}
          className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          ← Back to email verification
        </button>
      </form>

      <div className="mt-6 text-center border-t pt-6">
        <p className="text-gray-600">Already have a vendor account?</p>
        <Link
          to="/login"
          className="text-[#efb291] hover:text-[#e5a67d] font-medium transition-colors"
        >
          Login →
        </Link>
      </div>
    </div>
  );
};

export default Register;
