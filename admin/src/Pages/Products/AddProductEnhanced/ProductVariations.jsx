import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const ProductVariations = ({ formData, setFormData, errors }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [variationData, setVariationData] = useState({
    attributes: {},
    regularPrice: '',
    salePrice: '',
    stock: 0,
    endlessStock: false,
    sku: '',
    image: '', // Legacy - for backward compatibility
    images: [], // Array of image URLs
    weight: '',
    weightUnit: 'kg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    }
  });

  // Generate variations from attributes
  const generateVariations = () => {
    if (!formData.attributes || formData.attributes.length === 0) {
      alert('Please add attributes first');
      return;
    }

    // Generate all combinations
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

    // Create variation objects
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

    setFormData(prev => ({
      ...prev,
      variations
    }));
  };

  const addVariation = () => {
    if (!variationData.attributes || Object.keys(variationData.attributes).length === 0) {
      alert('Please select at least one attribute value');
      return;
    }

    // Handle images: use images array if available, otherwise fallback to single image
    const variationImages = variationData.images && variationData.images.length > 0 
      ? variationData.images 
      : (variationData.image ? [variationData.image] : []);
    
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
      image: variationImages[0] || '', // Legacy field - first image for backward compatibility
      images: variationImages, // New images array
      weight: variationData.weight ? parseFloat(variationData.weight) : null,
      weightUnit: variationData.weightUnit || 'kg',
      dimensions: {
        length: variationData.dimensions?.length ? parseFloat(variationData.dimensions.length) : null,
        width: variationData.dimensions?.width ? parseFloat(variationData.dimensions.width) : null,
        height: variationData.dimensions?.height ? parseFloat(variationData.dimensions.height) : null,
        unit: variationData.dimensions?.unit || 'cm'
      },
      isActive: true,
      isDefault: false
    };

    setFormData(prev => ({
      ...prev,
      variations: [...(prev.variations || []), variation]
    }));

    setVariationData({
      attributes: {},
      regularPrice: '',
      salePrice: '',
      stock: 0,
      endlessStock: false,
      sku: '',
      image: '',
      images: [],
      weight: '',
      weightUnit: 'kg',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    });
  };

  const updateVariation = (index) => {
    const updated = [...formData.variations];
    // Handle images: use images array if available, otherwise fallback to single image
    const variationImages = variationData.images && variationData.images.length > 0 
      ? variationData.images 
      : (variationData.image ? [variationData.image] : []);
    
    updated[index] = {
      ...updated[index],
      regularPrice: parseFloat(variationData.regularPrice) || updated[index].regularPrice,
      salePrice: variationData.salePrice ? parseFloat(variationData.salePrice) : null,
      price: variationData.salePrice ? parseFloat(variationData.salePrice) : parseFloat(variationData.regularPrice) || updated[index].price,
      stock: variationData.endlessStock ? 999999 : (parseInt(variationData.stock) || updated[index].stock),
      stockStatus: variationData.endlessStock ? 'in_stock' : (parseInt(variationData.stock) > 0 ? 'in_stock' : 'out_of_stock'),
      endlessStock: variationData.endlessStock || false,
      sku: variationData.sku || updated[index].sku,
      image: variationImages[0] || updated[index].image || '', // Legacy field
      images: variationImages.length > 0 ? variationImages : (updated[index].images || []), // New images array
      weight: variationData.weight ? parseFloat(variationData.weight) : (updated[index].weight || null),
      weightUnit: variationData.weightUnit || updated[index].weightUnit || 'kg',
      dimensions: {
        length: variationData.dimensions?.length ? parseFloat(variationData.dimensions.length) : (updated[index].dimensions?.length || null),
        width: variationData.dimensions?.width ? parseFloat(variationData.dimensions.width) : (updated[index].dimensions?.width || null),
        height: variationData.dimensions?.height ? parseFloat(variationData.dimensions.height) : (updated[index].dimensions?.height || null),
        unit: variationData.dimensions?.unit || updated[index].dimensions?.unit || 'cm'
      }
    };

    setFormData(prev => ({
      ...prev,
      variations: updated
    }));

    setEditingIndex(null);
    setVariationData({
      attributes: {},
      regularPrice: '',
      salePrice: '',
      stock: 0,
      endlessStock: false,
      sku: '',
      image: '',
      images: [],
      weight: '',
      weightUnit: 'kg',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    });
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const startEdit = (index) => {
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
    setEditingIndex(index);
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#e5e2db' }}>
          Product Variations
        </h2>
        <button
          type="button"
          onClick={generateVariations}
          className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: '#efb291', color: '#0b2735' }}
        >
          <FaPlus className="inline mr-2" />
          Generate All Variations
        </button>
      </div>

      {errors.variations && (
        <p className="text-red-500 text-sm mb-4">{errors.variations}</p>
      )}

      {/* Variations List */}
      {formData.variations && formData.variations.length > 0 && (
        <div className="space-y-4 mb-6">
          {formData.variations.map((variation, index) => (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold" style={{ color: '#efb291' }}>
                    Variation {index + 1}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variation.attributes.map((attr, attrIndex) => (
                      <span
                        key={attrIndex}
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                      >
                        {attr.name}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="p-2 rounded-lg hover:bg-blue-500 transition-colors"
                    style={{ color: '#3b82f6' }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="p-2 rounded-lg hover:bg-red-500 transition-colors"
                    style={{ color: '#ef4444' }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span style={{ color: '#e5e2db', opacity: 0.7 }}>Price: </span>
                  <span style={{ color: '#e5e2db' }}>
                    ${variation.salePrice || variation.regularPrice}
                    {variation.salePrice && (
                      <span className="line-through ml-2" style={{ opacity: 0.5 }}>
                        ${variation.regularPrice}
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#e5e2db', opacity: 0.7 }}>Stock: </span>
                  <span style={{ color: '#e5e2db' }}>
                    {variation.endlessStock ? 'Unlimited (Available)' : variation.stock}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#e5e2db', opacity: 0.7 }}>SKU: </span>
                  <span style={{ color: '#e5e2db' }}>{variation.sku || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: '#e5e2db', opacity: 0.7 }}>Status: </span>
                  <span style={{ color: variation.stockStatus === 'in_stock' ? '#10b981' : '#ef4444' }}>
                    {variation.stockStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Variation Form */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#0b2735', border: '2px dashed rgba(239, 178, 145, 0.5)' }}
      >
        <h3 className="font-bold mb-4" style={{ color: '#e5e2db' }}>
          {editingIndex !== null ? 'Edit Variation' : 'Add New Variation'}
        </h3>

        {/* Attribute Selection */}
        {formData.attributes && formData.attributes.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
              Select Attribute Values
            </label>
            <div className="space-y-2">
              {formData.attributes.map((attribute, attrIndex) => (
                <div key={attrIndex}>
                  <label className="block text-sm mb-1" style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {attribute.name}
                  </label>
                  <select
                    value={variationData.attributes[attribute.name] || ''}
                    onChange={(e) => {
                      setVariationData(prev => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          [attribute.name]: e.target.value
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  >
                    <option value="">Select {attribute.name}</option>
                    {attribute.values.map((value, valIndex) => (
                      <option key={valIndex} value={value.label}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Regular Price
            </label>
            <input
              type="number"
              value={variationData.regularPrice}
              onChange={(e) => setVariationData(prev => ({ ...prev, regularPrice: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Sale Price (Optional)
            </label>
            <input
              type="number"
              value={variationData.salePrice}
              onChange={(e) => setVariationData(prev => ({ ...prev, salePrice: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
          <div>
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="variationEndlessStock"
                  checked={variationData.endlessStock || false}
                  onChange={(e) => setVariationData(prev => ({ ...prev, endlessStock: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#efb291' }}
                />
                <label htmlFor="variationEndlessStock" className="font-semibold text-sm" style={{ color: '#e5e2db' }}>
                  Endless Stock (Unlimited)
                </label>
              </div>
            </div>
            {!variationData.endlessStock && (
              <>
                <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={variationData.stock}
                  onChange={(e) => setVariationData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                />
              </>
            )}
          </div>
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              SKU
            </label>
            <input
              type="text"
              value={variationData.sku}
              onChange={(e) => setVariationData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="Variation SKU"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
        </div>

        {/* Variation Images - Multiple Images Support */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
            Variation Images (Multiple images for this variation)
          </label>
          <div className="space-y-2">
            {variationData.images && variationData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {variationData.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img} 
                      alt={`Variation ${idx + 1}`}
                      className="w-full h-20 object-cover rounded border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = variationData.images.filter((_, i) => i !== idx);
                        setVariationData(prev => ({ ...prev, images: newImages, image: newImages[0] || '' }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Enter image URL and press Enter"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const url = e.target.value.trim();
                  if (url) {
                    setVariationData(prev => ({
                      ...prev,
                      images: [...(prev.images || []), url],
                      image: prev.images && prev.images.length > 0 ? prev.image : url // Set first image as legacy field
                    }));
                    e.target.value = '';
                  }
                }
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
              Press Enter after each URL to add multiple images
            </p>
          </div>
        </div>

        {/* Dimensions and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Weight */}
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={variationData.weight}
                onChange={(e) => setVariationData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="flex-1 px-4 py-2 rounded-lg outline-none"
                style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              />
              <select
                value={variationData.weightUnit}
                onChange={(e) => setVariationData(prev => ({ ...prev, weightUnit: e.target.value }))}
                className="px-4 py-2 rounded-lg outline-none"
                style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>

          {/* Dimensions Unit */}
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Dimensions Unit
            </label>
            <select
              value={variationData.dimensions?.unit || 'cm'}
              onChange={(e) => setVariationData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, unit: e.target.value }
              }))}
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Length
            </label>
            <input
              type="number"
              value={variationData.dimensions?.length || ''}
              onChange={(e) => setVariationData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, length: e.target.value }
              }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Width
            </label>
            <input
              type="number"
              value={variationData.dimensions?.width || ''}
              onChange={(e) => setVariationData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, width: e.target.value }
              }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-sm" style={{ color: '#e5e2db' }}>
              Height
            </label>
            <input
              type="number"
              value={variationData.dimensions?.height || ''}
              onChange={(e) => setVariationData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, height: e.target.value }
              }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
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
              className="px-4 py-2 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#6b7280', color: '#fff' }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={editingIndex !== null ? () => updateVariation(editingIndex) : addVariation}
            disabled={Object.keys(variationData.attributes).length === 0}
            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#efb291', color: '#0b2735' }}
          >
            <FaPlus className="inline mr-2" />
            {editingIndex !== null ? 'Update Variation' : 'Add Variation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVariations;

