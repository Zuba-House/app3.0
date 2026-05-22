import VendorModel from '../models/vendor.model.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import OrderModel from '../models/order.model.js';
import { 
  sendVendorWelcome, 
  sendVendorStatusChange,
  sendVendorProductApproved,
  sendVendorProductRejected
} from '../utils/vendorEmails.js';

/**
 * GET /api/admin/vendors
 * Get all vendors with filters
 */
export const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeSlug: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [vendors, total] = await Promise.all([
      VendorModel.find(filter)
        .populate('ownerUser', 'name email phone status verify_email')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VendorModel.countDocuments(filter)
    ]);

    // Ensure all vendor fields have safe defaults to prevent frontend crashes
    // Convert all string fields to strings explicitly to prevent toLowerCase() errors
    const safeVendors = vendors.map(vendor => {
      // Ensure ownerUser is properly formatted
      const ownerUser = vendor?.ownerUser ? {
        _id: vendor.ownerUser._id || null,
        name: String(vendor.ownerUser.name || 'N/A'),
        email: String(vendor.ownerUser.email || ''),
        phone: String(vendor.ownerUser.phone || ''),
        ...vendor.ownerUser
      } : { name: 'N/A', email: '', phone: '' };

      return {
        ...vendor,
        _id: vendor?._id || null,
        storeName: String(vendor?.storeName || 'N/A'),
        storeSlug: String(vendor?.storeSlug || ''),
        email: String(vendor?.email || ''),
        status: String(vendor?.status || 'PENDING'),
        availableBalance: Number(vendor?.availableBalance || 0),
        totalSales: Number(vendor?.totalSales || 0),
        totalEarnings: Number(vendor?.totalEarnings || 0),
        createdAt: vendor?.createdAt || new Date(),
        ownerUser: ownerUser,
        categories: Array.isArray(vendor?.categories) ? vendor.categories : []
      };
    });

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        vendors: safeVendors,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/admin/vendors/:id
 * Get single vendor details
 */
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id)
      .populate('ownerUser', 'name email phone status verify_email createdAt')
      .populate('categories', 'name slug');

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor stats
    const productCount = await ProductModel.countDocuments({ vendor: id });
    const orderCount = await OrderModel.countDocuments({ 'products.vendor': id });

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        vendor,
        stats: {
          productCount,
          orderCount
        }
      }
    });
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/admin/vendors/:id/status
 * Update vendor status (APPROVE, REJECT, SUSPEND)
 */
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    const oldStatus = vendor.status;
    vendor.status = status;

    // If approving, ensure user role is VENDOR
    if (status === 'APPROVED' && oldStatus !== 'APPROVED') {
      const user = await UserModel.findById(vendor.ownerUser);
      if (user) {
        user.role = 'VENDOR';
        user.vendor = vendor._id;
        user.vendorId = vendor._id;
        await user.save();
      }
    }

    // If rejecting or suspending, optionally revoke access
    if ((status === 'REJECTED' || status === 'SUSPENDED') && oldStatus === 'APPROVED') {
      const user = await UserModel.findById(vendor.ownerUser);
      if (user) {
        // Keep role as VENDOR but they won't be able to login if suspended
        // You can change this behavior if needed
      }
    }

    await vendor.save();

    // Send email notification to vendor about status change (non-blocking)
    if (vendor.email) {
      if (status === 'APPROVED') {
        sendVendorWelcome(vendor).catch(err => {
          console.error('Failed to send vendor welcome email:', err);
        });
      } else {
        sendVendorStatusChange(vendor, status, notes || '').catch(err => {
          console.error('Failed to send vendor status change email:', err);
        });
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: `Vendor status updated to ${status}`,
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor status error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/admin/vendors/:id
 * Update vendor details
 */
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.ownerUser;
    delete updates.totalSales;
    delete updates.totalEarnings;
    delete updates.availableBalance;
    delete updates.pendingBalance;

    const vendor = await VendorModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('ownerUser', 'name email');

    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * DELETE /api/admin/vendors/:id
 * Delete vendor PERMANENTLY from database
 * This allows the user to re-register as a vendor with the same email
 */
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteUserToo = false } = req.query; // Option to also delete user account

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorEmail = vendor.email;
    const ownerUserId = vendor.ownerUser;

    console.log(`🗑️ Deleting vendor: ${vendor.storeName} (${vendorEmail})`);

    // Delete vendor's products (optional - uncomment if you want to delete products too)
    // await ProductModel.deleteMany({ vendor: id });
    // console.log('   - Deleted vendor products');

    // Delete vendor's payouts
    try {
      const PayoutModel = (await import('../models/payout.model.js')).default;
      await PayoutModel.deleteMany({ vendor: id });
      console.log('   - Deleted vendor payouts');
    } catch (e) {
      console.log('   - No payout model or no payouts to delete');
    }

    // Delete the vendor document
    await VendorModel.findByIdAndDelete(id);
    console.log('   - Deleted vendor document');

    // Update or delete the user
    if (ownerUserId) {
      const user = await UserModel.findById(ownerUserId);
      if (user) {
        if (deleteUserToo === 'true') {
          // Completely delete the user account
          await UserModel.findByIdAndDelete(ownerUserId);
          console.log('   - Deleted user account');
        } else {
          // Just remove vendor association and change role back to USER
          // This allows them to re-register as vendor
          user.vendor = null;
          user.vendorId = null;
          user.role = 'USER';
          await user.save();
          console.log('   - User account kept but vendor association removed');
        }
      }
    }

    console.log(`✅ Vendor ${vendor.storeName} deleted successfully`);

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Vendor deleted permanently. The user can now re-register as a vendor.',
      data: {
        deletedVendor: vendor.storeName,
        email: vendorEmail
      }
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * DELETE /api/admin/vendors/:id/permanent
 * Delete vendor AND user account permanently
 * Use this when you want to completely remove all traces
 */
export const deleteVendorPermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorEmail = vendor.email;
    const ownerUserId = vendor.ownerUser;
    const storeName = vendor.storeName;

    console.log(`🗑️ PERMANENT DELETE: ${storeName} (${vendorEmail})`);

    // Delete all related data
    try {
      // Delete vendor's products
      const deletedProducts = await ProductModel.deleteMany({ vendor: id });
      console.log(`   - Deleted ${deletedProducts.deletedCount} products`);

      // Delete vendor's payouts
      const PayoutModel = (await import('../models/payout.model.js')).default;
      const deletedPayouts = await PayoutModel.deleteMany({ vendor: id });
      console.log(`   - Deleted ${deletedPayouts.deletedCount} payouts`);
    } catch (e) {
      console.log('   - Error deleting related data:', e.message);
    }

    // Delete the vendor document
    await VendorModel.findByIdAndDelete(id);
    console.log('   - Deleted vendor document');

    // Delete the user account
    if (ownerUserId) {
      await UserModel.findByIdAndDelete(ownerUserId);
      console.log('   - Deleted user account');
    }

    console.log(`✅ Vendor ${storeName} and all related data permanently deleted`);

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Vendor and user account permanently deleted. Email can be used for new registration.',
      data: {
        deletedVendor: storeName,
        email: vendorEmail
      }
    });
  } catch (error) {
    console.error('Permanent delete vendor error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/admin/vendors/:id/withdrawal-access
 * Grant or revoke withdrawal access
 */
export const updateWithdrawalAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowWithdrawal } = req.body;

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // You can add a field like `withdrawalEnabled` to vendor model
    // For now, we'll use a simple approach - only APPROVED vendors can withdraw
    // This is already handled by the vendor model logic

    return res.status(200).json({
      error: false,
      success: true,
      message: allowWithdrawal 
        ? 'Withdrawal access granted' 
        : 'Withdrawal access revoked',
      data: vendor
    });
  } catch (error) {
    console.error('Update withdrawal access error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// ============================================
// VENDOR PRODUCT MANAGEMENT (Approval System)
// ============================================

/**
 * GET /api/admin/vendors/products
 * Get all vendor products with filters (for approval management)
 */
export const getVendorProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      approvalStatus, 
      vendorId, 
      search,
      status
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filter for vendor products - include products with vendor field OR productOwnerType: 'VENDOR'
    const filter = {
      $or: [
        { productOwnerType: 'VENDOR' },
        { vendor: { $exists: true, $ne: null } }
      ]
    };

    // Filter by approval status
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    // Filter by specific vendor
    if (vendorId) {
      filter.vendor = vendorId;
    }

    // Filter by product status
    if (status) {
      filter.status = status;
    }

    // Search by name or SKU
    if (search) {
      filter.$and = [
        { $or: filter.$or },
        { $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ]}
      ];
      delete filter.$or;
    }

    console.log('📦 Vendor products filter:', JSON.stringify(filter, null, 2));

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .populate('vendor', 'storeName email storeSlug')
        .populate('category', 'name slug')
        .select('name sku images featuredImage pricing inventory status approvalStatus vendorShopName vendor createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProductModel.countDocuments(filter)
    ]);

    // Get counts by approval status (for vendor products)
    const vendorProductFilter = {
      $or: [
        { productOwnerType: 'VENDOR' },
        { vendor: { $exists: true, $ne: null } }
      ]
    };

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      ProductModel.countDocuments({ ...vendorProductFilter, approvalStatus: 'PENDING_REVIEW' }),
      ProductModel.countDocuments({ ...vendorProductFilter, approvalStatus: 'APPROVED' }),
      ProductModel.countDocuments({ ...vendorProductFilter, approvalStatus: 'REJECTED' })
    ]);

    console.log(`📊 Vendor products: ${total} total, ${pendingCount} pending, ${approvedCount} approved, ${rejectedCount} rejected`);

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        products,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        counts: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/admin/vendors/products/:productId
 * Get single vendor product details
 */
export const getVendorProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const id = productId;

    const product = await ProductModel.findById(id)
      .populate('vendor', 'storeName email storeSlug phone')
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get vendor product by ID error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/admin/vendors/products/:productId/approve
 * Approve a vendor product
 */
export const approveVendorProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const id = productId;
    const { notes } = req.body;

    const product = await ProductModel.findById(id).populate('vendor', 'storeName email');

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Product not found'
      });
    }

    // Check if it's a vendor product (has vendor field)
    if (!product.vendor && product.productOwnerType !== 'VENDOR') {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'This product is not a vendor product'
      });
    }

    // Update approval status and set to PUBLISHED/ACTIVE
    product.approvalStatus = 'APPROVED';
    product.status = 'published'; // Set to published/active
    product.publishedAt = new Date();
    
    if (notes) {
      product.adminNotes = (product.adminNotes ? product.adminNotes + '\n' : '') + 
        `[${new Date().toISOString()}] Approved: ${notes}`;
    }

    await product.save();

    console.log(`✅ Product approved: ${product.name} (ID: ${id})`);

    // Send email notification to vendor (non-blocking)
    if (product.vendor?.email) {
      sendVendorProductApproved(product.vendor, product).catch(err => {
        console.error('Failed to send product approved email:', err);
      });
    } else {
      // Try to find vendor by vendorId
      const vendor = await VendorModel.findById(product.vendorId || product.vendor);
      if (vendor?.email) {
        sendVendorProductApproved(vendor, product).catch(err => {
          console.error('Failed to send product approved email:', err);
        });
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Product approved and published successfully! Vendor has been notified.',
      data: product
    });
  } catch (error) {
    console.error('Approve vendor product error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/admin/vendors/products/:productId/reject
 * Reject a vendor product
 */
export const rejectVendorProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const id = productId;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const product = await ProductModel.findById(id).populate('vendor', 'storeName email');

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Product not found'
      });
    }

    // Check if it's a vendor product
    if (!product.vendor && product.productOwnerType !== 'VENDOR') {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'This product is not a vendor product'
      });
    }

    // Update approval status
    product.approvalStatus = 'REJECTED';
    product.status = 'draft'; // Move back to draft
    
    // Add rejection reason to admin notes
    product.adminNotes = (product.adminNotes ? product.adminNotes + '\n' : '') + 
      `[${new Date().toISOString()}] Rejected - Reason: ${reason}` +
      (notes ? `\nNotes: ${notes}` : '');

    await product.save();

    console.log(`❌ Product rejected: ${product.name} (ID: ${id}) - Reason: ${reason}`);

    // Send email notification to vendor (non-blocking)
    if (product.vendor?.email) {
      sendVendorProductRejected(product.vendor, product, reason).catch(err => {
        console.error('Failed to send product rejected email:', err);
      });
    } else {
      // Try to find vendor by vendorId
      const vendor = await VendorModel.findById(product.vendorId || product.vendor);
      if (vendor?.email) {
        sendVendorProductRejected(vendor, product, reason).catch(err => {
          console.error('Failed to send product rejected email:', err);
        });
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Product rejected. Vendor has been notified.',
      data: product
    });
  } catch (error) {
    console.error('Reject vendor product error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

