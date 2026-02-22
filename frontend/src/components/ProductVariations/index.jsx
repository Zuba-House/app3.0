import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/currency';
import './ProductVariations.css';

const ProductVariations = ({ product, onVariationSelect, selectedVariation }) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableVariations, setAvailableVariations] = useState([]);
  const [currentVariation, setCurrentVariation] = useState(null);

  // Auto-select variation on mount (only runs once when product loads)
  useEffect(() => {
    // Only run this effect for auto-selection on mount
    // Regular selection changes are now handled directly in handleAttributeChange
    
    if (!product?.variations || product.variations.length === 0) {
      return;
    }
    
    // Don't auto-select if user has already made selections
    if (Object.keys(selectedAttributes).length > 0) {
      return;
    }
    
    // Auto-select if only one variation exists
    if (product.variations.length === 1) {
      const singleVariation = product.variations[0];
      const autoSelection = {};
      
      if (Array.isArray(singleVariation.attributes)) {
        singleVariation.attributes.forEach(attr => {
          if (attr.name && attr.value) {
            autoSelection[attr.name] = attr.value;
          }
        });
      }
      
      if (Object.keys(autoSelection).length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Auto-selecting single variation:', autoSelection);
        }
        
        setSelectedAttributes(autoSelection);
        setCurrentVariation(singleVariation);
        
        if (onVariationSelect) {
          onVariationSelect(singleVariation);
        }
      }
    } else if (product.variations.length > 1) {
      // Find default variation or use first one
      const defaultVariation = product.variations.find(v => v.isDefault) || product.variations[0];
      
      if (defaultVariation && Array.isArray(defaultVariation.attributes)) {
        const initialAttributes = {};
        defaultVariation.attributes.forEach(attr => {
          if (attr.name && attr.value) {
            initialAttributes[attr.name] = attr.value;
          }
        });
        
        if (Object.keys(initialAttributes).length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Auto-selecting default variation:', initialAttributes);
          }
          
          setSelectedAttributes(initialAttributes);
          setCurrentVariation(defaultVariation);
          
          if (onVariationSelect) {
            onVariationSelect(defaultVariation);
          }
        }
      }
    }
    
    // Only run once when product changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  // Find matching variation based on selected attributes
  const findMatchingVariation = useMemo(() => {
    return (selectedAttrs) => {
      if (!Array.isArray(product?.variations) || product.variations.length === 0) {
        return null;
      }
      
      const selectedEntries = Object.entries(selectedAttrs);
      if (selectedEntries.length === 0) {
        return null;
      }
      
      // Find variation where ALL selected attributes match
      return product.variations.find(variation => {
        if (!Array.isArray(variation?.attributes)) {
          return false;
        }
        
        return selectedEntries.every(([attrName, attrValue]) => {
          const varAttr = variation.attributes.find(
            a => a && a.name === attrName
          );
          
          if (!varAttr) return false;
          
          // Compare values (case-insensitive)
          const varValue = varAttr.value || '';
          return varValue.toLowerCase() === attrValue.toLowerCase();
        }) && variation.attributes.length === selectedEntries.length;
      });
    };
  }, [product]);

  // Check if a specific attribute value is available based on current selection
  const isValueAvailable = (attributeName, value) => {
    const otherSelectedAttrs = Object.entries(selectedAttributes).filter(
      ([name]) => name !== attributeName
    );
    
    if (otherSelectedAttrs.length === 0) {
      return true;
    }
    
    return product.variations.some(variation => {
      if (!Array.isArray(variation?.attributes)) return false;
      
      const hasValue = variation.attributes.some(
        attr => attr.name === attributeName && attr.value === value
      );
      
      if (!hasValue) return false;
      
      return otherSelectedAttrs.every(([otherName, otherValue]) => {
        return variation.attributes.some(
          attr => attr.name === otherName && attr.value === otherValue
        );
      });
    });
  };

  // Handle attribute selection
  const handleAttributeChange = (attributeName, value) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Attribute Change:', attributeName, '=', value);
    }
    
    // If clicking the same value, deselect it
    if (selectedAttributes[attributeName] === value) {
      const newSelection = { ...selectedAttributes };
      delete newSelection[attributeName];
      
      // Update state
      setSelectedAttributes(newSelection);
      setCurrentVariation(null);
      
      // Immediately notify parent (don't wait for useEffect)
      if (onVariationSelect) {
        onVariationSelect(null);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Deselected:', attributeName);
      }
      
      return;
    }
    
    // Create new selection
    const newSelection = {
      ...selectedAttributes,
      [attributeName]: value
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 New Selection:', newSelection);
    }
    
    // Update state
    setSelectedAttributes(newSelection);
    
    // Find matching variation IMMEDIATELY (don't wait for useEffect)
    const matchedVariation = findMatchingVariation(newSelection);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Matched Variation:', matchedVariation);
    }
    
    // Update selected variation
    setCurrentVariation(matchedVariation);
    
    // Notify parent component IMMEDIATELY
    if (onVariationSelect) {
      onVariationSelect(matchedVariation);
    }
  };

  // Get unique values for an attribute - ENHANCED with multiple data sources
  const getAttributeValues = useMemo(() => {
    return (attributeName) => {
      const values = new Set();
      
      // Method 1: From product.attributes (structured data - primary source)
      if (Array.isArray(product?.attributes)) {
        const attribute = product.attributes.find(
          attr => attr && attr.name === attributeName
        );
        
        if (attribute && Array.isArray(attribute.values)) {
          attribute.values.forEach(valueObj => {
            // Handle both {label, slug} and string formats
            const value = typeof valueObj === 'object' ? valueObj.label : valueObj;
            if (value) values.add(value);
          });
        }
      }
      
      // Method 2: From variations.attributes (fallback)
      if (values.size === 0 && Array.isArray(product?.variations)) {
        product.variations.forEach(variation => {
          if (Array.isArray(variation?.attributes)) {
            const attr = variation.attributes.find(
              a => a && a.name === attributeName
            );
            if (attr && attr.value) {
              values.add(attr.value);
            }
          }
        });
      }
      
      const valuesArray = Array.from(values);
      if (process.env.NODE_ENV === 'development') {
        console.log(`ProductVariations - Values for ${attributeName}:`, valuesArray);
      }
      return valuesArray;
    };
  }, [product]);

  // Get all attribute names - ENHANCED with proper fallbacks
  const getAttributeNames = useMemo(() => {
    const attributeNames = new Set();
    
    // Method 1: From product.attributes (primary source)
    if (Array.isArray(product?.attributes) && product.attributes.length > 0) {
      product.attributes.forEach(attr => {
        if (attr && attr.name && attr.visible !== false && attr.variation !== false) {
          attributeNames.add(attr.name);
        }
      });
    }
    
    // Method 2: From variations.attributes (fallback)
    if (attributeNames.size === 0 && Array.isArray(product?.variations)) {
      product.variations.forEach(variation => {
        if (Array.isArray(variation?.attributes)) {
          variation.attributes.forEach(attr => {
            if (attr && attr.name) {
              attributeNames.add(attr.name);
            }
          });
        }
      });
    }
    
    const namesArray = Array.from(attributeNames);
    if (process.env.NODE_ENV === 'development') {
      console.log('ProductVariations - Attribute names:', namesArray);
    }
    return namesArray;
  }, [product]);

  // Check if a variation is available (in stock)
  const isVariationAvailable = (variation) => {
    if (!variation) return false;
    if (variation.isActive === false) return false;
    // Endless stock is always available
    if (variation.endlessStock) return true;
    const stock = Number(variation.stock || 0);
    const stockStatus = variation.stockStatus || (stock > 0 ? 'in_stock' : 'out_of_stock');
    return stockStatus === 'in_stock' && stock > 0;
  };

  // Debug logging (only in development)
  useEffect(() => {
    if (product && process.env.NODE_ENV === 'development') {
      console.log('ProductVariations - Product data:', {
        productType: product.productType,
        hasVariations: !!product.variations,
        variationsCount: product.variations?.length || 0,
        hasAttributes: !!product.attributes,
        attributesCount: product.attributes?.length || 0,
        variations: product.variations,
        attributes: product.attributes
      });
    }
  }, [product]);

  // ============================================
  // RENDER CONDITIONS - FIXED (Less Strict)
  // ============================================
  
  // ✅ FIRST CHECK: Do we have variations at all?
  // This is the MOST IMPORTANT check - if no variations, nothing to show
  if (!Array.isArray(product?.variations) || product.variations.length === 0) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('ProductVariations: No variations array found', product);
    }
    return null;
  }

  // ✅ SECOND CHECK: Can we extract any attributes?
  // Try to extract from both sources before giving up
  const extractedAttributeNames = getAttributeNames;
  
  if (extractedAttributeNames.length === 0) {
    // Variations exist but we can't extract attributes
    // Show a helpful message instead of crashing
    if (process.env.NODE_ENV === 'development') {
      console.error('ProductVariations: Variations exist but no attributes found', {
        variations: product.variations,
        attributes: product.attributes
      });
    }
    
    return (
      <div className="variation-error" style={{
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '6px',
        color: '#856404',
        marginTop: '15px'
      }}>
        <p style={{ margin: 0 }}>
          ⚠️ This product has variations but the attribute data is not properly configured.
          Please contact support or try another product.
        </p>
      </div>
    );
  }

  // ✅ ALL CHECKS PASSED - Render the component!
  // We have variations AND we can extract attributes
  // ProductType doesn't matter - if data exists, we show it

  return (
    <div className="product-variations">
      <h3 className="variations-title">Select Options</h3>
      
      {extractedAttributeNames.map((attrName, index) => {
        const values = getAttributeValues(attrName);
        const selectedValue = selectedAttributes[attrName];
        
        if (values.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`ProductVariations - No values found for attribute: ${attrName}`);
          }
          return null;
        }

        return (
          <div key={index} className="mb-4">
            <label className="block mb-2 text-[14px] font-[600] text-gray-700">
              {attrName.charAt(0).toUpperCase() + attrName.slice(1)}:
              {selectedValue && (
                <span className="ml-2 text-primary font-[500]">{selectedValue}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value, valueIndex) => {
                const isSelected = selectedValue === value;
                const isAvailable = isValueAvailable(attrName, value);

                return (
                  <button
                    key={valueIndex}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAttributeChange(attrName, value);
                    }}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-md text-[13px] font-[500] transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-2 border-primary'
                        : isAvailable
                        ? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary hover:text-primary'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50'
                    }`}
                    style={{
                      minWidth: attrName.toLowerCase() === 'color' ? '60px' : 'auto',
                      height: attrName.toLowerCase() === 'color' ? '60px' : 'auto',
                      backgroundColor: attrName.toLowerCase() === 'color' && isSelected && isAvailable 
                        ? (value.toLowerCase() === 'red' ? '#ef4444' : 
                           value.toLowerCase() === 'blue' ? '#3b82f6' :
                           value.toLowerCase() === 'green' ? '#10b981' :
                           value.toLowerCase() === 'black' ? '#000000' :
                           value.toLowerCase() === 'white' ? '#ffffff' :
                           value.toLowerCase() === 'yellow' ? '#fbbf24' :
                           'transparent')
                        : undefined
                    }}
                  >
                    {attrName.toLowerCase() === 'color' ? (
                      <div 
                        className="w-full h-full rounded"
                        style={{
                          backgroundColor: value.toLowerCase() === 'red' ? '#ef4444' : 
                                         value.toLowerCase() === 'blue' ? '#3b82f6' :
                                         value.toLowerCase() === 'green' ? '#10b981' :
                                         value.toLowerCase() === 'black' ? '#000000' :
                                         value.toLowerCase() === 'white' ? '#ffffff' :
                                         value.toLowerCase() === 'yellow' ? '#fbbf24' :
                                         value.toLowerCase() === 'orange' ? '#f97316' :
                                         value.toLowerCase() === 'purple' ? '#a855f7' :
                                         value.toLowerCase() === 'pink' ? '#ec4899' :
                                         value.toLowerCase() === 'gray' ? '#6b7280' :
                                         value.toLowerCase() === 'grey' ? '#6b7280' :
                                         '#e5e7eb',
                          border: '2px solid',
                          borderColor: isSelected ? '#efb291' : '#d1d5db'
                        }}
                        title={value}
                      />
                    ) : (
                      value
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Clear selection button */}
      {Object.keys(selectedAttributes).length > 0 && (
        <button 
          type="button"
          className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedAttributes({});
            setCurrentVariation(null);
            if (onVariationSelect) {
              onVariationSelect(null);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          Clear Selection
        </button>
      )}

      {/* Display current variation details */}
      {currentVariation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-[600] text-gray-700">Selected Variation:</span>
            <span className="text-[14px] text-gray-600">
              {currentVariation.sku && `SKU: ${currentVariation.sku}`}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <div>
              <span className="text-[12px] text-gray-500">Price:</span>
              <div className="flex items-center gap-2">
                {(() => {
                  const regularPrice = currentVariation.regularPrice && currentVariation.regularPrice > 0 
                    ? currentVariation.regularPrice 
                    : (currentVariation.price && currentVariation.price > 0 ? currentVariation.price : null);
                  const salePrice = currentVariation.salePrice && currentVariation.salePrice > 0 
                    ? currentVariation.salePrice 
                    : null;
                  
                  if (!regularPrice && !salePrice) {
                    return <span className="price text-red-500 text-[16px] font-[600]">Price not available</span>;
                  }
                  
                  if (salePrice && regularPrice && salePrice < regularPrice) {
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="oldPrice line-through text-gray-500 text-[16px] font-[500]">
                            {formatCurrency(regularPrice)}
                          </span>
                          <span className="text-[12px] text-gray-400 font-[400] line-through">USD</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="price text-primary text-[18px] font-[600]">
                            {formatCurrency(salePrice)}
                          </span>
                          <span className="text-[13px] text-gray-600 font-[500]">USD</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex items-center gap-1">
                      <span className="price text-primary text-[18px] font-[600]">
                        {formatCurrency(regularPrice)}
                      </span>
                      <span className="text-[13px] text-gray-600 font-[500]">USD</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div>
              <span className="text-[12px] text-gray-500">Stock:</span>
              <span className={`text-[14px] font-[600] ml-2 ${
                isVariationAvailable(currentVariation) ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentVariation?.endlessStock 
                  ? 'Available (Unlimited)' 
                  : (isVariationAvailable(currentVariation) 
                    ? `${currentVariation.stock} available` 
                    : 'Out of stock')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warning if selection incomplete */}
      {Object.keys(selectedAttributes).length < extractedAttributeNames.length && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Please select all options to add to cart
        </div>
      )}
    </div>
  );
};

export default ProductVariations;
