import React from 'react';
import { FaDollarSign, FaCube, FaWarehouse } from 'react-icons/fa';

const SimpleProduct = ({ formData, setFormData, errors, handleChange }) => {
  return (
    <div className="space-y-6">
      {/* Pricing Section */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
          <FaDollarSign style={{ color: '#efb291' }} />
          Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
              Regular Price <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="pricing.regularPrice"
              value={formData.pricing?.regularPrice || formData.oldPrice || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFormData(prev => ({
                  ...prev,
                  pricing: {
                    regularPrice: value,
                    salePrice: prev.pricing?.salePrice || null,
                    price: prev.pricing?.salePrice || value,
                    currency: prev.pricing?.currency || 'USD',
                    onSale: prev.pricing?.salePrice && prev.pricing.salePrice < value,
                    taxStatus: prev.pricing?.taxStatus || 'taxable',
                    taxClass: prev.pricing?.taxClass || 'standard'
                  },
                  oldPrice: value, // Legacy support
                  price: prev.pricing?.salePrice || value
                }));
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              required
            />
            {errors.regularPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.regularPrice}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
              Sale Price (Optional)
            </label>
            <input
              type="number"
              name="pricing.salePrice"
              value={formData.pricing?.salePrice || (formData.price && formData.price < formData.oldPrice ? formData.price : '') || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || null;
                const regularPrice = formData.pricing?.regularPrice || formData.oldPrice || 0;
                setFormData(prev => ({
                  ...prev,
                  pricing: {
                    regularPrice: prev.pricing?.regularPrice || prev.oldPrice || 0,
                    salePrice: value && value < regularPrice ? value : null,
                    price: value && value < regularPrice ? value : regularPrice,
                    currency: prev.pricing?.currency || 'USD',
                    onSale: value && value < regularPrice,
                    taxStatus: prev.pricing?.taxStatus || 'taxable',
                    taxClass: prev.pricing?.taxClass || 'standard'
                  },
                  price: value && value < regularPrice ? value : regularPrice
                }));
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
            {(() => {
              const regularPrice = formData.pricing?.regularPrice || formData.oldPrice || 0;
              const salePrice = formData.pricing?.salePrice;
              if (salePrice && regularPrice > 0 && salePrice < regularPrice) {
                const discountPercent = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
                return (
                  <p className="text-green-500 text-sm mt-1">
                    Discount: {discountPercent}% (Save ${(regularPrice - salePrice).toFixed(2)})
                  </p>
                );
              }
              return null;
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
              Currency
            </label>
            <select
              name="pricing.currency"
              value={formData.pricing?.currency || formData.currency || 'USD'}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  pricing: {
                    regularPrice: prev.pricing?.regularPrice || prev.oldPrice || 0,
                    salePrice: prev.pricing?.salePrice || null,
                    price: prev.pricing?.price || prev.pricing?.regularPrice || prev.oldPrice || 0,
                    currency: e.target.value,
                    onSale: prev.pricing?.onSale || false,
                    taxStatus: prev.pricing?.taxStatus || 'taxable',
                    taxClass: prev.pricing?.taxClass || 'standard'
                  },
                  currency: e.target.value // Legacy support
                }));
              }}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
          <FaWarehouse style={{ color: '#efb291' }} />
          Inventory
        </h2>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="manageStock"
              checked={formData.inventory?.manageStock !== false}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  inventory: {
                    ...prev.inventory,
                    manageStock: e.target.checked
                  }
                }));
              }}
              className="w-5 h-5"
              style={{ accentColor: '#efb291' }}
            />
            <label htmlFor="manageStock" className="font-semibold" style={{ color: '#e5e2db' }}>
              Manage Stock
            </label>
          </div>
        </div>

        {formData.inventory?.manageStock !== false && (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="endlessStock"
                  checked={formData.inventory?.endlessStock || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      inventory: {
                        ...prev.inventory,
                        endlessStock: e.target.checked,
                        stockStatus: e.target.checked ? 'in_stock' : prev.inventory?.stockStatus || 'in_stock'
                      }
                    }));
                  }}
                  className="w-5 h-5"
                  style={{ accentColor: '#efb291' }}
                />
                <label htmlFor="endlessStock" className="font-semibold" style={{ color: '#e5e2db' }}>
                  Endless Stock (Unlimited - Always Available)
                </label>
              </div>
              <p className="text-sm mt-1 ml-8" style={{ color: '#e5e2db', opacity: 0.6 }}>
                When enabled, customers will see "Available" instead of stock count
              </p>
            </div>

            {!formData.inventory?.endlessStock && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="inventory.stock"
                    value={formData.inventory?.stock || formData.countInStock || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        inventory: {
                          stock: value,
                          stockStatus: value > 0 ? 'in_stock' : 'out_of_stock',
                          manageStock: prev.inventory?.manageStock !== false,
                          allowBackorders: prev.inventory?.allowBackorders || 'no',
                          lowStockThreshold: prev.inventory?.lowStockThreshold || 5,
                          soldIndividually: prev.inventory?.soldIndividually || false,
                          endlessStock: prev.inventory?.endlessStock || false
                        },
                        countInStock: value // Legacy support
                      }));
                    }}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                  )}
                </div>

            <div>
              <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
                Stock Status
              </label>
              <select
                name="inventory.stockStatus"
                value={formData.inventory?.stockStatus || 'in_stock'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    inventory: {
                      ...prev.inventory,
                      stockStatus: e.target.value
                    }
                  }));
                }}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="on_backorder">On Backorder</option>
              </select>
            </div>
          </div>
            )}
          </>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
            Low Stock Threshold
          </label>
          <input
            type="number"
            name="inventory.lowStockThreshold"
            value={formData.inventory?.lowStockThreshold || 5}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                inventory: {
                  ...prev.inventory,
                  lowStockThreshold: parseInt(e.target.value) || 5
                }
              }));
            }}
            placeholder="5"
            min="0"
            className="w-full px-4 py-3 rounded-lg outline-none"
            style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
          />
          <p className="text-sm mt-1" style={{ color: '#e5e2db', opacity: 0.6 }}>
            Get notified when stock falls below this number
          </p>
        </div>
      </div>

      {/* Shipping Section */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
          <FaCube style={{ color: '#efb291' }} />
          Shipping
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
              Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="shipping.weight"
                value={formData.shipping?.weight || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    shipping: {
                      ...prev.shipping,
                      weight: parseFloat(e.target.value) || null
                    }
                  }));
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="flex-1 px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              />
              <select
                name="shipping.weightUnit"
                value={formData.shipping?.weightUnit || 'kg'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    shipping: {
                      ...prev.shipping,
                      weightUnit: e.target.value
                    }
                  }));
                }}
                className="px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: '#e5e2db' }}>
            Dimensions (Length × Width × Height)
          </label>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Length"
              value={formData.shipping?.dimensions?.length || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  shipping: {
                    ...prev.shipping,
                    dimensions: {
                      ...prev.shipping?.dimensions,
                      length: parseFloat(e.target.value) || null
                    }
                  }
                }));
              }}
              min="0"
              step="0.01"
              className="px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
            <input
              type="number"
              placeholder="Width"
              value={formData.shipping?.dimensions?.width || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  shipping: {
                    ...prev.shipping,
                    dimensions: {
                      ...prev.shipping?.dimensions,
                      width: parseFloat(e.target.value) || null
                    }
                  }
                }));
              }}
              min="0"
              step="0.01"
              className="px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
            <input
              type="number"
              placeholder="Height"
              value={formData.shipping?.dimensions?.height || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  shipping: {
                    ...prev.shipping,
                    dimensions: {
                      ...prev.shipping?.dimensions,
                      height: parseFloat(e.target.value) || null
                    }
                  }
                }));
              }}
              min="0"
              step="0.01"
              className="px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
            <select
              value={formData.shipping?.dimensions?.unit || 'cm'}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  shipping: {
                    ...prev.shipping,
                    dimensions: {
                      ...prev.shipping?.dimensions,
                      unit: e.target.value
                    }
                  }
                }));
              }}
              className="px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: '#0b2735', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProduct;

