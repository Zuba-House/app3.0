import VendorModel from '../models/vendor.model.js';

/**
 * Commission Calculator Utility
 * Handles vendor earnings calculation and balance updates
 */

// Default platform commission rate (percentage)
const DEFAULT_COMMISSION_RATE = 15;

/**
 * Calculate vendor earnings and platform commission for an order item
 * @param {Object} item - Order item with price, quantity, vendorId
 * @param {Number} shippingFee - Shipping fee for this item (optional, usually 0 per item)
 * @returns {Promise<Object>} { vendorEarning, platformCommission, commissionRate, itemRevenue }
 */
export const calculateCommission = async (item, shippingFee = 0) => {
  try {
    // Get vendor ID from item
    const vendorId = item.vendor || item.vendorId;
    
    if (!vendorId) {
      // Not a vendor product - platform keeps all revenue
      const itemRevenue = (parseFloat(item.price) || 0) * (item.quantity || 1);
      return {
        vendorEarning: 0,
        platformCommission: itemRevenue,
        commissionRate: 100,
        itemRevenue,
        isVendorProduct: false
      };
    }

    // Get vendor info for commission rate
    const vendor = await VendorModel.findById(vendorId).select('commissionType commissionValue storeName');
    
    if (!vendor) {
      console.warn(`Commission calculation: Vendor not found: ${vendorId}`);
      // Default behavior if vendor not found
      const itemRevenue = (parseFloat(item.price) || 0) * (item.quantity || 1);
      const commissionRate = DEFAULT_COMMISSION_RATE;
      const platformCommission = (itemRevenue * commissionRate) / 100;
      return {
        vendorEarning: itemRevenue - platformCommission,
        platformCommission,
        commissionRate,
        itemRevenue,
        isVendorProduct: true,
        vendorNotFound: true
      };
    }

    // Calculate total item revenue (price * quantity)
    // Note: Shipping is typically handled separately at order level
    const itemRevenue = (parseFloat(item.price) || 0) * (item.quantity || 1) + shippingFee;
    
    let platformCommission = 0;
    let vendorEarning = 0;
    const commissionRate = vendor.commissionValue || DEFAULT_COMMISSION_RATE;
    const commissionType = vendor.commissionType || 'PERCENT';

    if (commissionType === 'PERCENT') {
      // Percentage-based commission
      platformCommission = (itemRevenue * commissionRate) / 100;
      vendorEarning = itemRevenue - platformCommission;
    } else if (commissionType === 'FLAT') {
      // Flat fee per item
      platformCommission = commissionRate * (item.quantity || 1);
      vendorEarning = Math.max(0, itemRevenue - platformCommission);
    }

    return {
      vendorEarning: parseFloat(vendorEarning.toFixed(2)),
      platformCommission: parseFloat(platformCommission.toFixed(2)),
      commissionRate,
      commissionType,
      itemRevenue: parseFloat(itemRevenue.toFixed(2)),
      isVendorProduct: true,
      vendorName: vendor.storeName
    };
  } catch (error) {
    console.error('Commission calculation error:', error);
    throw error;
  }
};

/**
 * Calculate commissions for all items in an order
 * @param {Array} items - Array of order items
 * @returns {Promise<Object>} { items: updatedItems, totalVendorEarnings, totalPlatformCommission, vendorSummary }
 */
export const calculateOrderCommissions = async (items) => {
  try {
    const updatedItems = [];
    let totalVendorEarnings = 0;
    let totalPlatformCommission = 0;
    const vendorSummary = {};

    for (const item of items) {
      const commission = await calculateCommission(item);
      
      // Update item with commission info
      const updatedItem = {
        ...item,
        vendorEarning: commission.vendorEarning,
        platformCommission: commission.platformCommission,
        commissionRate: commission.commissionRate,
        commissionType: commission.commissionType || 'PERCENT'
      };
      
      updatedItems.push(updatedItem);
      
      // Aggregate totals
      totalVendorEarnings += commission.vendorEarning;
      totalPlatformCommission += commission.platformCommission;
      
      // Build vendor summary
      const vendorId = item.vendor || item.vendorId;
      if (vendorId && commission.isVendorProduct) {
        const vendorKey = vendorId.toString();
        if (!vendorSummary[vendorKey]) {
          vendorSummary[vendorKey] = {
            vendorId,
            vendorName: commission.vendorName || '',
            totalAmount: 0,
            commission: 0,
            vendorEarning: 0,
            itemCount: 0
          };
        }
        vendorSummary[vendorKey].totalAmount += commission.itemRevenue;
        vendorSummary[vendorKey].commission += commission.platformCommission;
        vendorSummary[vendorKey].vendorEarning += commission.vendorEarning;
        vendorSummary[vendorKey].itemCount += 1;
      }
    }

    return {
      items: updatedItems,
      totalVendorEarnings: parseFloat(totalVendorEarnings.toFixed(2)),
      totalPlatformCommission: parseFloat(totalPlatformCommission.toFixed(2)),
      vendorSummary: Object.values(vendorSummary)
    };
  } catch (error) {
    console.error('Calculate order commissions error:', error);
    throw error;
  }
};

/**
 * Update vendor balance when order is delivered
 * Moves earnings from pending to available balance
 * @param {String} vendorId - Vendor ID
 * @param {Number} amount - Amount to add to available balance
 * @param {String} orderId - Order ID for logging
 * @returns {Promise<Object>} Updated vendor balance info
 */
export const creditVendorBalance = async (vendorId, amount, orderId = null) => {
  try {
    if (!vendorId || !amount || amount <= 0) {
      console.warn('creditVendorBalance: Invalid vendorId or amount', { vendorId, amount });
      return null;
    }

    const vendor = await VendorModel.findById(vendorId);
    
    if (!vendor) {
      console.error(`creditVendorBalance: Vendor not found: ${vendorId}`);
      return null;
    }

    // Update balances
    vendor.availableBalance = (vendor.availableBalance || 0) + amount;
    vendor.totalEarnings = (vendor.totalEarnings || 0) + amount;
    vendor.totalSales = (vendor.totalSales || 0) + 1;
    
    // Update stats
    if (vendor.stats) {
      vendor.stats.totalOrders = (vendor.stats.totalOrders || 0) + 1;
    }

    await vendor.save();

    console.log(`✅ Vendor balance credited: ${vendor.storeName} +$${amount}`, {
      vendorId,
      orderId,
      newAvailableBalance: vendor.availableBalance
    });

    return {
      vendorId,
      storeName: vendor.storeName,
      amountCredited: amount,
      newAvailableBalance: vendor.availableBalance,
      totalEarnings: vendor.totalEarnings
    };
  } catch (error) {
    console.error('creditVendorBalance error:', error);
    throw error;
  }
};

/**
 * Credit multiple vendors from a single order
 * @param {Array} vendorItems - Array of { vendorId, amount } objects
 * @param {String} orderId - Order ID for logging
 * @returns {Promise<Array>} Array of credit results
 */
export const creditMultipleVendors = async (vendorItems, orderId) => {
  const results = [];
  
  for (const item of vendorItems) {
    try {
      const result = await creditVendorBalance(item.vendorId, item.amount, orderId);
      results.push({ success: true, ...result });
    } catch (error) {
      results.push({ 
        success: false, 
        vendorId: item.vendorId, 
        amount: item.amount, 
        error: error.message 
      });
    }
  }
  
  return results;
};

/**
 * Debit vendor balance (for refunds, adjustments)
 * @param {String} vendorId - Vendor ID
 * @param {Number} amount - Amount to deduct
 * @param {String} reason - Reason for debit
 * @returns {Promise<Object>} Updated vendor balance info
 */
export const debitVendorBalance = async (vendorId, amount, reason = '') => {
  try {
    if (!vendorId || !amount || amount <= 0) {
      console.warn('debitVendorBalance: Invalid vendorId or amount', { vendorId, amount });
      return null;
    }

    const vendor = await VendorModel.findById(vendorId);
    
    if (!vendor) {
      console.error(`debitVendorBalance: Vendor not found: ${vendorId}`);
      return null;
    }

    // Check if vendor has enough balance
    if (vendor.availableBalance < amount) {
      console.warn(`debitVendorBalance: Insufficient balance for vendor ${vendorId}`, {
        requested: amount,
        available: vendor.availableBalance
      });
      return {
        success: false,
        error: 'Insufficient balance',
        availableBalance: vendor.availableBalance
      };
    }

    // Deduct from available balance
    vendor.availableBalance -= amount;
    await vendor.save();

    console.log(`💸 Vendor balance debited: ${vendor.storeName} -$${amount}`, {
      vendorId,
      reason,
      newAvailableBalance: vendor.availableBalance
    });

    return {
      success: true,
      vendorId,
      storeName: vendor.storeName,
      amountDebited: amount,
      reason,
      newAvailableBalance: vendor.availableBalance
    };
  } catch (error) {
    console.error('debitVendorBalance error:', error);
    throw error;
  }
};

export default {
  calculateCommission,
  calculateOrderCommissions,
  creditVendorBalance,
  creditMultipleVendors,
  debitVendorBalance
};

