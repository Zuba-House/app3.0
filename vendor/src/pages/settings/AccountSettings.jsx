import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  User, Mail, Lock, Bell, Shield, 
  LogOut, Save, Loader, AlertTriangle, Eye, EyeOff 
} from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPayouts: true,
    emailProducts: true,
    emailMarketing: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getProfile();
      const data = response.data.data;
      setProfile(data);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData(prev => ({
        ...prev,
        name: user.name || data.ownerUser?.name || '',
        email: user.email || data.email || '',
      }));
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Password validation if changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    try {
      setSaving(true);
      
      // Update profile
      await vendorApi.updateProfile({
        email: formData.email,
      });
      
      toast.success('Account settings updated successfully');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Update settings error:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#efb291]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
            </div>
            
            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your name</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Bell className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Email Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-800">Order Notifications</p>
                  <p className="text-sm text-gray-500">Get notified when you receive new orders</p>
                </div>
                <input
                  type="checkbox"
                  name="emailOrders"
                  checked={notifications.emailOrders}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-[#efb291] focus:ring-[#efb291] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-800">Payout Notifications</p>
                  <p className="text-sm text-gray-500">Get notified about payout status updates</p>
                </div>
                <input
                  type="checkbox"
                  name="emailPayouts"
                  checked={notifications.emailPayouts}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-[#efb291] focus:ring-[#efb291] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-800">Product Updates</p>
                  <p className="text-sm text-gray-500">Get notified about product approval status</p>
                </div>
                <input
                  type="checkbox"
                  name="emailProducts"
                  checked={notifications.emailProducts}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-[#efb291] focus:ring-[#efb291] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-800">Marketing Emails</p>
                  <p className="text-sm text-gray-500">Receive tips, news, and promotions</p>
                </div>
                <input
                  type="checkbox"
                  name="emailMarketing"
                  checked={notifications.emailMarketing}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-[#efb291] focus:ring-[#efb291] rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Account Status</h2>
            </div>
            
            <div className={`p-4 rounded-lg ${
              profile?.status === 'APPROVED' ? 'bg-green-50' :
              profile?.status === 'PENDING' ? 'bg-yellow-50' :
              profile?.status === 'SUSPENDED' ? 'bg-red-50' :
              'bg-gray-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  profile?.status === 'APPROVED' ? 'bg-green-500' :
                  profile?.status === 'PENDING' ? 'bg-yellow-500' :
                  profile?.status === 'SUSPENDED' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="font-medium">
                  {profile?.status || 'Unknown'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {profile?.status === 'APPROVED' && 'Your account is verified and active'}
                {profile?.status === 'PENDING' && 'Waiting for admin approval'}
                {profile?.status === 'SUSPENDED' && 'Please contact support'}
              </p>
            </div>

            {/* Vendor Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Store Name</p>
              <p className="font-medium text-gray-800">{profile?.storeName}</p>
              
              <p className="text-sm text-gray-500 mt-3">Store URL</p>
              <p className="font-mono text-sm text-[#efb291]">
                zubahouse.com/store/{profile?.storeSlug}
              </p>
              
              <p className="text-sm text-gray-500 mt-3">Commission Rate</p>
              <p className="font-medium text-gray-800">{profile?.commissionRate || 10}%</p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              To delete your account, please contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
