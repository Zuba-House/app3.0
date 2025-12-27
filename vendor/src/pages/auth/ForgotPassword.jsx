import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Request password reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vendor/forgot-password`, {
        email: email.toLowerCase().trim()
      });

      if (response.data?.error === false) {
        toast.success('If an account exists, you will receive a reset code.');
        setStep(2);
      } else {
        toast.error(response.data?.message || 'Failed to send reset code');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vendor/reset-password`, {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        newPassword
      });

      if (response.data?.error === false) {
        toast.success('Password reset successful! Please login.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(response.data?.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/vendor/forgot-password`, {
        email: email.toLowerCase().trim()
      });

      if (response.data?.error === false) {
        toast.success('New reset code sent to your email');
        setOtp('');
      } else {
        toast.error(response.data?.message || 'Failed to resend code');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        <p className="text-gray-600 mt-2">
          {step === 1 
            ? "Enter your email to receive a reset code" 
            : "Enter the code and your new password"
          }
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-[#efb291] text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`w-16 h-1 ${step > 1 ? 'bg-[#efb291]' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-[#efb291] text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            2
          </div>
        </div>
      </div>

      {/* Step 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#efb291] text-white py-3 rounded-lg hover:bg-[#e5a67d] disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP and New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              📧 We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <p className="text-blue-600 text-xs mt-1">Check your inbox and spam folder</p>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Reset Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] pr-12"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291]"
              placeholder="Confirm new password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#efb291] text-white py-3 rounded-lg hover:bg-[#e5a67d] disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-[#efb291] disabled:opacity-50 transition-colors underline"
            >
              Didn't receive the code? Resend
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Change email address
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center border-t pt-6">
        <p className="text-gray-600">Remember your password?</p>
        <Link
          to="/login"
          className="text-[#efb291] hover:text-[#e5a67d] font-medium transition-colors"
        >
          Back to Login →
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
