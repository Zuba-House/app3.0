# Vendor Controller Implementation Examples

## 📋 Overview

This document provides example implementations for vendor controllers. These are **additive** and won't break existing functionality.

---

## 1. Vendor Profile Controller

### `server/controllers/vendor.controller.js`

```javascript
import VendorModel from '../models/vendor.model.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import OrderModel from '../models/order.model.js';

/**
 * GET /api/vendor/me
 * Get vendor's own profile
 */
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await VendorModel.findById(req.vendorId)
      .populate('ownerUser', 'name email')
      .lean();

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
      vendor
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/vendor/me
 * Update vendor profile
 */
export const updateVendorProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent changing critical fields
    delete updates.ownerUser;
    delete updates.status;
    delete updates.totalSales;
    delete updates.totalEarnings;
    delete updates.availableBalance;
    delete updates.pendingBalance;

    // Validate store slug if provided
    if (updates.storeSlug) {
      const existing = await VendorModel.findOne({
        storeSlug: updates.storeSlug,
        _id: { $ne: req.vendorId }
      });
      
      if (existing) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'Store slug already taken'
        });
      }
    }

    const vendor = await VendorModel.findByIdAndUpdate(
      req.vendorId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Profile updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/vendor/dashboard
 * Get vendor dashboard stats
 */
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get vendor
    const vendor = await VendorModel.findById(vendorId);

    // Product stats
    const totalProducts = await ProductModel.countDocuments({ vendorId });
    const publishedProducts = await ProductModel.countDocuments({
      vendorId,
      status: 'published',
      approvalStatus: 'APPROVED'
    });

    // Order stats (today)
    const todayOrders = await OrderModel.find({
      'products.vendorId': vendorId,
      createdAt: { $gte: todayStart }
    });

    const todaySales = todayOrders.reduce((sum, order) => {
      const vendorItems = order.products.filter(
        item => item.vendorId?.toString() === vendorId.toString()
      );
      return sum + vendorItems.reduce((s, item) => s + (item.subTotal || 0), 0);
    }, 0);

    // This month orders
    const monthOrders = await OrderModel.find({
      'products.vendorId': vendorId,
      createdAt: { $gte: thisMonthStart }
    });

    const monthRevenue = monthOrders.reduce((sum, order) => {
      const vendorItems = order.products.filter(
        item => item.vendorId?.toString() === vendorId.toString()
      );
      return sum + vendorItems.reduce((s, item) => s + (item.vendorEarning || 0), 0);
    }, 0);

    // Order status breakdown
    const orderStatusCounts = {
      RECEIVED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0
    };

    const allVendorOrders = await OrderModel.find({
      'products.vendorId': vendorId
    });

    allVendorOrders.forEach(order => {
      const vendorItems = order.products.filter(
        item => item.vendorId?.toString() === vendorId.toString()
      );
      vendorItems.forEach(item => {
        if (orderStatusCounts[item.vendorStatus]) {
          orderStatusCounts[item.vendorStatus]++;
        }
      });
    });

    return res.status(200).json({
      error: false,
      success: true,
      dashboard: {
        vendor: {
          storeName: vendor.storeName,
          status: vendor.status,
          isVerified: vendor.isVerified
        },
        stats: {
          totalProducts,
          publishedProducts,
          todayOrders: todayOrders.length,
          todaySales,
          monthRevenue,
          orderStatusCounts
        },
        earnings: {
          totalEarnings: vendor.totalEarnings,
          availableBalance: vendor.availableBalance,
          pendingBalance: vendor.pendingBalance,
          withdrawnAmount: vendor.withdrawnAmount
        }
      }
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/vendor/apply
 * Public endpoint - Apply to become vendor
 */
export const applyToBecomeVendor = async (req, res) => {
  try {
    const {
      storeName,
      storeSlug,
      description,
      email,
      phone,
      country,
      city,
      addressLine1,
      categories
    } = req.body;

    // Validate required fields
    if (!storeName || !storeSlug || !email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Store name, slug, and email are required'
      });
    }

    // Check if slug is available
    const existingSlug = await VendorModel.findOne({ storeSlug });
    if (existingSlug) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Store slug already taken'
      });
    }

    // Get or create user
    let user = await UserModel.findOne({ email });
    if (!user) {
      // Create user account
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(req.body.password || 'temp123', 10);
      
      user = await UserModel.create({
        name: req.body.name || storeName,
        email,
        password: hashedPassword,
        role: 'VENDOR',
        status: 'Active',
        verify_email: false
      });
    } else {
      // Check if user already has vendor account
      if (user.vendorId) {
        return res.status(400).json({
          error: true,
          success: false,
          message: 'User already has a vendor account'
        });
      }
    }

    // Create vendor
    const vendor = await VendorModel.create({
      ownerUser: user._id,
      storeName,
      storeSlug: storeSlug.toLowerCase().trim(),
      description,
      email,
      phone,
      country,
      city,
      addressLine1,
      categories: categories || [],
      status: 'PENDING'
    });

    // Link vendor to user
    user.vendorId = vendor._id;
    user.role = 'VENDOR';
    await user.save();

    // TODO: Send email to admin for approval

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Vendor application submitted successfully',
      vendor: {
        _id: vendor._id,
        storeName: vendor.storeName,
        status: vendor.status
      }
    });
  } catch (error) {
    console.error('Apply to become vendor error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};
```

---

## 2. Vendor Product Controller

### `server/controllers/vendorProduct.controller.js`

```javascript
import ProductModel from '../models/product.model.js';
import VendorModel from '../models/vendor.model.js';

/**
 * GET /api/vendor/products
 * Get vendor's products (scoped)
 */
export const getVendorProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      approvalStatus,
      search,
      category
    } = req.query;

    const query = { vendorId: req.vendorId };

    // Filters
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await ProductModel.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(query);

    return res.status(200).json({
      error: false,
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/vendor/products
 * Create product (auto-assign vendor)
 */
export const createVendorProduct = async (req, res) => {
  try {
    const vendor = await VendorModel.findById(req.vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Vendor not found'
      });
    }

    // Prepare product data
    const productData = {
      ...req.body,
      vendorId: req.vendorId,
      vendorShopName: vendor.storeName,
      productOwnerType: 'VENDOR',
      approvalStatus: 'PENDING_REVIEW', // Or 'APPROVED' if auto-approve
      // Auto-assign seller info
      seller: {
        sellerId: vendor.ownerUser,
        sellerName: vendor.storeName,
        sellerRating: vendor.stats?.averageRating || 0,
        commissionRate: vendor.commissionValue / 100,
        commissionType: vendor.commissionType === 'PERCENT' ? 'percentage' : 'fixed'
      }
    };

    const product = await ProductModel.create(productData);

    // Update vendor stats
    vendor.stats.totalProducts += 1;
    await vendor.save();

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create vendor product error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/vendor/products/:id
 * Update product (scoped to vendor)
 */
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      vendorId: req.vendorId
    });

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Prevent changing critical fields
    const updates = { ...req.body };
    delete updates.vendorId;
    delete updates.productOwnerType;
    delete updates.ownerUser;

    // If updating, may need re-approval
    if (updates.name || updates.description || updates.pricing) {
      updates.approvalStatus = 'PENDING_REVIEW';
    }

    Object.assign(product, updates);
    await product.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update vendor product error:', error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message
    });
  }
};
```

---

## 3. Order Creation Enhancement

### Update `server/controllers/order.controller.js`

Add this function to calculate vendor splits:

```javascript
/**
 * Calculate vendor splits for order
 * Called after order creation
 */
const calculateVendorSplits = async (order) => {
  try {
    const vendorMap = new Map();

    // Group items by vendor
    for (const item of order.products) {
      const product = await ProductModel.findById(item.productId);
      if (!product || !product.vendorId) continue;

      const vendorId = product.vendorId.toString();
      
      if (!vendorMap.has(vendorId)) {
        const vendor = await VendorModel.findById(vendorId);
        vendorMap.set(vendorId, {
          vendor,
          items: [],
          grossAmount: 0,
          commissionAmount: 0,
          netEarning: 0
        });
      }

      const vendorData = vendorMap.get(vendorId);
      const subtotal = item.subTotal || (item.price * item.quantity);
      
      // Calculate commission
      const commissionType = vendor.vendor.commissionType || 'PERCENT';
      const commissionValue = vendor.vendor.commissionValue || 15;
      
      let commissionAmount = 0;
      if (commissionType === 'PERCENT') {
        commissionAmount = (subtotal * commissionValue) / 100;
      } else {
        commissionAmount = commissionValue * item.quantity;
      }

      const vendorEarning = subtotal - commissionAmount;

      // Update item with vendor data
      item.vendorId = vendorId;
      item.vendorShopName = vendor.storeName;
      item.commissionType = commissionType;
      item.commissionValue = commissionValue;
      item.commissionAmount = commissionAmount;
      item.vendorEarning = vendorEarning;
      item.unitPrice = item.price;
      item.vendorStatus = 'RECEIVED';

      vendorData.items.push(item);
      vendorData.grossAmount += subtotal;
      vendorData.commissionAmount += commissionAmount;
      vendorData.netEarning += vendorEarning;
    }

    // Create vendor summary
    order.vendorSummary = Array.from(vendorMap.values()).map(data => ({
      vendor: data.vendor._id,
      vendorShopName: data.vendor.storeName,
      grossAmount: data.grossAmount,
      commissionAmount: data.commissionAmount,
      netEarning: data.netEarning,
      payoutStatus: 'PENDING',
      itemsCount: data.items.length
    }));

    await order.save();

    // Update vendor balances (only if payment confirmed)
    if (order.payment_status === 'PAID' || order.payment_status === 'paid') {
      for (const [vendorId, data] of vendorMap.entries()) {
        const vendor = data.vendor;
        vendor.totalSales += data.grossAmount;
        vendor.totalEarnings += data.netEarning;
        vendor.pendingBalance += data.netEarning; // Or availableBalance if no hold period
        await vendor.save();
      }
    }

    return order.vendorSummary;
  } catch (error) {
    console.error('Calculate vendor splits error:', error);
    // Don't fail order creation if vendor split fails
    return [];
  }
};

// In createOrderController, after order.save():
// Calculate vendor splits
if (order.products && order.products.length > 0) {
  await calculateVendorSplits(order);
}
```

---

## 4. Vendor Routes

### `server/route/vendor.route.js`

```javascript
import { Router } from 'express';
import { requireVendor } from '../middlewares/vendorAuth.js';
import * as vendorController from '../controllers/vendor.controller.js';
import * as vendorProductController from '../controllers/vendorProduct.controller.js';
import * as vendorOrderController from '../controllers/vendorOrder.controller.js';
import * as vendorFinanceController from '../controllers/vendorFinance.controller.js';

const router = Router();

// Public routes
router.post('/apply', vendorController.applyToBecomeVendor);
router.get('/application-status', vendorController.getApplicationStatus);

// Protected routes (require vendor)
router.use(requireVendor);

// Profile
router.get('/me', vendorController.getVendorProfile);
router.put('/me', vendorController.updateVendorProfile);
router.get('/dashboard', vendorController.getVendorDashboard);

// Products
router.get('/products', vendorProductController.getVendorProducts);
router.post('/products', vendorProductController.createVendorProduct);
router.get('/products/:id', vendorProductController.getVendorProduct);
router.put('/products/:id', vendorProductController.updateVendorProduct);
router.delete('/products/:id', vendorProductController.deleteVendorProduct);

// Orders
router.get('/orders', vendorOrderController.getVendorOrders);
router.get('/orders/:id', vendorOrderController.getVendorOrderDetail);
router.put('/orders/:id/status', vendorOrderController.updateVendorOrderStatus);
router.put('/orders/:id/tracking', vendorOrderController.addTrackingNumber);

// Finance
router.get('/finance/summary', vendorFinanceController.getVendorFinanceSummary);
router.get('/payouts', vendorFinanceController.getVendorPayouts);
router.post('/payouts/request', vendorFinanceController.requestPayout);

export default router;
```

### Mount in `server/index.js`:

```javascript
import vendorRoutes from './route/vendor.route.js';

app.use('/api/vendor', vendorRoutes);
```

---

## 📝 Notes

1. All controllers are **scoped** to the vendor making the request
2. Vendor can only see/edit their own data
3. Product creation auto-assigns vendor
4. Order splits are calculated automatically
5. All changes are **additive** and won't break existing functionality

---

**Status**: Example implementations provided ✅
**Next**: Implement full controllers following these patterns

