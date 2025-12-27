import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  Store, Upload, Save, Loader, Globe, 
  Phone, Mail, MapPin, Image 
} from 'lucide-react';

const StoreProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    storeName: '',
    storeSlug: '',
    description: '',
    shortDescription: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    logoUrl: '',
    bannerUrl: '',
    shippingPolicy: '',
    returnPolicy: '',
    handlingTimeDays: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      website: '',
    },
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
      
      setFormData({
        storeName: data.storeName || '',
        storeSlug: data.storeSlug || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        email: data.email || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        country: data.country || '',
        city: data.city || '',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        postalCode: data.postalCode || '',
        logoUrl: data.logoUrl || '',
        bannerUrl: data.bannerUrl || '',
        shippingPolicy: data.shippingPolicy || '',
        returnPolicy: data.returnPolicy || '',
        handlingTimeDays: data.handlingTimeDays || '',
        socialLinks: {
          facebook: data.socialLinks?.facebook || '',
          instagram: data.socialLinks?.instagram || '',
          twitter: data.socialLinks?.twitter || '',
          website: data.socialLinks?.website || '',
        },
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load store profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (field) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, convert to base64 (in production, upload to cloud storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [field]: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.storeName.trim()) {
      toast.error('Store name is required');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        handlingTimeDays: formData.handlingTimeDays ? parseInt(formData.handlingTimeDays) : undefined,
      };

      await vendorApi.updateProfile(payload);
      toast.success('Store profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Store Profile</h1>
        <p className="text-gray-600 mt-1">Manage your store information and branding</p>
      </div>

      {/* Store Status */}
      <div className={`mb-6 p-4 rounded-lg border-l-4 ${
        profile?.status === 'APPROVED' ? 'bg-green-50 border-green-500' :
        profile?.status === 'PENDING' ? 'bg-yellow-50 border-yellow-500' :
        profile?.status === 'SUSPENDED' ? 'bg-red-50 border-red-500' :
        'bg-gray-50 border-gray-500'
      }`}>
        <div className="flex items-center">
          <Store className={`w-5 h-5 mr-3 ${
            profile?.status === 'APPROVED' ? 'text-green-500' :
            profile?.status === 'PENDING' ? 'text-yellow-500' :
            profile?.status === 'SUSPENDED' ? 'text-red-500' :
            'text-gray-500'
          }`} />
          <div>
            <p className="font-medium">Store Status: {profile?.status || 'Unknown'}</p>
            <p className="text-sm text-gray-600">
              {profile?.status === 'APPROVED' && 'Your store is live and visible to customers'}
              {profile?.status === 'PENDING' && 'Your store is pending approval'}
              {profile?.status === 'SUSPENDED' && 'Your store has been suspended'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">zubahouse.com/store/</span>
                    <input
                      type="text"
                      name="storeSlug"
                      value={formData.storeSlug}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent lowercase"
                      pattern="[a-z0-9-]+"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Brief tagline for your store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Tell customers about your store..."
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" /> Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <MapPin className="w-5 h-5 inline mr-2" /> Address
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Store Policies</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Policy
                </label>
                <textarea
                  name="shippingPolicy"
                  value={formData.shippingPolicy}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Describe your shipping policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Policy
                </label>
                <textarea
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Describe your return policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handling Time (Days)
                </label>
                <input
                  type="number"
                  name="handlingTimeDays"
                  value={formData.handlingTimeDays}
                  onChange={handleChange}
                  min="0"
                  max="30"
                  className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="1-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <Image className="w-5 h-5 inline mr-2" /> Store Logo
            </h2>
            
            <div className="text-center">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Store Logo"
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 border"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Store className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload('logoUrl')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Store Banner</h2>
            
            <div className="text-center">
              {formData.bannerUrl ? (
                <img
                  src={formData.bannerUrl}
                  alt="Store Banner"
                  className="w-full h-32 object-cover rounded-lg mb-4 border"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload('bannerUrl')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <Globe className="w-5 h-5 inline mr-2" /> Social Links
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent text-sm"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent text-sm"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent text-sm"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreProfile;
