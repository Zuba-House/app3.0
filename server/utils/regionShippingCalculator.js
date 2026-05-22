/**
 * Region-Based Shipping Calculator
 * Calculates shipping costs based on distance from warehouse and region
 * Warehouse: Gatineau, Quebec, Canada (J9H5W5)
 * 
 * FUTURE ENHANCEMENT: This will be extended to support vendor-location-based shipping
 * where shipping cost and delivery time will vary based on where the vendor's products
 * are located (e.g., if vendor is in Rwanda and customer is in Ottawa, shipping will
 * be calculated based on Rwanda-to-Ottawa distance and international rates)
 */

export default class RegionShippingCalculator {
  // Warehouse coordinates (Gatineau, Quebec)
  static WAREHOUSE_COORDS = {
    lat: 45.4765,
    lng: -75.7013
  };

  // Region definitions with base rates and multipliers
  static REGIONS = {
    // Canada (same country) - Updated for Ottawa/Gatineau area
    CA: {
      baseRate: 5.0, // Starting from $5.00 USD
      extraItemRate: 2.0, // Reduced additional item rate
      weightMultiplier: 0.8, // Reduced weight multiplier
      distanceMultiplier: 0.5, // Reduced distance multiplier for local areas
      minDays: 2, // Normal shipping: 2 days
      maxDays: 2, // Normal shipping: 2 days
      expressMinDays: 1, // Express shipping: 1 day
      expressMaxDays: 1, // Express shipping: 1 day
      name: 'Canada'
    },
    // United States (neighboring country)
    US: {
      baseRate: 18,
      extraItemRate: 4,
      weightMultiplier: 1.2,
      distanceMultiplier: 1.1,
      minDays: 5,
      maxDays: 10,
      name: 'United States'
    },
    // Europe
    EU: {
      baseRate: 35,
      extraItemRate: 8,
      weightMultiplier: 1.5,
      distanceMultiplier: 1.8,
      minDays: 10,
      maxDays: 18,
      name: 'Europe'
    },
    // Asia
    ASIA: {
      baseRate: 40,
      extraItemRate: 10,
      weightMultiplier: 1.6,
      distanceMultiplier: 2.0,
      minDays: 12,
      maxDays: 25,
      name: 'Asia'
    },
    // Australia & Oceania
    OCEANIA: {
      baseRate: 45,
      extraItemRate: 12,
      weightMultiplier: 1.7,
      distanceMultiplier: 2.2,
      minDays: 15,
      maxDays: 30,
      name: 'Australia & Oceania'
    },
    // South America
    SA: {
      baseRate: 38,
      extraItemRate: 9,
      weightMultiplier: 1.5,
      distanceMultiplier: 1.9,
      minDays: 12,
      maxDays: 22,
      name: 'South America'
    },
    // Africa
    AFRICA: {
      baseRate: 42,
      extraItemRate: 11,
      weightMultiplier: 1.6,
      distanceMultiplier: 2.1,
      minDays: 14,
      maxDays: 28,
      name: 'Africa'
    },
    // Middle East
    ME: {
      baseRate: 40,
      extraItemRate: 10,
      weightMultiplier: 1.6,
      distanceMultiplier: 2.0,
      minDays: 12,
      maxDays: 25,
      name: 'Middle East'
    },
    // Default (rest of world)
    DEFAULT: {
      baseRate: 50,
      extraItemRate: 12,
      weightMultiplier: 1.8,
      distanceMultiplier: 2.5,
      minDays: 15,
      maxDays: 35,
      name: 'International'
    }
  };

  /**
   * Get region based on country code
   */
  static getRegion(countryCode) {
    if (!countryCode) return this.REGIONS.DEFAULT;

    const code = countryCode.toUpperCase();

    // Canada
    if (code === 'CA') return this.REGIONS.CA;

    // United States
    if (code === 'US') return this.REGIONS.US;

    // Europe
    const europeCodes = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH', 'IS', 'LI'];
    if (europeCodes.includes(code)) return this.REGIONS.EU;

    // Asia
    const asiaCodes = ['CN', 'JP', 'KR', 'IN', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'HK', 'TW', 'BD', 'PK', 'LK'];
    if (asiaCodes.includes(code)) return this.REGIONS.ASIA;

    // Oceania
    const oceaniaCodes = ['AU', 'NZ', 'FJ', 'PG', 'NC', 'PF'];
    if (oceaniaCodes.includes(code)) return this.REGIONS.OCEANIA;

    // South America
    const saCodes = ['AR', 'BR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'];
    if (saCodes.includes(code)) return this.REGIONS.SA;

    // Africa
    const africaCodes = ['ZA', 'EG', 'NG', 'KE', 'GH', 'MA', 'DZ', 'TZ', 'ET', 'UG', 'AO', 'SD'];
    if (africaCodes.includes(code)) return this.REGIONS.AFRICA;

    // Middle East
    const meCodes = ['AE', 'SA', 'IL', 'TR', 'IQ', 'IR', 'JO', 'LB', 'KW', 'OM', 'QA', 'BH', 'YE'];
    if (meCodes.includes(code)) return this.REGIONS.ME;

    return this.REGIONS.DEFAULT;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in kilometers
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate shipping cost based on region, quantity, weight, and distance
   * Shipping decreases as quantity increases (progressive discount)
   */
  static calculateRegionShipping(region, quantity, weight, distance = null) {
    const regionData = this.getRegion(region);

    // Base rate
    let cost = regionData.baseRate;

    // Progressive quantity discount - shipping decreases as quantity increases
    // For Canada: More items = better per-item shipping rate
    if (quantity > 1) {
      // First item: full base rate
      // Additional items: decreasing rate per item
      let additionalCost = 0;
      
      if (quantity <= 3) {
        // 2-3 items: $2.00 per additional item
        additionalCost = (quantity - 1) * 2.0;
      } else if (quantity <= 5) {
        // 4-5 items: $1.50 per additional item (after first 3)
        additionalCost = 2 * 2.0 + (quantity - 3) * 1.5;
      } else if (quantity <= 10) {
        // 6-10 items: $1.00 per additional item (after first 5)
        additionalCost = 2 * 2.0 + 2 * 1.5 + (quantity - 5) * 1.0;
      } else {
        // 11+ items: $0.75 per additional item (after first 10)
        additionalCost = 2 * 2.0 + 2 * 1.5 + 5 * 1.0 + (quantity - 10) * 0.75;
      }
      
      cost += additionalCost;
    }

    // Weight surcharge (applies multiplier) - only for heavy items
    if (weight > 5) {
      const weightOver = weight - 5;
      cost += weightOver * 1.5 * regionData.weightMultiplier; // Reduced from 2 to 1.5
    }

    // Distance multiplier (if coordinates provided)
    // For Ottawa/Gatineau area (within ~50km), no distance surcharge
    if (distance !== null && distance > 0) {
      // Only apply distance multiplier for distances > 50km
      if (distance > 50) {
        if (distance > 1000) { // Over 1000km
          cost *= (1 + (distance / 10000) * regionData.distanceMultiplier);
        } else if (distance > 500) { // Over 500km
          cost *= (1 + (distance / 5000) * regionData.distanceMultiplier);
        } else if (distance > 100) { // Over 100km
          cost *= (1 + (distance / 1000) * regionData.distanceMultiplier * 0.5);
        }
      }
      // For distances <= 50km (Ottawa/Gatineau area), no surcharge
    }

    // Progressive bulk discount based on quantity
    if (quantity >= 15) {
      cost *= 0.80; // 20% discount for 15+ items
    } else if (quantity >= 10) {
      cost *= 0.85; // 15% discount for 10-14 items
    } else if (quantity >= 5) {
      cost *= 0.90; // 10% discount for 5-9 items
    }

    // Ensure minimum cost of $5.00 for Canada
    if (region === 'CA' && cost < 5.0) {
      cost = 5.0;
    }

    return Math.round(cost * 100) / 100;
  }

  /**
   * Get delivery time estimate based on region
   * Returns both standard and express options
   */
  static getDeliveryEstimate(region, shippingType = 'standard') {
    const regionData = this.getRegion(region);
    
    // For Canada, check if express shipping
    if (region === 'CA' && shippingType === 'express') {
      return {
        minDays: regionData.expressMinDays || 1,
        maxDays: regionData.expressMaxDays || 1,
        estimate: '1 business day',
        regionName: regionData.name,
        type: 'express'
      };
    }
    
    return {
      minDays: regionData.minDays,
      maxDays: regionData.maxDays,
      estimate: `${regionData.minDays}-${regionData.maxDays} business days`,
      regionName: regionData.name,
      type: 'standard'
    };
  }

  /**
   * Calculate distance from warehouse to destination
   * @param {Object} coordinates - { lat, lng }
   * @returns {Number} Distance in kilometers
   */
  static getDistanceFromWarehouse(coordinates) {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return null;
    }

    return this.calculateDistance(
      this.WAREHOUSE_COORDS.lat,
      this.WAREHOUSE_COORDS.lng,
      coordinates.lat,
      coordinates.lng
    );
  }
}

