import ProductModel from '../models/product.model.js';
import VendorModel from '../models/vendor.model.js';
import { 
  sendAdminProductSubmission, 
  sendVendorProductSubmitted 
} from '../utils/vendorEmails.js';

/**
 * GET /api/vendor/products
 * List vendor's products (scoped to vendor)
 */
export const list = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { page = 1, limit = 20, search = '', status, approvalStatus } = req.query;

    const filter = { vendor: vendorId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('categories', 'name slug')
        .lean(),
      ProductModel.countDocuments(filter)
    ]);

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('vendorProduct.list error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * POST /api/vendor/products
 * Create a new product (vendor-scoped)
 */
export const create = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const data = req.body;

    // Get vendor details for emails
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // Ensure vendor fields are set
    const productData = {
      ...data,
      vendor: vendorId,
      vendorId: vendorId, // Keep both for backward compatibility
      vendorShopName: vendor.storeName || '',
      productOwnerType: 'VENDOR',
      approvalStatus: 'PENDING_REVIEW', // Requires admin approval
      status: 'draft' // Start as draft until approved
    };

    const product = new ProductModel(productData);
    await product.save();

    // Populate category for email
    await product.populate('category', 'name slug');

    console.log(`📦 New product submitted by vendor ${vendor.storeName}: ${product.name}`);

    // Send email notifications (non-blocking)
    // 1. Email to vendor confirming submission
    sendVendorProductSubmitted(vendor, product).catch(err => {
      console.error('Failed to send vendor product submitted email:', err);
    });

    // 2. Email to admin about new submission
    sendAdminProductSubmission(vendor, product).catch(err => {
      console.error('Failed to send admin product submission email:', err);
    });

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Product submitted successfully! It will be reviewed within 24-48 hours.',
      data: product
    });
  } catch (error) {
    console.error('vendorProduct.create error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * GET /api/vendor/products/:id
 * Get single product (vendor-scoped)
 */
export const get = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;

    const product = await ProductModel.findOne({
      _id: productId,
      vendor: vendorId
    })
      .populate('categories', 'name slug')
      .populate('vendor', 'storeName storeSlug');

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
    console.error('vendorProduct.get error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * PUT /api/vendor/products/:id
 * Update product (vendor-scoped)
 */
export const update = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;
    const updates = req.body;

    // Remove fields vendor shouldn't change
    delete updates.vendor;
    delete updates.vendorId;
    delete updates.productOwnerType;
    delete updates.approvalStatus; // Only admin can change this

    // If updating, set approval back to pending if it was approved
    if (updates.status === 'PUBLISHED' || Object.keys(updates).length > 0) {
      updates.approvalStatus = 'PENDING_REVIEW';
    }

    const product = await ProductModel.findOneAndUpdate(
      { _id: productId, vendor: vendorId },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('categories', 'name slug');

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
      message: 'Product updated successfully. Waiting for approval.',
      data: product
    });
  } catch (error) {
    console.error('vendorProduct.update error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * DELETE /api/vendor/products/:id
 * Permanently delete product (vendor-scoped)
 */
export const remove = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;

    // Find the product first to verify ownership
    const product = await ProductModel.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Product not found'
      });
    }

    // Permanently delete the product
    await ProductModel.findByIdAndDelete(productId);

    console.log(`🗑️ Product permanently deleted by vendor: ${product.name} (ID: ${productId})`);

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Product deleted permanently'
    });
  } catch (error) {
    console.error('vendorProduct.remove error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Server error'
    });
  }
};

