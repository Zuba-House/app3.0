import { WAREHOUSE } from '../config/stallion.js';
import * as shippingService from '../services/shipping.service.js';
import axios from 'axios';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'ZubaHouseBackend/1.0';

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

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';

/**
 * Address autocomplete (same as web): Google Places when API key set, else Nominatim.
 * GET /api/shipping/address-autocomplete?q=...
 */
function parseAddressFromNominatim(addr) {
  if (!addr) return {};
  const road = addr.road || '';
  const houseNumber = addr.house_number || '';
  const addressLine1 = `${houseNumber} ${road}`.trim() || addr.suburb || addr.village || addr.town || addr.city || '';
  return {
    addressLine1,
    city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
    state: addr.state || addr.county || '',
    postalCode: addr.postcode || '',
    country: addr.country || '',
    countryCode: (addr.country_code || '').toUpperCase(),
  };
}

function parseAddressFromGooglePlace(result) {
  if (!result || !result.address_components) return null;
  const components = {};
  result.address_components.forEach((c) => {
    c.types.forEach((t) => {
      if (!components[t]) components[t] = { long: c.long_name, short: c.short_name };
    });
  });
  const city = components.locality?.long || components.administrative_area_level_2?.long || components.postal_town?.long || '';
  const state = components.administrative_area_level_1?.long || '';
  const stateCode = components.administrative_area_level_1?.short || '';
  const country = components.country?.long || '';
  const countryCode = (components.country?.short || '').toUpperCase();
  const postalCode = (components.postal_code?.long || '').replace(/\s/g, '');
  const streetNumber = components.street_number?.long || '';
  const route = components.route?.long || '';
  const addressLine1 = [streetNumber, route].filter(Boolean).join(' ').trim() || (result.formatted_address || '').split(',')[0] || '';
  return {
    displayName: result.formatted_address || '',
    addressLine1,
    city,
    state: stateCode || state,
    postalCode,
    country,
    countryCode,
  };
}

export const addressAutocomplete = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    if (GOOGLE_MAPS_API_KEY) {
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}&types=address`;
      const { data: acData } = await axios.get(autocompleteUrl);
      const predictions = (acData.status === 'OK' && acData.predictions) ? acData.predictions : [];
      if (predictions.length > 0) {
        const suggestions = predictions.slice(0, 5).map((p) => ({
          placeId: p.place_id,
          displayName: p.description || p.structured_formatting?.main_text || '',
        }));
        return res.json({ success: true, suggestions });
      }
      if (acData.status === 'REQUEST_DENIED' || acData.status === 'OVER_QUERY_LIMIT') {
        console.warn('Google Places:', acData.status, acData.error_message || '');
      }
      /* Fall through to Nominatim when Google returns no results (e.g. "119 chem Rivermead Gatineau") */
    }

    let searchQ = q;
    if (/\bchem\b/i.test(q) && !/\bchemin\b/i.test(q)) {
      searchQ = q.replace(/\bchem\b/gi, 'chemin');
    }
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(searchQ)}&format=json&addressdetails=1&limit=8`;
    const { data } = await axios.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
    });
    if (!Array.isArray(data)) {
      return res.json({ success: true, suggestions: [] });
    }
    const suggestions = data.map((item) => {
      const addr = item.address || {};
      const parsed = parseAddressFromNominatim(addr);
      return {
        displayName: item.display_name || '',
        addressLine1: parsed.addressLine1 || item.name || '',
        city: parsed.city || '',
        state: parsed.state || '',
        postalCode: parsed.postalCode || '',
        country: parsed.country || '',
        countryCode: parsed.countryCode || '',
      };
    });
    return res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Address autocomplete error:', error?.message);
    return res.status(500).json({ success: false, message: 'Address search failed' });
  }
};

/**
 * Get full address for a Google Place ID (used when user selects a Google suggestion).
 * GET /api/shipping/address-details?place_id=...
 */
export const addressDetails = async (req, res) => {
  try {
    const placeId = (req.query.place_id || '').trim();
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'place_id required' });
    }
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(503).json({ success: false, message: 'Google Places not configured' });
    }
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=address_components,formatted_address&key=${GOOGLE_MAPS_API_KEY}`;
    const { data } = await axios.get(url);
    if (data.status !== 'OK' || !data.result) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }
    const parsed = parseAddressFromGooglePlace(data.result);
    if (!parsed) {
      return res.status(500).json({ success: false, message: 'Could not parse address' });
    }
    return res.json({ success: true, address: parsed });
  } catch (error) {
    console.error('Address details error:', error?.message);
    return res.status(500).json({ success: false, message: 'Address details failed' });
  }
};

/**
 * Parse phone number: detect country (Canada, Rwanda, etc.) and return E.164 + national format
 * POST /api/shipping/parse-phone
 * Body: { phone: string } (digits with optional + prefix)
 */
export const parsePhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const raw = (phone != null && typeof phone === 'string') ? phone : '';

    let parsePhoneNumberFromString;
    try {
      const lib = await import('libphonenumber-js');
      parsePhoneNumberFromString = lib.parsePhoneNumberFromString;
    } catch {
      parsePhoneNumberFromString = null;
    }

    if (!parsePhoneNumberFromString) {
      const digits = raw.replace(/\D/g, '');
      const withPlus = digits.startsWith('+') ? raw.replace(/\D/g, '') : digits;
      const valid = withPlus.length >= 10 && withPlus.length <= 15;
      return res.json({
        success: true,
        valid,
        countryCode: 'CA',
        callingCode: '+1',
        e164: valid ? (withPlus.startsWith('+') ? withPlus : `+${withPlus}`) : null,
        national: digits.slice(-10),
      });
    }

    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return res.json({
        success: true,
        valid: false,
        countryCode: null,
        callingCode: null,
        e164: null,
        national: null,
      });
    }

    const withPlus = raw.trim().startsWith('+') ? `+${cleaned}` : `+${cleaned}`;
    const parsed = parsePhoneNumberFromString(withPlus);
    if (parsed && parsed.isValid()) {
      const country = parsed.countryCallingCode;
      return res.json({
        success: true,
        valid: true,
        countryCode: parsed.country || 'CA',
        callingCode: `+${country}`,
        e164: parsed.number,
        national: parsed.formatNational(),
      });
    }

    return res.json({
      success: true,
      valid: false,
      countryCode: null,
      callingCode: null,
      e164: null,
      national: null,
    });
  } catch (error) {
    console.error('Parse phone error:', error?.message);
    return res.status(500).json({ success: false, message: 'Phone parse failed' });
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

