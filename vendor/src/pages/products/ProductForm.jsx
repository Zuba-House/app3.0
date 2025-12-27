import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi, categoryApi } from '../../utils/api';
import { ArrowLeft, Upload, X, Save, Loader } from 'lucide-react';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    brand: '',
    categories: [],
    images: [],
    status: 'DRAFT',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    tags: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getProduct(id);
      const product = response.data.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        stock: product.stock || '',
        sku: product.sku || '',
        brand: product.brand || '',
        categories: product.categories?.map(c => c._id || c) || [],
        images: product.images || [],
        status: product.status || 'DRAFT',
        weight: product.weight || '',
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      });
      
      setImagePreview(product.images || []);
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dim = name.split('.')[1];
      setFormData({
        ...formData,
        dimensions: { ...formData.dimensions, [dim]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, categories: selected });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        stock: parseInt(formData.stock) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEditing) {
        await vendorApi.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await vendorApi.createProduct(payload);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Save product error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/products')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update product information' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Product SKU"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">L (cm)</label>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">W (cm)</label>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H (cm)</label>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status</h2>
            
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish</option>
            </select>
            
            <p className="text-sm text-gray-500 mt-2">
              Published products will be reviewed by admin before going live.
            </p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category</h2>
            
            <select
              multiple
              name="categories"
              value={formData.categories}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent min-h-[150px]"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Hold Ctrl/Cmd to select multiple categories
            </p>
          </div>

          {/* Brand & Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
