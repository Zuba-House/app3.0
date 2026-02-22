import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { Search, Save, Loader, Globe, Tag, FileText } from 'lucide-react';

const StoreSEO = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getProfile();
      const data = response.data.data;
      
      setFormData({
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await vendorApi.updateProfile(formData);
      toast.success('SEO settings updated successfully');
    } catch (error) {
      console.error('Update SEO error:', error);
      toast.error(error.response?.data?.message || 'Failed to update SEO settings');
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
        <h1 className="text-3xl font-bold text-gray-800">SEO Settings</h1>
        <p className="text-gray-600 mt-1">Optimize your store for search engines</p>
      </div>

      {/* SEO Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Search Preview</h2>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">
            zubahouse.com/store/your-store-slug
          </p>
          <p className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">
            {formData.seoTitle || 'Your Store Name - Zuba House'}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {formData.seoDescription || 'Add a description to tell customers about your store and products...'}
          </p>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          This is how your store may appear in search results
        </p>
      </div>

      {/* SEO Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Meta Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                placeholder="Your Store Name | Best Products"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Recommended: 50-60 characters
                </p>
                <p className={`text-xs ${formData.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.seoTitle.length}/60
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                placeholder="Describe your store and what makes it unique..."
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Recommended: 150-160 characters
                </p>
                <p className={`text-xs ${formData.seoDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.seoDescription.length}/160
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Tag className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Keywords</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Keywords
            </label>
            <textarea
              name="seoKeywords"
              value={formData.seoKeywords}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas. Include terms customers might search for.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-start">
            <Globe className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">SEO Tips</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Keep your title concise and include your main keyword</li>
                <li>• Write a compelling description that encourages clicks</li>
                <li>• Include relevant keywords naturally in your content</li>
                <li>• Update your SEO settings when you add new product categories</li>
                <li>• Use unique descriptions - avoid copying from other sites</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center px-6 py-3 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save SEO Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default StoreSEO;
