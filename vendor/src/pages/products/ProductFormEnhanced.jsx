import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi, categoryApi, uploadImages } from '../../utils/api';
import { 
  ArrowLeft, Upload, X, Save, Loader, Package, 
  DollarSign, Box, Tag, Image, Settings, ChevronDown, ChevronUp,
  Plus, Trash2, Star
} from 'lucide-react';

const ProductFormEnhanced = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Product Type Selection
  const [productType, setProductType] = useState('simple');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thirdLevelCategories, setThirdLevelCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    inventory: true,
    shipping: false,
    attributes: false,
    variations: false,
    seo: false
  });

  // Comprehensive form data matching admin structure
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    shortDescription: '',
    
    // Categories
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
    
    // Status (lowercase to match backend enum)
    status: 'draft',
    isFeatured: false,
    
    // Images
    images: [],
    
    // Pricing (Simple Product)
    pricing: {
      regularPrice: 0,
      salePrice: null,
      saleStartDate: null,
      saleEndDate: null,
      currency: 'USD',
      taxStatus: 'taxable',
      taxClass: 'standard'
    },
    
    // Inventory
    inventory: {
      manageStock: true,
      stock: 0,
      stockStatus: 'in_stock',
      endlessStock: false,
      lowStockThreshold: 5
    },
    
    // Shipping
    shipping: {
      weight: null,
      weightUnit: 'kg',
      dimensions: {
        length: null,
        width: null,
        height: null,
        unit: 'cm'
      },
      freeShipping: false
    },
    
    // Variable Product Fields
    attributes: [],
    variations: [],
    
    // Tags
    tags: [],
    
    // SEO
    seo: {
      metaTitle: '',
      metaDescription: '',
      slug: ''
    },
    
    // Legacy fields for backward compatibility
    price: 0,
    comparePrice: 0,
    stock: 0
  });

  // Attribute state for variable products
  const [newAttribute, setNewAttribute] = useState({ name: '', values: [] });
  const [newAttributeValue, setNewAttributeValue] = useState('');
  
  // Variation state
  const [variationData, setVariationData] = useState({
    attributes: {},
    regularPrice: '',
    salePrice: '',
    stock: 0,
    endlessStock: false,
    sku: '',
    image: ''
  });
  const [editingVariationIndex, setEditingVariationIndex] = useState(null);

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
      
      // Determine product type
      if (product.variations && product.variations.length > 0) {
        setProductType('variable');
      }
      
      // Process images - extract URLs for preview
      const productImages = product.images || [];
      const imageUrls = productImages.map(img => typeof img === 'string' ? img : (img?.url || img));
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || product.category || '',
        categories: product.categories?.map(c => c._id || c) || [],
        subCat: product.subCat || '',
        subCatId: product.subCatId || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        brand: product.brand || '',
        status: product.status || 'draft',
        isFeatured: product.isFeatured || false,
        images: productImages.map((img, i) => {
          if (typeof img === 'string') {
            return { url: img, alt: '', title: '', position: i, isFeatured: i === 0 };
          }
          return img;
        }),
        pricing: product.pricing || {
          regularPrice: product.oldPrice || product.price || 0,
          salePrice: (product.oldPrice && product.price < product.oldPrice) ? product.price : null,
          price: product.price || product.oldPrice || 0,
          currency: product.pricing?.currency || 'USD',
          taxStatus: 'taxable',
          taxClass: 'standard'
        },
        inventory: product.inventory || {
          manageStock: true,
          stock: product.stock || product.countInStock || 0,
          stockStatus: (product.stock || product.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock',
          endlessStock: false,
          lowStockThreshold: 5
        },
        shipping: product.shipping || {
          weight: product.weight || null,
          weightUnit: 'kg',
          dimensions: product.dimensions || { length: null, width: null, height: null, unit: 'cm' },
          freeShipping: false
        },
        attributes: product.attributes || [],
        variations: product.variations || [],
        tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map(t => t.trim()) : []),
        seo: product.seo || { metaTitle: '', metaDescription: '', slug: '' },
        price: product.price || 0,
        comparePrice: product.comparePrice || product.oldPrice || 0,
        stock: product.stock || 0
      });
      
      setImagePreview(imageUrls);
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        if (!newData[keys[0]]) newData[keys[0]] = {};
        
        if (keys.length === 3) {
          if (!newData[keys[0]][keys[1]]) newData[keys[0]][keys[1]] = {};
          newData[keys[0]][keys[1]][keys[2]] = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
        } else {
          newData[keys[0]][keys[1]] = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
        }
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      categories: prev.categories.includes(categoryId) 
        ? prev.categories.filter(id => id !== categoryId) 
        : [...prev.categories, categoryId],
      catName: selectedCategory?.name || '',
      subCat: '',
      subCatId: '',
      thirdsubCat: '',
      thirdsubCatId: ''
    }));
    
    if (selectedCategory?.children && selectedCategory.children.length > 0) {
      setSubCategories(selectedCategory.children);
    } else {
      setSubCategories([]);
    }
    setThirdLevelCategories([]);
  };

  const handleSubCategoryChange = (subCatId) => {
    const selectedSubCat = subCategories.find(sub => sub._id === subCatId);
    setFormData(prev => ({
      ...prev,
      subCatId: subCatId,
      subCat: selectedSubCat?.name || '',
      thirdsubCat: '',
      thirdsubCatId: ''
    }));
    
    if (selectedSubCat?.children && selectedSubCat.children.length > 0) {
      setThirdLevelCategories(selectedSubCat.children);
    } else {
      setThirdLevelCategories([]);
    }
  };

  const handleThirdLevelCategoryChange = (thirdCatId) => {
    const selectedThirdCat = thirdLevelCategories.find(cat => cat._id === thirdCatId);
    setFormData(prev => ({
      ...prev,
      thirdsubCatId: thirdCatId,
      thirdsubCat: selectedThirdCat?.name || ''
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types first (same as admin)
    for (const file of files) {
      if (!(file.type === "image/jpeg" || file.type === "image/jpg" ||
            file.type === "image/png" || file.type === "image/webp" || 
            file.type === "image/svg+xml")) {
        toast.error("Please select a valid JPG, PNG, SVG or WebP image file.");
        return;
      }
    }
    
    // Create FormData with all files (same approach as admin UploadBox)
    const formdata = new FormData();
    for (let i = 0; i < files.length; i++) {
      formdata.append('images', files[i]);
    }
    
    try {
      // Use the same uploadImages function as admin panel
      const res = await uploadImages('/api/product/uploadImages', formdata);
      
      // Handle response - same as admin
      const images = Array.isArray(res?.data?.images) 
        ? res.data.images 
        : Array.isArray(res?.images) 
          ? res.images 
          : [];
      
      if (images.length === 0) {
        toast.error(res?.message || 'No images were uploaded. Please try again.');
        return;
      }
      
      // Add each uploaded image
      images.forEach((imageUrl, index) => {
        const imageObj = {
          url: imageUrl,
          alt: formData.name || '',
          title: formData.name || '',
          position: imagePreview.length + index,
          isFeatured: imagePreview.length === 0 && index === 0
        };
        
        setImagePreview(prev => [...prev, imageUrl]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageObj]
        }));
      });
      
      toast.success(`${images.length} image(s) uploaded successfully`);
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error?.message || 'Failed to upload image');
    }
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // Update positions and featured flag
      return {
        ...prev,
        images: newImages.map((img, i) => ({
          ...img,
          position: i,
          isFeatured: i === 0
        }))
      };
    });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Attribute Management
  const addAttribute = () => {
    if (!newAttribute.name.trim() || newAttribute.values.length === 0) {
      toast.error('Please enter attribute name and at least one value');
      return;
    }

    const attribute = {
      name: newAttribute.name.trim(),
      slug: newAttribute.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      values: newAttribute.values.map(val => ({
        label: val.trim(),
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })),
      visible: true,
      variation: true
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), attribute]
    }));

    setNewAttribute({ name: '', values: [] });
    setNewAttributeValue('');
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const addValueToNewAttribute = () => {
    if (!newAttributeValue.trim()) return;
    
    if (!newAttribute.values.includes(newAttributeValue.trim())) {
      setNewAttribute(prev => ({
        ...prev,
        values: [...prev.values, newAttributeValue.trim()]
      }));
    }
    setNewAttributeValue('');
  };

  // Variation Management
  const generateVariations = () => {
    if (!formData.attributes || formData.attributes.length === 0) {
      toast.error('Please add attributes first');
      return;
    }

    const combinations = [];
    const attributeNames = formData.attributes.map(attr => attr.name);
    const attributeValues = formData.attributes.map(attr => attr.values);

    function generateCombinations(index, current) {
      if (index === attributeNames.length) {
        combinations.push({ ...current });
        return;
      }

      attributeValues[index].forEach(value => {
        generateCombinations(index + 1, {
          ...current,
          [attributeNames[index]]: value.label
        });
      });
    }

    generateCombinations(0, {});

    const variations = combinations.map((combo, index) => ({
      attributes: Object.entries(combo).map(([name, value]) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        value,
        valueSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })),
      regularPrice: formData.pricing?.regularPrice || 0,
      salePrice: null,
      price: formData.pricing?.regularPrice || 0,
      stock: 0,
      stockStatus: 'in_stock',
      manageStock: true,
      endlessStock: false,
      sku: `${formData.sku || 'VAR'}-${index + 1}`,
      isActive: true,
      isDefault: index === 0
    }));

    setFormData(prev => ({ ...prev, variations }));
    toast.success(`Generated ${variations.length} variations`);
  };

  const addVariation = () => {
    if (Object.keys(variationData.attributes).length === 0) {
      toast.error('Please select attribute values');
      return;
    }

    const variation = {
      attributes: Object.entries(variationData.attributes).map(([name, value]) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        value,
        valueSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })),
      regularPrice: parseFloat(variationData.regularPrice) || 0,
      salePrice: variationData.salePrice ? parseFloat(variationData.salePrice) : null,
      price: variationData.salePrice ? parseFloat(variationData.salePrice) : parseFloat(variationData.regularPrice) || 0,
      stock: variationData.endlessStock ? 999999 : (parseInt(variationData.stock) || 0),
      stockStatus: variationData.endlessStock ? 'in_stock' : (parseInt(variationData.stock) > 0 ? 'in_stock' : 'out_of_stock'),
      manageStock: true,
      endlessStock: variationData.endlessStock || false,
      sku: variationData.sku || '',
      image: variationData.image || '',
      isActive: true
    };

    if (editingVariationIndex !== null) {
      const updated = [...formData.variations];
      updated[editingVariationIndex] = variation;
      setFormData(prev => ({ ...prev, variations: updated }));
      setEditingVariationIndex(null);
    } else {
      setFormData(prev => ({
        ...prev,
        variations: [...(prev.variations || []), variation]
      }));
    }

    setVariationData({
      attributes: {},
      regularPrice: '',
      salePrice: '',
      stock: 0,
      endlessStock: false,
      sku: '',
      image: ''
    });
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const editVariation = (index) => {
    const variation = formData.variations[index];
    const attributesObj = {};
    variation.attributes.forEach(attr => {
      attributesObj[attr.name] = attr.value;
    });

    setVariationData({
      attributes: attributesObj,
      regularPrice: variation.regularPrice,
      salePrice: variation.salePrice || '',
      stock: variation.stock,
      endlessStock: variation.endlessStock || false,
      sku: variation.sku || '',
      image: variation.image || ''
    });
    setEditingVariationIndex(index);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }

    // Category validation
    if (!formData.category) {
      toast.error('Please select a primary category');
      return;
    }
    
    if (productType === 'simple') {
      const price = formData.pricing?.regularPrice || 0;
      if (!price || price <= 0) {
        toast.error('Valid price is required');
        return;
      }
    } else {
      if (!formData.attributes || formData.attributes.length === 0) {
        toast.error('Variable products need at least one attribute');
        return;
      }
      if (!formData.variations || formData.variations.length === 0) {
        toast.error('Variable products need at least one variation');
        return;
      }
    }

    if (formData.images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    try {
      setSaving(true);
      
      // Calculate the actual price
      const regularPrice = parseFloat(formData.pricing?.regularPrice) || 0;
      const salePrice = formData.pricing?.salePrice ? parseFloat(formData.pricing.salePrice) : null;
      const effectivePrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
      
      const payload = {
        ...formData,
        productType,
        
        // Set category (required)
        category: formData.category,
        categories: formData.categories.length > 0 ? formData.categories : [formData.category],
        catName: formData.catName || '',
        subCat: formData.subCat || '',
        subCatId: formData.subCatId || '',
        thirdsubCat: formData.thirdsubCat || '',
        thirdsubCatId: formData.thirdsubCatId || '',
        
        // Ensure images are properly formatted as objects with url
        images: formData.images.map((img, index) => {
          if (typeof img === 'string') {
            return {
              url: img,
              alt: formData.name || '',
              title: formData.name || '',
              position: index,
              isFeatured: index === 0
            };
          }
          return {
            ...img,
            position: index,
            isFeatured: index === 0
          };
        }),
        
        // Pricing with required price field and sale dates
        pricing: {
          regularPrice: regularPrice,
          salePrice: salePrice,
          price: effectivePrice, // This is required by backend
          currency: formData.pricing?.currency || 'USD',
          onSale: salePrice && salePrice < regularPrice,
          saleStartDate: formData.pricing?.saleStartDate || null,
          saleEndDate: formData.pricing?.saleEndDate || null,
          taxStatus: formData.pricing?.taxStatus || 'taxable',
          taxClass: formData.pricing?.taxClass || 'standard'
        },
        
        // Inventory
        inventory: {
          manageStock: formData.inventory?.manageStock !== false,
          stock: parseInt(formData.inventory?.stock) || 0,
          stockStatus: formData.inventory?.endlessStock ? 'in_stock' : 
            ((parseInt(formData.inventory?.stock) || 0) > 0 ? 'in_stock' : 'out_of_stock'),
          endlessStock: formData.inventory?.endlessStock || false,
          lowStockThreshold: parseInt(formData.inventory?.lowStockThreshold) || 5,
          allowBackorders: 'no',
          soldIndividually: false
        },
        
        // Map to legacy fields for backward compatibility
        price: effectivePrice,
        oldPrice: regularPrice,
        countInStock: parseInt(formData.inventory?.stock) || 0,
        
        // Generate slug if not provided
        seo: {
          ...formData.seo,
          slug: formData.seo?.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        },
        
        // Set featured image
        featuredImage: formData.images[0]?.url || (typeof formData.images[0] === 'string' ? formData.images[0] : '')
      };

      console.log('Submitting product payload:', payload);

      if (isEditing) {
        await vendorApi.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await vendorApi.createProduct(payload);
        toast.success('Product created successfully! Pending admin approval.');
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

  const SectionHeader = ({ title, icon: Icon, section, badge }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#efb291]" />
        <span className="font-semibold text-gray-800">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-[#efb291] text-white text-xs rounded-full">
            {badge}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
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
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>

      {/* Product Type Selector */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setProductType('simple')}
          className={`p-4 rounded-xl border-2 transition-all ${
            productType === 'simple'
              ? 'border-[#efb291] bg-[#efb291]/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Package className={`w-8 h-8 mx-auto mb-2 ${productType === 'simple' ? 'text-[#efb291]' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-800">Simple Product</h3>
          <p className="text-sm text-gray-500">Single product with no variations</p>
        </button>
        <button
          type="button"
          onClick={() => setProductType('variable')}
          className={`p-4 rounded-xl border-2 transition-all ${
            productType === 'variable'
              ? 'border-[#efb291] bg-[#efb291]/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Tag className={`w-8 h-8 mx-auto mb-2 ${productType === 'variable' ? 'text-[#efb291]' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-800">Variable Product</h3>
          <p className="text-sm text-gray-500">Product with variations (size, color, etc.)</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Basic Information" icon={Package} section="basic" />
          {expandedSections.basic && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
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
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Brief product summary (max 500 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription?.length || 0}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="e.g., ZH-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="e.g., 123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              {/* Primary Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              {subCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category
                  </label>
                  <select
                    value={formData.subCatId}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  >
                    <option value="">Select Sub Category (Optional)</option>
                    {subCategories.map((subCat) => (
                      <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Third Level Category */}
              {thirdLevelCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Third Level Category
                  </label>
                  <select
                    value={formData.thirdsubCatId}
                    onChange={(e) => handleThirdLevelCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  >
                    <option value="">Select Third Level (Optional)</option>
                    {thirdLevelCategories.map((thirdCat) => (
                      <option key={thirdCat._id} value={thirdCat._id}>{thirdCat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Additional Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Categories (Optional)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat._id)}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="w-4 h-4 text-[#efb291] rounded focus:ring-[#efb291]"
                      />
                      <span className="text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
                {formData.categories.length > 0 && (
                  <p className="text-sm text-[#efb291] mt-2">
                    Selected: {formData.categories.length} categor{formData.categories.length === 1 ? 'y' : 'ies'}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas (e.g., summer, cotton, casual)"
                  defaultValue={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#efb291]/20 text-[#0b2735] rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="published">Published</option>
                </select>
              </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#efb291] rounded focus:ring-[#efb291]"
                    />
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Product Images" icon={Image} section="images" badge={imagePreview.length > 0 ? imagePreview.length : null} />
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreview.map((img, index) => {
                  const imgUrl = typeof img === 'string' ? img : (img?.url || img);
                  return (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={imgUrl}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96?text=Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-[#efb291] text-white text-xs text-center py-0.5 rounded-b-lg">
                          Featured
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <label className="flex flex-col items-center justify-center cursor-pointer py-4">
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
        </div>

        {/* Pricing - Simple Product Only */}
        {productType === 'simple' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader title="Pricing" icon={DollarSign} section="pricing" />
            {expandedSections.pricing && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Regular Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="pricing.regularPrice"
                        value={formData.pricing?.regularPrice || ''}
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
                      Sale Price (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="pricing.salePrice"
                        value={formData.pricing?.salePrice || ''}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    {formData.pricing?.salePrice && formData.pricing?.regularPrice > formData.pricing?.salePrice && (
                      <p className="text-green-600 text-sm mt-1">
                        Discount: {Math.round(((formData.pricing.regularPrice - formData.pricing.salePrice) / formData.pricing.regularPrice) * 100)}%
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      name="pricing.currency"
                      value={formData.pricing?.currency || 'USD'}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Sale Dates - only show if sale price is set */}
                {formData.pricing?.salePrice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Start Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        name="pricing.saleStartDate"
                        value={formData.pricing?.saleStartDate ? new Date(formData.pricing.saleStartDate).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for immediate sale</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        name="pricing.saleEndDate"
                        value={formData.pricing?.saleEndDate ? new Date(formData.pricing.saleEndDate).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inventory - Simple Product Only */}
        {productType === 'simple' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader title="Inventory" icon={Box} section="inventory" />
            {expandedSections.inventory && (
              <div className="p-6 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inventory?.manageStock !== false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      inventory: { ...prev.inventory, manageStock: e.target.checked }
                    }))}
                    className="w-5 h-5 text-[#efb291] rounded focus:ring-[#efb291]"
                  />
                  <span className="text-gray-700 font-medium">Manage Stock</span>
                </label>

                {formData.inventory?.manageStock !== false && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inventory?.endlessStock || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          inventory: { 
                            ...prev.inventory, 
                            endlessStock: e.target.checked,
                            stockStatus: e.target.checked ? 'in_stock' : prev.inventory?.stockStatus
                          }
                        }))}
                        className="w-5 h-5 text-[#efb291] rounded focus:ring-[#efb291]"
                      />
                      <span className="text-gray-700 font-medium">Endless Stock (Unlimited - Always Available)</span>
                    </label>

                    {!formData.inventory?.endlessStock && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            name="inventory.stock"
                            value={formData.inventory?.stock || ''}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                          <select
                            name="inventory.stockStatus"
                            value={formData.inventory?.stockStatus || 'in_stock'}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                          >
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="on_backorder">On Backorder</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                          <input
                            type="number"
                            name="inventory.lowStockThreshold"
                            value={formData.inventory?.lowStockThreshold || 5}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                            placeholder="5"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shipping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Shipping" icon={Box} section="shipping" />
          {expandedSections.shipping && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="shipping.weight"
                      value={formData.shipping?.weight || ''}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                      placeholder="0.00"
                    />
                    <select
                      name="shipping.weightUnit"
                      value={formData.shipping?.weightUnit || 'kg'}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="shipping.freeShipping"
                      checked={formData.shipping?.freeShipping || false}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#efb291] rounded focus:ring-[#efb291]"
                    />
                    <span className="text-gray-700">Free Shipping</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (L × W × H)</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    name="shipping.dimensions.length"
                    value={formData.shipping?.dimensions?.length || ''}
                    onChange={handleChange}
                    placeholder="Length"
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="shipping.dimensions.width"
                    value={formData.shipping?.dimensions?.width || ''}
                    onChange={handleChange}
                    placeholder="Width"
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="shipping.dimensions.height"
                    value={formData.shipping?.dimensions?.height || ''}
                    onChange={handleChange}
                    placeholder="Height"
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  />
                  <select
                    name="shipping.dimensions.unit"
                    value={formData.shipping?.dimensions?.unit || 'cm'}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                    <option value="m">m</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attributes - Variable Product Only */}
        {productType === 'variable' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader 
              title="Product Attributes" 
              icon={Tag} 
              section="attributes" 
              badge={formData.attributes?.length > 0 ? formData.attributes.length : null}
            />
            {expandedSections.attributes && (
              <div className="p-6 space-y-4">
                {/* Existing Attributes */}
                {formData.attributes && formData.attributes.length > 0 && (
                  <div className="space-y-3">
                    {formData.attributes.map((attribute, attrIndex) => (
                      <div key={attrIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#0b2735]">{attribute.name}</h4>
                          <button
                            type="button"
                            onClick={() => removeAttribute(attrIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attribute.values.map((value, valIndex) => (
                            <span
                              key={valIndex}
                              className="px-3 py-1 bg-[#efb291]/20 text-[#0b2735] rounded-full text-sm"
                            >
                              {value.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Attribute */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Add New Attribute</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Attribute name (e.g., Color, Size)"
                      value={newAttribute.name}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                    />
                    
                    {newAttribute.values.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newAttribute.values.map((val, index) => (
                          <span key={index} className="px-3 py-1 bg-[#efb291]/20 text-[#0b2735] rounded-full text-sm flex items-center gap-1">
                            {val}
                            <button
                              type="button"
                              onClick={() => setNewAttribute(prev => ({
                                ...prev,
                                values: prev.values.filter((_, i) => i !== index)
                              }))}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add value (e.g., Red)"
                        value={newAttributeValue}
                        onChange={(e) => setNewAttributeValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToNewAttribute())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addValueToNewAttribute}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={addAttribute}
                      disabled={!newAttribute.name.trim() || newAttribute.values.length === 0}
                      className="w-full px-4 py-2 bg-[#efb291] text-white rounded-lg hover:bg-[#e0a080] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      Add Attribute
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Variations - Variable Product Only */}
        {productType === 'variable' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader 
              title="Product Variations" 
              icon={Settings} 
              section="variations"
              badge={formData.variations?.length > 0 ? formData.variations.length : null}
            />
            {expandedSections.variations && (
              <div className="p-6 space-y-4">
                {/* Generate Variations Button */}
                {formData.attributes && formData.attributes.length > 0 && (
                  <button
                    type="button"
                    onClick={generateVariations}
                    className="w-full px-4 py-3 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Generate All Variations from Attributes
                  </button>
                )}

                {/* Existing Variations */}
                {formData.variations && formData.variations.length > 0 && (
                  <div className="space-y-3">
                    {formData.variations.map((variation, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-[#0b2735]">Variation {index + 1}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {variation.attributes.map((attr, attrIdx) => (
                                <span key={attrIdx} className="px-2 py-0.5 bg-[#efb291]/20 text-[#0b2735] rounded text-xs">
                                  {attr.name}: {attr.value}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editVariation(index)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVariation(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="ml-1 text-gray-800">
                              ${variation.salePrice || variation.regularPrice}
                              {variation.salePrice && (
                                <span className="line-through text-gray-400 ml-1">${variation.regularPrice}</span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <span className="ml-1 text-gray-800">
                              {variation.endlessStock ? 'Unlimited' : variation.stock}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">SKU:</span>
                            <span className="ml-1 text-gray-800">{variation.sku || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-1 ${variation.stockStatus === 'in_stock' ? 'text-green-600' : 'text-red-600'}`}>
                              {variation.stockStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit Variation Form */}
                {formData.attributes && formData.attributes.length > 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      {editingVariationIndex !== null ? 'Edit Variation' : 'Add New Variation'}
                    </h4>
                    
                    {/* Attribute Selection */}
                    <div className="space-y-3 mb-4">
                      {formData.attributes.map((attribute, attrIndex) => (
                        <div key={attrIndex}>
                          <label className="block text-sm text-gray-600 mb-1">{attribute.name}</label>
                          <select
                            value={variationData.attributes[attribute.name] || ''}
                            onChange={(e) => setVariationData(prev => ({
                              ...prev,
                              attributes: { ...prev.attributes, [attribute.name]: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                          >
                            <option value="">Select {attribute.name}</option>
                            {attribute.values.map((value, valIndex) => (
                              <option key={valIndex} value={value.label}>{value.label}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Variation Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Regular Price</label>
                        <input
                          type="number"
                          value={variationData.regularPrice}
                          onChange={(e) => setVariationData(prev => ({ ...prev, regularPrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Sale Price</label>
                        <input
                          type="number"
                          value={variationData.salePrice}
                          onChange={(e) => setVariationData(prev => ({ ...prev, salePrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={variationData.endlessStock}
                            onChange={(e) => setVariationData(prev => ({ ...prev, endlessStock: e.target.checked }))}
                            className="w-4 h-4 text-[#efb291] rounded"
                          />
                          <span className="text-sm text-gray-600">Endless Stock</span>
                        </label>
                        {!variationData.endlessStock && (
                          <input
                            type="number"
                            value={variationData.stock}
                            onChange={(e) => setVariationData(prev => ({ ...prev, stock: e.target.value }))}
                            placeholder="Stock"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">SKU</label>
                        <input
                          type="text"
                          value={variationData.sku}
                          onChange={(e) => setVariationData(prev => ({ ...prev, sku: e.target.value }))}
                          placeholder="Variation SKU"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingVariationIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVariationIndex(null);
                            setVariationData({
                              attributes: {},
                              regularPrice: '',
                              salePrice: '',
                              stock: 0,
                              endlessStock: false,
                              sku: '',
                              image: ''
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addVariation}
                        disabled={Object.keys(variationData.attributes).length === 0}
                        className="flex-1 px-4 py-2 bg-[#efb291] text-white rounded-lg hover:bg-[#e0a080] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        {editingVariationIndex !== null ? 'Update Variation' : 'Add Variation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="SEO Settings" icon={Settings} section="seo" />
          {expandedSections.seo && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  name="seo.metaTitle"
                  value={formData.seo?.metaTitle || ''}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Product SEO title"
                />
                <p className="text-xs text-gray-500 mt-1">{(formData.seo?.metaTitle || '').length}/60</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea
                  name="seo.metaDescription"
                  value={formData.seo?.metaDescription || ''}
                  onChange={handleChange}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Product SEO description"
                />
                <p className="text-xs text-gray-500 mt-1">{(formData.seo?.metaDescription || '').length}/160</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  name="seo.slug"
                  value={formData.seo?.slug || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="product-url-slug (auto-generated from name if empty)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormEnhanced;

