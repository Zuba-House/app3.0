import { WAREHOUSE } from '../config/stallion.js';
import * as shippingService from '../services/shipping.service.js';

/**
 * Get shipping rates
 * POST /api/shipping/rates
 */
export const getShippingRates = async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;

    // Validate
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Prepare items for shipping service
    const items = cartItems.map(item => ({
      id: item.productId || item._id,
      name: item.product?.name || item.name || 'Product',
      quantity: item.quantity || 1,
      weight: item.product?.shipping?.weight || item.product?.inventory?.weight || 0.5,
      product: item.product || {}
    }));

    // Prepare destination address
    const destination = {
      firstName: shippingAddress.firstName || '',
      lastName: shippingAddress.lastName || '',
      address: shippingAddress.addressLine1 || shippingAddress.address?.addressLine1 || '',
      addressLine1: shippingAddress.addressLine1 || shippingAddress.address?.addressLine1 || '',
      addressLine2: shippingAddress.addressLine2 || shippingAddress.address?.addressLine2 || '',
      city: shippingAddress.city || shippingAddress.address?.city || '',
      province: shippingAddress.province || shippingAddress.provinceCode || shippingAddress.address?.provinceCode || '',
      state: shippingAddress.province || shippingAddress.provinceCode || shippingAddress.address?.provinceCode || '',
      postalCode: shippingAddress.postal_code || shippingAddress.postalCode || shippingAddress.address?.postalCode || '',
      postal_code: shippingAddress.postal_code || shippingAddress.postalCode || shippingAddress.address?.postalCode || '',
      country: shippingAddress.country || shippingAddress.address?.country || '',
      countryCode: shippingAddress.countryCode || shippingAddress.address?.countryCode || 'CA',
      phone: shippingAddress.phone || ''
    };

    // Get shipping rates
    const rates = await shippingService.getShippingRates({ items, destination });

    return res.json({
      success: true,
      standard: rates.standard,
      express: rates.express
    });

  } catch (error) {
    console.error('Shipping Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping rates',
      error: error.message
    });
  }
};

/**
 * Create shipment and get label
 * NOTE: This will be updated to use EasyPost API
 * TODO: Implement EasyPost integration
 */
export const createShipment = async (req, res) => {
  try {
    return res.status(501).json({
      success: false,
      message: 'Shipment creation will be available soon with EasyPost integration'
    });
  } catch (error) {
    console.error('Create Shipment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment'
    });
  }
};

/**
 * Track shipment
 * NOTE: This will be updated to use EasyPost API
 * TODO: Implement EasyPost tracking integration
 */
export const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    // Validate tracking number
    if (!trackingNumber || trackingNumber.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    return res.status(501).json({
      success: false,
      message: 'Tracking will be available soon with EasyPost integration'
    });

  } catch (error) {
    console.error('Track Shipment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track shipment: ' + (error.message || 'Unknown error')
    });
  }
};

/**
 * Calculate shipping rates
 * POST /api/shipping/calculate
 * Alias for getShippingRates - returns same format
 */
export const calculateShippingRates = async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;

    // Validate
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Prepare items for shipping service
    const items = cartItems.map(item => ({
      id: item.productId || item._id,
      name: item.product?.name || item.name || 'Product',
      quantity: item.quantity || 1,
      weight: item.product?.shipping?.weight || item.product?.inventory?.weight || 0.5,
      product: item.product || {}
    }));

    // Prepare destination address
    const destination = {
      firstName: shippingAddress.firstName || '',
      lastName: shippingAddress.lastName || '',
      address: shippingAddress.addressLine1 || shippingAddress.address?.addressLine1 || '',
      addressLine1: shippingAddress.addressLine1 || shippingAddress.address?.addressLine1 || '',
      addressLine2: shippingAddress.addressLine2 || shippingAddress.address?.addressLine2 || '',
      city: shippingAddress.city || shippingAddress.address?.city || '',
      province: shippingAddress.province || shippingAddress.provinceCode || shippingAddress.address?.provinceCode || '',
      state: shippingAddress.province || shippingAddress.provinceCode || shippingAddress.address?.provinceCode || '',
      postalCode: shippingAddress.postal_code || shippingAddress.postalCode || shippingAddress.address?.postalCode || '',
      postal_code: shippingAddress.postal_code || shippingAddress.postalCode || shippingAddress.address?.postalCode || '',
      country: shippingAddress.country || shippingAddress.address?.country || '',
      countryCode: shippingAddress.countryCode || shippingAddress.address?.countryCode || 'CA',
      phone: shippingAddress.phone || ''
    };

    // Get shipping rates
    const rates = await shippingService.getShippingRates({ items, destination });

    // Return in format expected by frontend
    return res.json({
      success: true,
      options: [
        {
          id: 'standard',
          name: rates.standard.name,
          price: rates.standard.cost,
          currency: 'USD',
          deliveryDays: rates.standard.delivery,
          estimatedDelivery: rates.standard.delivery,
          minDays: rates.standard.minDays,
          maxDays: rates.standard.maxDays,
          icon: '📦',
          type: 'standard'
        },
        {
          id: 'express',
          name: rates.express.name,
          price: rates.express.cost,
          currency: 'USD',
          deliveryDays: rates.express.delivery,
          estimatedDelivery: rates.express.delivery,
          minDays: rates.express.minDays,
          maxDays: rates.express.maxDays,
          icon: '🚀',
          type: 'express'
        }
      ],
      calculation: {
        source: rates.standard.source,
        standard: rates.standard,
        express: rates.express
      }
    });
  } catch (error) {
    console.error('Calculate shipping rates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping rates',
      error: error.message
    });
  }
};

/**
 * Validate phone number
 * POST /api/shipping/validate-phone
 */
export const validatePhone = async (req, res) => {
  try {
    const { phone, country } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Phone number is required'
      });
    }

    // Basic phone validation
    const cleaned = phone.replace(/[^\d+]/g, '');
    const digitsOnly = cleaned.replace(/\+/g, '');
    const isValid = digitsOnly.length >= 10 && digitsOnly.length <= 15;

    if (isValid) {
      return res.status(200).json({
        success: true,
        valid: true,
        formatted: cleaned
      });
    } else {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Invalid phone number format'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Phone validation failed'
    });
  }
};

