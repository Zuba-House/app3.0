import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaImage, 
  FaTags, 
  FaDollarSign, 
  FaCube,
  FaSave,
  FaEye,
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaStar,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { MyContext } from '../../../App';
import { fetchDataFromApi, postData, uploadImages } from '../../../utils/api';
import UploadBox from '../../../Components/UploadBox';
import MediaLibrary from '../../../Components/MediaLibrary';
import SimpleProduct from './SimpleProduct';
import VariableProduct from './VariableProduct';
import CircularProgress from '@mui/material/CircularProgress';

const AddProductEnhanced = () => {
  const context = useContext(MyContext);
  const history = useNavigate();

  // Product Type Selection
  const [productType, setProductType] = useState('simple');
  
  // Media Library State
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaLibraryType, setMediaLibraryType] = useState('product'); // 'product' or 'banner'
  
  // Basic Information
  const [formData, setFormData] = useState({
    // Basic
    name: '',
    description: '',
    shortDescription: '',
    
    // Categories (backward compatible)
    category: '',
    categories: [],
    catName: '',
    subCat: '',
    subCatId: '',
    thirdsubCat: '',
    thirdsubCatId: '',
    
    // Identification
    sku: '',
    barcode: '',
    brand: '',
    
    // Status
    status: 'draft',
    visibility: 'visible',
    isFeatured: false,
    
    // Images
    images: [],
    featuredImage: '',
    bannerimages: [],
    bannerTitleName: '',
    isDisplayOnHomeBanner: false,
    
    // Simple Product Fields
    pricing: {
      regularPrice: 0,
      salePrice: null,
      saleStartDate: null,
      saleEndDate: null,
      taxStatus: 'taxable',
      taxClass: 'standard',
      currency: 'USD'
    },
    
    inventory: {
      manageStock: true,
      stock: 0,
      stockStatus: 'in_stock',
      allowBackorders: 'no',
      lowStockThreshold: 5,
      soldIndividually: false
    },
    
    shipping: {
      weight: null,
      weightUnit: 'kg',
      dimensions: {
        length: null,
        width: null,
        height: null,
        unit: 'cm'
      },
      shippingClass: 'standard',
      freeShipping: false
    },
    
    // Variable Product Fields
    attributes: [],
    variations: [],
    
    // Additional
    tags: [],
    
    // SEO
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      slug: ''
    },
    
    // Legacy fields (for backward compatibility)
    oldPrice: 0,
    discount: 0,
    countInStock: 0,
    rating: 0,
    productRam: [],
    size: [],
    productWeight: []
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thirdLevelCategories, setThirdLevelCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [bannerPreviews, setBannerPreviews] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    if (context?.catData?.length > 0) {
      setCategories(context.catData);
    } else {
      fetchCategories();
    }
  }, [context?.catData]);

  const fetchCategories = async () => {
    try {
      const response = await fetchDataFromApi('/api/category');
      if (response?.error === false && response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle category change (fetch subcategories)
  const handleCategoryChange = async (categoryId) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      categories: prev.categories.includes(categoryId) 
        ? prev.categories.filter(id => id !== categoryId) 
        : [...prev.categories, categoryId],
      catId: categoryId,
      catName: selectedCategory?.name || '',
      subCat: '',
      thirdsubCat: ''
    }));

    // Fetch subcategories
    if (selectedCategory?.children && selectedCategory.children.length > 0) {
      setSubCategories(selectedCategory.children);
    } else {
      setSubCategories([]);
    }
    setThirdLevelCategories([]);
  };

  // Handle multiple category toggle
  const handleCategoryToggle = (categoryId) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    setFormData(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: newCategories,
        category: newCategories.length > 0 ? newCategories[0] : prev.category,
        catId: newCategories.length > 0 ? newCategories[0] : prev.catId,
        catName: newCategories.length > 0 ? selectedCategory?.name || prev.catName : prev.catName
      };
    });
  };

  // Handle subcategory change
  const handleSubCategoryChange = async (subCatId) => {
    const selectedSubCat = subCategories.find(sub => sub._id === subCatId);
    
    setFormData(prev => ({
      ...prev,
      subCat: subCatId,
      subCatId: subCatId,
      subCat: selectedSubCat?.name || '',
      thirdsubCat: ''
    }));

    // Fetch third level categories
    if (selectedSubCat?.children && selectedSubCat.children.length > 0) {
      setThirdLevelCategories(selectedSubCat.children);
    } else {
      setThirdLevelCategories([]);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (e.g., seo.metaTitle, pricing.regularPrice)
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        if (!newData[keys[0]]) {
          newData[keys[0]] = {};
        }
        newData[keys[0]] = {
          ...newData[keys[0]],
          [keys[1]]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        };
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  // Handle image upload using existing UploadBox component
  const setPreviewsFun = (previewsArr) => {
    const imgArr = [...previews];
    for (let i = 0; i < previewsArr.length; i++) {
      imgArr.push(previewsArr[i]);
    }
    setPreviews(imgArr);
    
    // Update formData with images in new format
    const imagesFormatted = imgArr.map((url, index) => ({
      url: typeof url === 'string' ? url : url.url || url,
      alt: '',
      title: '',
      position: index,
      isFeatured: index === 0
    }));
    
    setFormData(prev => ({
      ...prev,
      images: imagesFormatted,
      featuredImage: imgArr[0] || ''
    }));
  };

  const setBannerImagesFun = (previewsArr) => {
    const imgArr = [...bannerPreviews];
    for (let i = 0; i < previewsArr.length; i++) {
      imgArr.push(previewsArr[i]);
    }
    setBannerPreviews(imgArr);
    setFormData(prev => ({
      ...prev,
      bannerimages: imgArr
    }));
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    const imagesFormatted = newPreviews.map((url, idx) => ({
      url: typeof url === 'string' ? url : url.url || url,
      alt: '',
      title: '',
      position: idx,
      isFeatured: idx === 0
    }));
    
    setFormData(prev => ({
      ...prev,
      images: imagesFormatted,
      featuredImage: newPreviews[0] || ''
    }));
  };

  const removeBannerImage = (index) => {
    const newBannerPreviews = bannerPreviews.filter((_, i) => i !== index);
    setBannerPreviews(newBannerPreviews);
    setFormData(prev => ({
      ...prev,
      bannerimages: newBannerPreviews
    }));
  };

  // Handle media library selection
  const handleMediaSelect = (selectedMedia) => {
    if (selectedMedia.length === 0) return;
    
    const urls = selectedMedia.map(item => item.secureUrl || item.url);
    
    if (mediaLibraryType === 'product') {
      const imgArr = [...previews, ...urls];
      setPreviews(imgArr);
      
      const imagesFormatted = imgArr.map((url, index) => ({
        url: typeof url === 'string' ? url : url.url || url,
        alt: '',
        title: '',
        position: index,
        isFeatured: index === 0
      }));
      
      setFormData(prev => ({
        ...prev,
        images: imagesFormatted,
        featuredImage: imgArr[0] || ''
      }));
    } else {
      const bannerArr = [...bannerPreviews, ...urls];
      setBannerPreviews(bannerArr);
      setFormData(prev => ({
        ...prev,
        bannerimages: bannerArr
      }));
    }
  };

  const openMediaLibrary = (type) => {
    setMediaLibraryType(type);
    setMediaLibraryOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Product category is required';
    }
    
    if (previews.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    if (productType === 'simple') {
      const regularPrice = formData.pricing?.regularPrice || formData.oldPrice || 0;
      if (!regularPrice || regularPrice <= 0) {
        newErrors.regularPrice = 'Regular price must be greater than 0';
      }
      
      if (formData.inventory?.manageStock !== false) {
        const stock = formData.inventory?.stock || formData.countInStock || 0;
        if (stock < 0) {
          newErrors.stock = 'Stock cannot be negative';
        }
      }
    } else if (productType === 'variable') {
      if (!formData.attributes || formData.attributes.length === 0) {
        newErrors.attributes = 'Variable products must have at least one attribute';
      }
      
      if (!formData.variations || formData.variations.length === 0) {
        newErrors.variations = 'Variable products must have at least one variation';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      context.alertBox('error', 'Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Prepare product data for API
      const productData = {
        ...formData,
        productType,
        
        // Ensure images are set from previews (convert to string array for API)
        images: previews.map(url => typeof url === 'string' ? url : url.url || url),
        bannerimages: bannerPreviews.map(url => typeof url === 'string' ? url : url.url || url),
        
        // Explicitly include variations and attributes for variable products
        variations: formData.variations || [],
        attributes: formData.attributes || [],
        
        // Map new structure to legacy fields for backward compatibility
        price: formData.pricing?.salePrice || formData.pricing?.regularPrice || formData.oldPrice || 0,
        oldPrice: formData.pricing?.regularPrice || formData.oldPrice || 0,
        countInStock: formData.inventory?.stock || formData.countInStock || 0,
        
        // Ensure pricing object is properly structured
        pricing: {
          regularPrice: formData.pricing?.regularPrice || formData.oldPrice || 0,
          salePrice: formData.pricing?.salePrice || null,
          price: formData.pricing?.salePrice || formData.pricing?.regularPrice || formData.oldPrice || 0,
          currency: formData.pricing?.currency || formData.currency || 'USD',
          onSale: formData.pricing?.salePrice && formData.pricing.salePrice < formData.pricing.regularPrice,
          taxStatus: formData.pricing?.taxStatus || 'taxable',
          taxClass: formData.pricing?.taxClass || 'standard'
        },
        
        // Ensure inventory object is properly structured
        inventory: {
          stock: formData.inventory?.stock || formData.countInStock || 0,
          stockStatus: formData.inventory?.stockStatus || ((formData.inventory?.stock || formData.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock'),
          manageStock: formData.inventory?.manageStock !== false,
          allowBackorders: formData.inventory?.allowBackorders || 'no',
          lowStockThreshold: formData.inventory?.lowStockThreshold || 5,
          soldIndividually: formData.inventory?.soldIndividually || false
        },
        
        // Generate slug if not provided
        seo: {
          ...formData.seo,
          slug: formData.seo?.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      };

      // Debug logging
      console.log('Submitting product data:', {
        productType,
        variationsCount: productData.variations?.length || 0,
        attributesCount: productData.attributes?.length || 0,
        variations: productData.variations,
        attributes: productData.attributes
      });

      const response = await postData('/api/product/create', productData);
      
      if (response?.error === false) {
        context.alertBox('success', response?.message || 'Product created successfully!');
        
        setTimeout(() => {
          setLoading(false);
          context.setIsOpenFullScreenPanel({
            open: false,
          });
          history('/products');
        }, 1000);
      } else {
        setLoading(false);
        context.alertBox('error', response?.message || 'Failed to create product. Please try again.');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setLoading(false);
      context.alertBox('error', 'Failed to create product. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b2735', padding: '20px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#e5e2db' }}>
                <FaBox className="inline mr-3" style={{ color: '#efb291' }} />
                Add New Product
              </h1>
              <p style={{ color: '#e5e2db', opacity: 0.7 }}>
                Create a new product for your store
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid #efb291' }}
              >
                <FaEye className="inline mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} style={{ color: '#0b2735' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="inline" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Type Selector */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setProductType('simple')}
              className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
              style={{
                backgroundColor: productType === 'simple' ? '#efb291' : '#1a3d52',
                color: productType === 'simple' ? '#0b2735' : '#e5e2db',
                border: `2px solid ${productType === 'simple' ? '#efb291' : 'rgba(239, 178, 145, 0.2)'}`
              }}
            >
              <FaCube className="inline mr-2" />
              Simple Product
              <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                Single product with no variations
              </p>
            </button>
            <button
              type="button"
              onClick={() => setProductType('variable')}
              className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
              style={{
                backgroundColor: productType === 'variable' ? '#efb291' : '#1a3d52',
                color: productType === 'variable' ? '#0b2735' : '#e5e2db',
                border: `2px solid ${productType === 'variable' ? '#efb291' : 'rgba(239, 178, 145, 0.2)'}`
              }}
            >
              <FaTags className="inline mr-2" />
              Variable Product
              <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                Product with variations (size, color, etc.)
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
                  <FaInfoCircle style={{ color: '#efb291' }} />
                  Basic Information
                </h2>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Short Description */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Brief product summary (max 500 characters)"
                    rows="3"
                    maxLength="500"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
                    {formData.shortDescription.length}/500 characters
                  </p>
                </div>

                {/* Product Description */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Product Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed product description"
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* SKU and Barcode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="e.g., ZH-TSHIRT-001"
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="e.g., 123456789012"
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    />
                  </div>
                </div>

                {/* Brand */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Product Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
                  <FaTags style={{ color: '#efb291' }} />
                  Categories
                </h2>

                {/* Product Category - Primary */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Primary Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    required
                  >
                    <option value="">Select Primary Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Additional Categories (Multiple) */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Additional Categories (Optional)
                  </label>
                  <div className="max-h-[200px] overflow-y-auto border rounded-lg p-3" style={{ backgroundColor: '#0b2735', borderColor: 'rgba(239, 178, 145, 0.2)' }}>
                    {categories.map(cat => (
                      <label key={cat._id} className="flex items-center gap-2 mb-2 cursor-pointer" style={{ color: '#e5e2db' }}>
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat._id)}
                          onChange={() => handleCategoryToggle(cat._id)}
                          className="w-4 h-4"
                          style={{ accentColor: '#efb291' }}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  {formData.categories.length > 0 && (
                    <p className="text-sm mt-2" style={{ color: '#efb291' }}>
                      Selected: {formData.categories.length} categor{formData.categories.length === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </div>

                {/* Sub Category */}
                {subCategories.length > 0 && (
                  <div className="mb-4">
                    <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                      Product Sub Category
                    </label>
                    <select
                      name="subCat"
                      value={formData.subCatId}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    >
                      <option value="">Select Sub Category (Optional)</option>
                      {subCategories.map(subCat => (
                        <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Third Level Category */}
                {thirdLevelCategories.length > 0 && (
                  <div className="mb-4">
                    <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                      Product Third Level Category
                    </label>
                    <select
                      name="thirdsubCat"
                      value={formData.thirdsubCatId}
                      onChange={(e) => {
                        const selected = thirdLevelCategories.find(cat => cat._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          thirdsubCatId: e.target.value,
                          thirdsubCat: selected?.name || ''
                        }));
                      }}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                    >
                      <option value="">Select Third Level Category (Optional)</option>
                      {thirdLevelCategories.map(thirdCat => (
                        <option key={thirdCat._id} value={thirdCat._id}>{thirdCat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Product Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tags separated by commas (e.g., summer, cotton, casual)"
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
                      setFormData(prev => ({ ...prev, tags }));
                    }}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Type Specific Content */}
              {productType === 'simple' ? (
                <SimpleProduct 
                  formData={formData} 
                  setFormData={setFormData} 
                  errors={errors}
                  handleChange={handleChange}
                />
              ) : (
                <VariableProduct 
                  formData={formData} 
                  setFormData={setFormData} 
                  errors={errors}
                />
              )}

              {/* Images */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
                  <FaImage style={{ color: '#efb291' }} />
                  Media & Images
                </h2>

                {/* Product Images */}
                <div className="mb-6">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Product Images <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previews.map((image, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#0b2735', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                      >
                        <img
                          src={typeof image === 'string' ? image : image.url || image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 rounded-full"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff' }}
                        >
                          <FaTrash size={12} />
                        </button>
                        {index === 0 && (
                          <div
                            className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold"
                            style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                          >
                            Featured
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <UploadBox 
                      multiple={true} 
                      name="images" 
                      url="/api/product/uploadImages" 
                      setPreviewsFun={setPreviewsFun} 
                    />
                    <button
                      type="button"
                      onClick={() => openMediaLibrary('product')}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      <FaImage /> Choose from Library
                    </button>
                  </div>
                  
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                  )}
                </div>

                {/* Banner Images */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Banner Images (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {bannerPreviews.map((banner, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#0b2735', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                      >
                        <img
                          src={typeof banner === 'string' ? banner : banner.url || banner}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeBannerImage(index)}
                          className="absolute top-2 right-2 p-2 rounded-full"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff' }}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <UploadBox 
                      multiple={true} 
                      name="bannerimages" 
                      url="/api/product/uploadBannerImages" 
                      setPreviewsFun={setBannerImagesFun} 
                    />
                    <button
                      type="button"
                      onClick={() => openMediaLibrary('banner')}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      <FaImage /> Choose from Library
                    </button>
                  </div>
                </div>

                {/* Banner Title */}
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Banner Title
                  </label>
                  <input
                    type="text"
                    name="bannerTitleName"
                    value={formData.bannerTitleName}
                    onChange={handleChange}
                    placeholder="Enter banner title"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                </div>

                {/* Display on Home Banner */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isDisplayOnHomeBanner: !prev.isDisplayOnHomeBanner }))}
                    className="text-3xl"
                    style={{ color: formData.isDisplayOnHomeBanner ? '#10b981' : '#6b7280' }}
                  >
                    {formData.isDisplayOnHomeBanner ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <label className="font-semibold" style={{ color: '#e5e2db' }}>
                    Display on Home Banner
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Product Status */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                  Product Status
                </h3>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility || 'visible'}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  >
                    <option value="visible">Visible (Public)</option>
                    <option value="catalog">Catalog Only</option>
                    <option value="search">Search Only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                  <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
                    Control where this product appears
                  </p>
                </div>

                {/* Is Featured */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    className="text-3xl"
                    style={{ color: formData.isFeatured ? '#10b981' : '#6b7280' }}
                  >
                    {formData.isFeatured ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <label className="font-semibold flex items-center gap-2" style={{ color: '#e5e2db' }}>
                    <FaStar style={{ color: '#efb291' }} />
                    Featured Product
                  </label>
                </div>
              </div>

              {/* Rating (Legacy Support) */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                  Product Rating
                </h3>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Initial Rating (1-5 stars)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar
                        key={star}
                        style={{ color: star <= formData.rating ? '#efb291' : '#6b7280', fontSize: '20px' }}
                      />
                    ))}
                    <span className="ml-2" style={{ color: '#e5e2db' }}>{formData.rating}</span>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                  SEO Settings
                </h3>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    value={formData.seo?.metaTitle || ''}
                    onChange={handleChange}
                    placeholder="Product SEO title"
                    maxLength="60"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
                    {(formData.seo?.metaTitle || '').length}/60
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    SEO Description
                  </label>
                  <textarea
                    name="seo.metaDescription"
                    value={formData.seo?.metaDescription || ''}
                    onChange={handleChange}
                    placeholder="Product SEO description"
                    maxLength="160"
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
                    {(formData.seo?.metaDescription || '').length}/160
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="seo.slug"
                    value={formData.seo?.slug || ''}
                    onChange={handleChange}
                    placeholder="product-url-slug"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
                    Leave empty to auto-generate from product name
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Media Library Dialog */}
      <MediaLibrary
        open={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        multiple={true}
      />
    </div>
  );
};

export default AddProductEnhanced;

