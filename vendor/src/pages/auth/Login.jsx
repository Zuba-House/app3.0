import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // Try vendor-specific login first
      const response = await axios.post(`${API_URL}/api/vendor/login`, {
        email: email.toLowerCase().trim(),
        password
      });

      if (response.data?.error === false && response.data?.data?.accesstoken) {
        const token = response.data.data.accesstoken;
        const refreshToken = response.data.data.refreshToken;
        
        // Store tokens
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Decode token to get user info
        try {
          const decoded = jwtDecode(token);
          localStorage.setItem('userRole', decoded.role || 'VENDOR');
          if (decoded.vendorId) {
            localStorage.setItem('vendorId', decoded.vendorId);
          }
        } catch (decodeError) {
          console.error('Token decode error:', decodeError);
        }

        // Store user and vendor info
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        if (response.data.data.vendor) {
          localStorage.setItem('vendor', JSON.stringify(response.data.data.vendor));
        }

        // Check vendor status
        const vendorStatus = response.data.data.vendor?.status;
        if (vendorStatus === 'PENDING') {
          toast.success('Login successful! Your vendor account is pending approval.');
        } else if (vendorStatus === 'APPROVED') {
          toast.success('Login successful!');
        } else {
          toast.success('Login successful!');
        }
        
        navigate('/dashboard');
      } else {
        toast.error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Login</h1>
        <p className="text-gray-600 mt-2">Welcome back! Login to your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] transition-colors"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#efb291] transition-colors pr-12"
              placeholder="••••••••"
              required
              autoComplete="current-password"
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

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#efb291] hover:text-[#e5a67d] transition-colors"
          >
            Forgot Password?
          </Link>
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
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center border-t pt-6">
        <p className="text-gray-600 mb-2">Don't have a vendor account?</p>
        <Link
          to="/register"
          className="text-[#efb291] hover:text-[#e5a67d] font-medium transition-colors"
        >
          Register as Vendor →
        </Link>
      </div>
    </div>
  );
};

export default Login;
