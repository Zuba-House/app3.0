/**
 * Region-Based Shipping Calculator
 * Calculates shipping costs based on distance from warehouse and region
 * Warehouse: Gatineau, Quebec, Canada (J9H5W5)
 */

export default class RegionShippingCalculator {
  // Warehouse coordinates (Gatineau, Quebec)
  static WAREHOUSE_COORDS = {
    lat: 45.4765,
    lng: -75.7013
  };

  // Region definitions with base rates and multipliers
  static REGIONS = {
    // Canada (same country)
    CA: {
      baseRate: 13,
      extraItemRate: 3,
      weightMultiplier: 1.0,
      distanceMultiplier: 1.0,
      minDays: 3,
      maxDays: 7,
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
   */
  static calculateRegionShipping(region, quantity, weight, distance = null) {
    const regionData = this.getRegion(region);

    // Base rate
    let cost = regionData.baseRate;

    // Extra items (quantity - 1)
    if (quantity > 1) {
      cost += (quantity - 1) * regionData.extraItemRate;
    }

    // Weight surcharge (applies multiplier)
    if (weight > 5) {
      const weightOver = weight - 5;
      cost += weightOver * 2 * regionData.weightMultiplier;
    }

    // Distance multiplier (if coordinates provided)
    if (distance !== null && distance > 0) {
      // Apply distance multiplier for long distances
      if (distance > 1000) { // Over 1000km
        cost *= (1 + (distance / 10000) * regionData.distanceMultiplier);
      } else if (distance > 500) { // Over 500km
        cost *= (1 + (distance / 5000) * regionData.distanceMultiplier);
      }
    }

    // Bulk discount (10+ items)
    const bulkThreshold = 10;
    const bulkDiscount = 0.85;
    if (quantity >= bulkThreshold) {
      cost *= bulkDiscount;
    }

    return Math.round(cost * 100) / 100;
  }

  /**
   * Get delivery time estimate based on region
   */
  static getDeliveryEstimate(region) {
    const regionData = this.getRegion(region);
    return {
      minDays: regionData.minDays,
      maxDays: regionData.maxDays,
      estimate: `${regionData.minDays}-${regionData.maxDays} business days`,
      regionName: regionData.name
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

