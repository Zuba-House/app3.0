/**
 * ZUBA HOUSE - EasyPost Shipping Service
 * 
 * Features:
 * - EasyPost integration for Canada Post real rates
 * - Smart fallback pricing (always works)
 * - Zone-based pricing (Canada, USA, International)
 * - Maximum caps ($30 Standard / $40 Express)
 * - Branded as "Zuba Shipping"
 */

import EasyPostClient from '@easypost/api';
import { WAREHOUSE } from '../config/stallion.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize EasyPost client
// API key must be set in environment variable: EASYPOST_API_KEY
const apiKey = process.env.EASYPOST_API_KEY;
if (!apiKey) {
  console.warn('⚠️ EASYPOST_API_KEY not set in environment variables. EasyPost features will use fallback pricing.');
}
const easypost = apiKey ? new EasyPostClient(apiKey) : null;

/**
 * Get shipping zone from country code
 */
const getShippingZone = (countryCode) => {
  if (!countryCode) return 'international';
  
  const code = countryCode.toString().toUpperCase();
  if (code === 'CA') return 'canada';
  if (code === 'US') return 'usa';
  return 'international';
};

/**
 * Calculate fallback shipping rates
 * Used when EasyPost is unavailable or for non-Canada destinations
 */
const calculateFallbackRates = (items, destination) => {
  const zone = getShippingZone(destination.countryCode || destination.country);
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  // Zone-based pricing
  const zonePricing = {
    canada: {
      standard: { base: 10, additional: 3, expressBase: 17, expressAdditional: 5 },
      minDays: 5,
      maxDays: 10
    },
    usa: {
      standard: { base: 13, additional: 2, expressBase: 20, expressAdditional: 3 },
      minDays: 7,
      maxDays: 14
    },
    international: {
      standard: { base: 15, additional: 2.5, expressBase: 25, expressAdditional: 3 },
      minDays: 10,
      maxDays: 20
    }
  };
  
  const pricing = zonePricing[zone] || zonePricing.international;
  
  // Calculate costs
  let standardCost = pricing.standard.base;
  let expressCost = pricing.expressBase;
  
  if (itemCount > 1) {
    standardCost += (itemCount - 1) * pricing.standard.additional;
    expressCost += (itemCount - 1) * pricing.expressAdditional;
  }
  
  // Apply maximum caps
  const MAX_STANDARD = 30;
  const MAX_EXPRESS = 40;
  
  standardCost = Math.min(standardCost, MAX_STANDARD);
  expressCost = Math.min(expressCost, MAX_EXPRESS);
  
  // Calculate express delivery days (60% of standard, but minimum 2-5 days)
  const expressMinDays = Math.max(2, Math.ceil(pricing.minDays * 0.6));
  const expressMaxDays = Math.max(5, Math.ceil(pricing.maxDays * 0.6));
  
  return {
    standard: {
      name: 'Zuba Standard Shipping',
      cost: Math.round(standardCost * 100) / 100,
      displayCost: `$${standardCost.toFixed(2)} USD`,
      delivery: `${pricing.minDays}-${pricing.maxDays} business days`,
      estimatedDelivery: `${pricing.minDays}-${pricing.maxDays} business days`,
      minDays: pricing.minDays,
      maxDays: pricing.maxDays,
      type: 'standard',
      source: 'fallback'
    },
    express: {
      name: 'Zuba Express Shipping',
      cost: Math.round(expressCost * 100) / 100,
      displayCost: `$${expressCost.toFixed(2)} USD`,
      delivery: `${expressMinDays}-${expressMaxDays} business days`,
      estimatedDelivery: `${expressMinDays}-${expressMaxDays} business days`,
      minDays: expressMinDays,
      maxDays: expressMaxDays,
      type: 'express',
      source: 'fallback'
    }
  };
};

/**
 * Get shipping rates from EasyPost
 */
export const getShippingRates = async ({ items, destination }) => {
  try {
    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Items are required');
    }
    
    if (!destination) {
      throw new Error('Destination address is required');
    }
    
    // Check if destination is Canada (EasyPost works best for Canada Post)
    const isCanada = getShippingZone(destination.countryCode || destination.country) === 'canada';
    
    // Try EasyPost for Canada destinations (only if API key is configured)
    if (isCanada && easypost) {
      try {
        // Prepare from address (warehouse)
        const fromAddress = {
          name: WAREHOUSE.name,
          company: WAREHOUSE.company,
          street1: WAREHOUSE.address1,
          street2: WAREHOUSE.address2 || '',
          city: WAREHOUSE.city,
          state: WAREHOUSE.province,
          zip: WAREHOUSE.postal_code,
          country: WAREHOUSE.country,
          phone: WAREHOUSE.phone
        };
        
        // Prepare to address
        const toAddress = {
          name: `${destination.firstName || ''} ${destination.lastName || ''}`.trim() || 'Customer',
          street1: destination.address || destination.addressLine1 || '',
          street2: destination.addressLine2 || '',
          city: destination.city,
          state: destination.province || destination.state || '',
          zip: destination.postalCode || destination.postal_code || '',
          country: destination.countryCode || destination.country || 'CA',
          phone: destination.phone || ''
        };
        
        // Calculate total weight (default 0.5kg per item if not specified)
        const totalWeight = items.reduce((sum, item) => {
          const weight = item.weight || item.product?.shipping?.weight || 0.5;
          const quantity = item.quantity || 1;
          return sum + (weight * quantity);
        }, 0);
        
        // Create parcel (weight in oz for EasyPost)
        const parcel = {
          length: 8, // inches
          width: 6,
          height: 4,
          weight: Math.max(totalWeight * 35.274, 1) // Convert kg to oz, minimum 1 oz
        };
        
        // Create shipment to get rates
        const shipment = await easypost.Shipment.create({
          from_address: fromAddress,
          to_address: toAddress,
          parcel: parcel
        });
        
        if (shipment.rates && shipment.rates.length > 0) {
          // Find standard and express rates
          const standardRate = shipment.rates.find(r => 
            r.service && (
              r.service.toLowerCase().includes('regular') ||
              r.service.toLowerCase().includes('standard') ||
              r.service.toLowerCase().includes('ground')
            )
          ) || shipment.rates[0]; // Fallback to first rate
          
          // Find express rate - prioritize express services, then find higher rate than standard
          let expressRate = shipment.rates.find(r => 
            r.service && (
              r.service.toLowerCase().includes('express') ||
              r.service.toLowerCase().includes('xpresspost') ||
              r.service.toLowerCase().includes('priority')
            )
          );
          
          // If no express service found, find the highest rate (should be faster service)
          if (!expressRate) {
            const sortedRates = [...shipment.rates].sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
            expressRate = sortedRates.find(r => parseFloat(r.rate) > parseFloat(standardRate.rate)) || sortedRates[0];
          }
          
          // Ensure we have both rates
          if (!expressRate) {
            expressRate = standardRate;
          }
          
          // Convert to USD (EasyPost returns CAD for Canada Post)
          const cadToUsd = 0.73; // Approximate conversion
          
          const standardCost = Math.max(0, parseFloat(standardRate.rate || 0) * cadToUsd);
          let expressCost = Math.max(0, parseFloat(expressRate.rate || 0) * cadToUsd);
          
          // Ensure express is at least 1.2x standard (minimum express premium)
          // This ensures express is always more expensive than standard
          const minExpressCost = standardCost * 1.2;
          if (expressCost < minExpressCost) {
            expressCost = minExpressCost;
          }
          
          // Apply caps
          const MAX_STANDARD = 30;
          const MAX_EXPRESS = 40;
          
          return {
            standard: {
              name: 'Zuba Standard Shipping',
              cost: Math.min(Math.round(standardCost * 100) / 100, MAX_STANDARD),
              displayCost: `$${Math.min(standardCost, MAX_STANDARD).toFixed(2)} USD`,
              delivery: standardRate.est_delivery_days 
                ? `${standardRate.est_delivery_days} business days`
                : '5-10 business days',
              estimatedDelivery: standardRate.est_delivery_days 
                ? `${standardRate.est_delivery_days} business days`
                : '5-10 business days',
              minDays: 5,
              maxDays: 10,
              type: 'standard',
              source: 'easypost',
              carrier: standardRate.carrier || 'Canada Post'
            },
            express: {
              name: 'Zuba Express Shipping',
              cost: Math.min(Math.round(expressCost * 100) / 100, MAX_EXPRESS),
              displayCost: `$${Math.min(expressCost, MAX_EXPRESS).toFixed(2)} USD`,
              delivery: expressRate.est_delivery_days
                ? `${expressRate.est_delivery_days} business days`
                : '2-5 business days',
              estimatedDelivery: expressRate.est_delivery_days
                ? `${expressRate.est_delivery_days} business days`
                : '2-5 business days',
              minDays: 2,
              maxDays: 5,
              type: 'express',
              source: 'easypost',
              carrier: expressRate.carrier || 'Canada Post'
            }
          };
        }
      } catch (easypostError) {
        console.error('EasyPost error:', easypostError.message);
        // Fall through to fallback
      }
    }
    
    // Use fallback pricing (for non-Canada or if EasyPost fails)
    return calculateFallbackRates(items, destination);
    
  } catch (error) {
    console.error('Shipping service error:', error);
    // Always return fallback rates
    return calculateFallbackRates(items, destination || {});
  }
};

