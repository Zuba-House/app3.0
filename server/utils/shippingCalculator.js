/**
 * Advanced Shipping Calculator
 * Calculates total package dimensions and weight from cart items
 */

import RegionShippingCalculator from './regionShippingCalculator.js';

export default class ShippingCalculator {
  
  /**
   * Calculate total package from cart items
   * @param {Array} cartItems - Array of cart items with product info
   * @returns {Object} Package details
   */
  static calculatePackage(cartItems) {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return this.getDefaultPackage();
    }

    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    cartItems.forEach(item => {
      if (!item) return; // Skip null/undefined items
      
      const product = item.productId || item.product || item;
      const quantity = Math.max(1, parseInt(item.quantity) || 1); // Ensure quantity is at least 1
      
      if (product && product.shipping) {
        // Weight: sum of all items (convert to kg if needed)
        const itemWeight = product.shipping.weight || 0.5;
        const weightUnit = product.shipping.weightUnit || 'kg';
        
        // Convert to kg (ensure weight is positive)
        let weightInKg = Math.max(0, parseFloat(itemWeight) || 0.5);
        if (weightUnit === 'g') weightInKg = weightInKg / 1000;
        else if (weightUnit === 'lb') weightInKg = weightInKg * 0.453592;
        else if (weightUnit === 'oz') weightInKg = weightInKg * 0.0283495;
        
        // Cap weight at reasonable maximum (100kg per item)
        weightInKg = Math.min(weightInKg, 100);
        totalWeight += weightInKg * quantity;
        
        // Dimensions: max length/width, sum height
        const dims = product.shipping.dimensions || {};
        const dimUnit = dims.unit || 'cm';
        
        // Convert to cm (ensure dimensions are positive)
        let length = Math.max(1, parseFloat(dims.length) || 20);
        let width = Math.max(1, parseFloat(dims.width) || 15);
        let height = Math.max(1, parseFloat(dims.height) || 10);
        
        if (dimUnit === 'in') {
          length = length * 2.54;
          width = width * 2.54;
          height = height * 2.54;
        } else if (dimUnit === 'm') {
          length = length * 100;
          width = width * 100;
          height = height * 100;
        }
        
        // Cap dimensions at reasonable maximum (200cm per dimension)
        length = Math.min(length, 200);
        width = Math.min(width, 200);
        height = Math.min(height, 200);
        
        maxLength = Math.max(maxLength, length);
        maxWidth = Math.max(maxWidth, width);
        totalHeight += height * quantity;
      } else {
        // Default values if no shipping info
        totalWeight += 0.5 * quantity;
        maxLength = Math.max(maxLength, 20);
        maxWidth = Math.max(maxWidth, 15);
        totalHeight += 10 * quantity;
      }
    });

    // Ensure minimum values and cap maximums
    return {
      weight: Math.min(Math.max(totalWeight, 0.5), 100), // Max 100kg
      length: Math.min(Math.max(maxLength, 20), 200), // Max 200cm
      width: Math.min(Math.max(maxWidth, 15), 200), // Max 200cm
      height: Math.min(Math.max(totalHeight, 10), 200) // Max 200cm
    };
  }

  /**
   * Default package for empty cart
   */
  static getDefaultPackage() {
    return {
      weight: 0.5,
      length: 20,
      width: 15,
      height: 10
    };
  }

  /**
   * Calculate fallback shipping cost with region-based pricing
   * @param {Number} quantity - Number of items
   * @param {Number} weight - Total weight
   * @param {String} countryCode - Country code (e.g., 'CA', 'US', 'GB')
   * @param {Object} coordinates - { lat, lng } for distance calculation
   * @returns {Object} { cost, deliveryEstimate, region }
   */
  static calculateFallbackShipping(quantity, weight, countryCode = 'CA', coordinates = null) {
    try {
      // Calculate distance if coordinates provided
      let distance = null;
      if (coordinates && coordinates.lat && coordinates.lng) {
        distance = RegionShippingCalculator.getDistanceFromWarehouse(coordinates);
      }

      // Calculate region-based shipping
      const cost = RegionShippingCalculator.calculateRegionShipping(
        countryCode,
        quantity,
        weight,
        distance
      );

      // Get delivery estimate
      const deliveryEstimate = RegionShippingCalculator.getDeliveryEstimate(countryCode);

      return {
        cost: Math.round(cost * 100) / 100,
        deliveryEstimate: deliveryEstimate.estimate,
        minDays: deliveryEstimate.minDays,
        maxDays: deliveryEstimate.maxDays,
        region: deliveryEstimate.regionName
      };
    } catch (error) {
      // Fallback if region calculator fails
      console.error('Region calculator error:', error);
      const baseRate = parseFloat(process.env.FALLBACK_BASE_RATE || 13);
      const extraItemRate = parseFloat(process.env.FALLBACK_EXTRA_ITEM || 3);
      let cost = baseRate + (quantity > 1 ? (quantity - 1) * extraItemRate : 0);
      if (weight > 5) cost += (weight - 5) * 2;
      return {
        cost: Math.round(cost * 100) / 100,
        deliveryEstimate: '5-7 business days',
        minDays: 5,
        maxDays: 7,
        region: 'International'
      };
    }
  }

  /**
   * Format address for Stallion API (worldwide support)
   */
  static formatAddress(address) {
    if (!address || typeof address !== 'object') {
      throw new Error('Address must be a valid object');
    }

    // Get country code (support multiple formats)
    const countryCode = (address.countryCode || 
                        address.country || 
                        address.address?.countryCode ||
                        "CA").trim().substring(0, 2).toUpperCase();

    // Clean and format postal code (handle different formats worldwide)
    let postalCode = (address.postal_code || 
                     address.postalCode || 
                     address.address?.postalCode ||
                     address.pincode ||
                     "").replace(/\s/g, "").toUpperCase();
    
    // For non-Canadian addresses, postal code might be longer
    const maxPostalLength = countryCode === 'CA' ? 7 : 20;
    postalCode = postalCode.substring(0, maxPostalLength);
    
    return {
      name: (address.name || 
             address.fullName || 
             address.contactInfo?.firstName + ' ' + address.contactInfo?.lastName ||
             '').trim().substring(0, 100),
      company: (address.company || "").trim().substring(0, 100),
      address1: (address.address1 || 
                 address.street || 
                 address.addressLine1 ||
                 address.address?.addressLine1 ||
                 '').trim().substring(0, 200),
      address2: (address.address2 || 
                 address.apartment || 
                 address.addressLine2 ||
                 address.address?.addressLine2 ||
                 "").trim().substring(0, 200),
      city: (address.city || 
             address.address?.city ||
             '').trim().substring(0, 100),
      province: (address.province || 
                 address.state || 
                 address.provinceCode ||
                 address.address?.provinceCode ||
                 address.address?.province ||
                 '').trim().substring(0, 50), // Increased for international states
      postal_code: postalCode,
      country: countryCode,
      phone: (address.phone || 
              address.mobile || 
              address.contactInfo?.phone ||
              '').trim().substring(0, 20),
      // Include coordinates if available (for distance calculation)
      coordinates: address.coordinates || 
                   address.googlePlaces?.coordinates ||
                   null
    };
  }
}

