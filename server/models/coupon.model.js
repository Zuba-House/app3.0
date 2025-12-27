import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [50, 'Coupon code cannot exceed 50 characters']
  },
  description: {
    type: String,
    default: ''
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_cart', 'fixed_product'],
    required: true
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount amount cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: [1, 'Usage limit per user must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumAmount: {
    type: Number,
    default: null
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProductIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedCategoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  allowedEmails: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  excludedEmails: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  individualUse: {
    type: Boolean,
    default: false
  },
  excludeSaleItems: {
    type: Boolean,
    default: false
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // NEW: Vendor-specific coupons
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  scope: {
    type: String,
    enum: ['GLOBAL', 'VENDOR'],
    default: 'GLOBAL',
    index: true
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    discountApplied: Number
  }]
}, { timestamps: true });

// Note: code field already has unique: true which creates an index automatically
// Only add additional compound indexes
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
CouponSchema.index({ 'usedBy.userId': 1 });

CouponSchema.virtual('isValid').get(function() {
  const now = new Date();
  const isActiveStatus = this.isActive;
  const isWithinDateRange = 
    (!this.startDate || this.startDate <= now) &&
    (!this.endDate || this.endDate >= now);
  const hasUsageLeft = 
    this.usageLimit === null || this.usageCount < this.usageLimit;
  
  return isActiveStatus && isWithinDateRange && hasUsageLeft;
});

CouponSchema.methods.canUseByUser = function(userId) {
  if (!this.isValid) return false;
  
  const userUsageCount = this.usedBy.filter(
    usage => usage.userId.toString() === userId.toString()
  ).length;
  
  return userUsageCount < this.usageLimitPerUser;
};

CouponSchema.methods.calculateDiscount = function(cartTotal, cartItems) {
  if (!this.isValid) return 0;
  
  if (cartTotal < this.minimumAmount) return 0;
  
  let applicableTotal = cartTotal;
  
  if (this.productIds.length > 0 || this.categoryIds.length > 0 || 
      this.excludedProductIds.length > 0 || this.excludedCategoryIds.length > 0) {
    
    applicableTotal = cartItems.reduce((sum, item) => {
      const isIncluded = 
        this.productIds.length === 0 || 
        this.productIds.some(id => id.toString() === item.productId.toString());
      
      const isExcluded = 
        this.excludedProductIds.some(id => id.toString() === item.productId.toString());
      
      const isSaleExcluded = this.excludeSaleItems && item.onSale;
      
      if (isIncluded && !isExcluded && !isSaleExcluded) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  }
  
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (applicableTotal * this.discountAmount) / 100;
      break;
    case 'fixed_cart':
      discount = this.discountAmount;
      break;
    case 'fixed_product':
      discount = cartItems.reduce((sum, item) => {
        return sum + (this.discountAmount * item.quantity);
      }, 0);
      break;
  }
  
  discount = Math.min(discount, applicableTotal);
  
  if (this.maximumAmount && discount > this.maximumAmount) {
    discount = this.maximumAmount;
  }
  
  return Math.round(discount * 100) / 100;
};

CouponSchema.methods.recordUsage = async function(userId, orderId, discountApplied) {
  this.usedBy.push({
    userId,
    orderId,
    usedAt: new Date(),
    discountApplied
  });
  this.usageCount += 1;
  await this.save();
};

const CouponModel = mongoose.model('Coupon', CouponSchema);

export default CouponModel;

