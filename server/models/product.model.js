import mongoose from 'mongoose';

// ============================================
// SUB-SCHEMAS
// ============================================

// Image Schema with SEO
const ImageSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true,
    trim: true
  },
  alt: { 
    type: String, 
    default: '' 
  },
  title: { 
    type: String, 
    default: '' 
  },
  thumbnail: String,
  position: { 
    type: Number, 
    default: 0 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  }
}, { _id: true });

// Product Attribute Schema (for variable products)
const ProductAttributeSchema = new mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attribute',
    required: false // Made optional to support simple attribute structure
  },
  name: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true 
  },
  values: [{
    valueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeValue',
      required: false // Made optional to support simple attribute structure
    },
    label: { 
      type: String, 
      required: true 
    },
    slug: String
  }],
  visible: { 
    type: Boolean, 
    default: true 
  },
  variation: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

// Variation Schema (SKU-level product)
const VariationSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    uppercase: true
  },
  barcode: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  attributes: [{
    name: String,
    slug: String,
    value: String,
    valueSlug: String
  }],
  regularPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    default: null,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  saleStartDate: {
    type: Date,
    default: null
  },
  saleEndDate: {
    type: Date,
    default: null
  },
  stock: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'on_backorder'],
    default: 'in_stock'
  },
  manageStock: {
    type: Boolean,
    default: true
  },
  allowBackorders: {
    type: Boolean,
    default: false
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  endlessStock: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: null,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },
  dimensions: {
    length: { type: Number, min: 0, default: null },
    width: { type: Number, min: 0, default: null },
    height: { type: Number, min: 0, default: null },
    unit: { 
      type: String, 
      enum: ['cm', 'in', 'm'], 
      default: 'cm' 
    }
  },
  image: String, // Legacy field - kept for backward compatibility
  images: [String], // Array of image URLs for this variation
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: true, timestamps: true });

// Pricing Schema (for simple products)
const PricingSchema = new mongoose.Schema({
  regularPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    default: null,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'USD',
    uppercase: true
  },
  onSale: { 
    type: Boolean, 
    default: false 
  },
  saleStartDate: {
    type: Date,
    default: null
  },
  saleEndDate: {
    type: Date,
    default: null
  },
  taxStatus: { 
    type: String, 
    enum: ['taxable', 'shipping', 'none'], 
    default: 'taxable' 
  },
  taxClass: {
    type: String,
    default: 'standard'
  }
}, { _id: false });

// Inventory Schema (for simple products)
const InventorySchema = new mongoose.Schema({
  manageStock: { 
    type: Boolean, 
    default: true 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: 0
  },
  stockStatus: { 
    type: String, 
    enum: ['in_stock', 'out_of_stock', 'on_backorder'], 
    default: 'in_stock' 
  },
  allowBackorders: { 
    type: String, 
    enum: ['no', 'notify', 'yes'], 
    default: 'no' 
  },
  lowStockThreshold: { 
    type: Number, 
    default: 5,
    min: 0
  },
  soldIndividually: { 
    type: Boolean, 
    default: false 
  },
  endlessStock: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Shipping Schema
const ShippingSchema = new mongoose.Schema({
  required: {
    type: Boolean,
    default: true
  },
  weight: {
    type: Number,
    default: null,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { 
      type: String, 
      enum: ['cm', 'in', 'm'], 
      default: 'cm' 
    }
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'international', 'free'],
    default: 'standard'
  },
  freeShipping: { 
    type: Boolean, 
    default: false 
  },
  restrictedCountries: [String],
  restrictedRegions: [String]
}, { _id: false });

// SEO Schema
const SEOSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    maxlength: 60,
    default: ''
  },
  metaDescription: {
    type: String,
    maxlength: 160,
    default: ''
  },
  metaKeywords: [String],
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  canonicalUrl: String,
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { _id: false });

// Seller/Vendor Schema
const SellerSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sellerName: {
    type: String,
    default: ''
  },
  sellerRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  commissionRate: {
    type: Number,
    default: 0.12,
    min: 0,
    max: 1
  },
  commissionType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  }
}, { _id: false });

// ============================================
// MAIN PRODUCT SCHEMA
// ============================================

const ProductSchema = new mongoose.Schema({
  // ========== BASIC INFORMATION ==========
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  shortDescription: {
    type: String,
    maxlength: 500,
    default: ''
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required']
  },
  
  // ========== IDENTIFICATION ==========
  sku: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  brand: { 
    type: String, 
    default: '',
    trim: true
  },
  
  // ========== PRODUCT TYPE ==========
  productType: { 
    type: String, 
    enum: ['simple', 'variable', 'grouped', 'external'],
    default: 'simple',
    required: true
  },
  
  // ========== CATEGORIZATION ==========
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  categories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category'
  }],
  // Legacy support
  catName: { type: String, default: '' },
  subCat: { type: String, default: '' },
  subCatId: { type: String, default: '' },
  thirdsubCat: { type: String, default: '' },
  thirdsubCatId: { type: String, default: '' },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // ========== SELLER/VENDOR INFORMATION ==========
  seller: SellerSchema,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  vendorShopName: {
    type: String,
    default: '',
    index: true
  },
  // NEW: Product ownership type
  productOwnerType: {
    type: String,
    enum: ['PLATFORM', 'VENDOR'],
    default: 'PLATFORM',
    index: true
  },
  // NEW: Product approval status (for vendor products)
  approvalStatus: {
    type: String,
    enum: ['APPROVED', 'PENDING_REVIEW', 'REJECTED'],
    default: 'APPROVED',
    index: true
  },
  // NEW: Per-product commission override (optional)
  commissionOverride: {
    type: Boolean,
    default: false
  },
  commissionType: {
    type: String,
    enum: ['PERCENT', 'FLAT'],
    default: 'PERCENT'
  },
  commissionValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // ========== PRICING (Simple Products) ==========
  pricing: PricingSchema,
  
  // ========== INVENTORY (Simple Products) ==========
  inventory: InventorySchema,
  
  // ========== SHIPPING ==========
  shipping: ShippingSchema,
  
  // ========== IMAGES ==========
  images: {
    type: [ImageSchema],
    default: []
  },
  featuredImage: {
    type: String,
    default: ''
  },
  // Legacy support
  bannerimages: [String],
  bannerTitleName: { type: String, default: '' },
  isDisplayOnHomeBanner: { type: Boolean, default: false },
  // Banner customization fields
  bannerLink: { type: String, default: '' },
  bannerButtonLink: { type: String, default: '' },
  bannerButtonText: { type: String, default: 'SHOP NOW' },
  
  // ========== ATTRIBUTES & VARIATIONS ==========
  attributes: {
    type: [ProductAttributeSchema],
    default: []
  },
  variations: {
    type: [VariationSchema],
    default: []
  },
  defaultAttributes: [{
    name: String,
    slug: String,
    value: String
  }],
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  
  // ========== GROUPED PRODUCTS ==========
  groupedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  
  // ========== EXTERNAL PRODUCT ==========
  externalUrl: String,
  buttonText: {
    type: String,
    default: 'Buy Now'
  },
  
  // ========== PRODUCT RELATIONSHIPS ==========
  relatedProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  upsellProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  crossSellProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  
  // ========== RATINGS & REVIEWS ==========
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  ratingSummary: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  
  // ========== SALES DATA ==========
  totalSales: { 
    type: Number, 
    default: 0,
    min: 0
  },
  views: { 
    type: Number, 
    default: 0,
    min: 0
  },
  wishlistCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // ========== STATUS & VISIBILITY ==========
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  visibility: { 
    type: String, 
    enum: ['visible', 'catalog', 'search', 'hidden'], 
    default: 'visible' 
  },
  isFeatured: { 
    type: Boolean, 
    default: false
  },
  
  // ========== SEO ==========
  seo: SEOSchema,
  
  // ========== ADDITIONAL ==========
  originCountry: String,
  material: String,
  careInstructions: String,
  certifications: [String],
  isHandmade: {
    type: Boolean,
    default: false
  },
  customFields: [{
    key: String,
    value: mongoose.Schema.Types.Mixed
  }],
  adminNotes: String,
  purchaseNote: String,
  
  // ========== LEGACY FIELDS (Backward Compatibility) ==========
  price: { type: Number, default: 0 },
  oldPrice: { type: Number, default: 0 },
  discount: Number,
  sale: { type: Number, default: 0 },
  countInStock: Number,
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'INR', 'EUR']
  },
  productRam: [String],
  size: [String],
  productWeight: [String]
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  shortDescription: 'text',
  tags: 'text'
});

// Note: sku and seo.slug indexes are automatically created by their unique: true field definitions
// ProductSchema.index({ sku: 1 }, { unique: true, sparse: true }); // Already created by field definition
// ProductSchema.index({ 'seo.slug': 1 }, { unique: true, sparse: true }); // Already created by field definition
ProductSchema.index({ status: 1, visibility: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ categories: 1, status: 1 });
ProductSchema.index({ brand: 1, status: 1 });
ProductSchema.index({ 'seller.sellerId': 1, status: 1 });
ProductSchema.index({ productType: 1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ 'pricing.price': 1 });
ProductSchema.index({ 'ratingSummary.average': -1 });
ProductSchema.index({ totalSales: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ tags: 1 });
// Note: variations.sku index is automatically created by the unique: true in VariationSchema
// ProductSchema.index({ 'variations.sku': 1 }, { sparse: true }); // Already created by field definition

// ============================================
// VIRTUALS
// ============================================

ProductSchema.virtual('isOnSale').get(function() {
  if (this.productType === 'simple' && this.pricing) {
    const now = new Date();
    const saleActive = 
      this.pricing.salePrice !== null &&
      this.pricing.salePrice < this.pricing.regularPrice &&
      (!this.pricing.saleStartDate || this.pricing.saleStartDate <= now) &&
      (!this.pricing.saleEndDate || this.pricing.saleEndDate >= now);
    return saleActive;
  }
  if (this.productType === 'variable' && this.variations) {
    return this.variations.some(v => {
      const now = new Date();
      return v.salePrice !== null &&
             v.salePrice < v.regularPrice &&
             (!v.saleStartDate || v.saleStartDate <= now) &&
             (!v.saleEndDate || v.saleEndDate >= now);
    });
  }
  return false;
});

ProductSchema.virtual('discountPercentage').get(function() {
  if (this.productType === 'simple' && this.isOnSale && this.pricing) {
    const regular = this.pricing.regularPrice;
    const sale = this.pricing.salePrice;
    return Math.round(((regular - sale) / regular) * 100);
  }
  return 0;
});

ProductSchema.virtual('inStock').get(function() {
  if (this.productType === 'simple' && this.inventory) {
    return this.inventory.stockStatus === 'in_stock' && this.inventory.stock > 0;
  }
  if (this.productType === 'variable' && this.variations) {
    return this.variations.some(v => 
      v.isActive && v.stockStatus === 'in_stock' && v.stock > 0
    );
  }
  return false;
});

// ============================================
// METHODS
// ============================================

ProductSchema.methods.updateRatingSummary = async function(reviews) {
  if (!reviews || reviews.length === 0) {
    this.ratingSummary = {
      average: 0,
      count: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
    this.rating = 0;
    this.reviewsCount = 0;
    await this.save();
    return;
  }
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  
  reviews.forEach(review => {
    if (review.status === 'approved') {
      sum += review.rating;
      distribution[review.rating]++;
    }
  });
  
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  
  this.ratingSummary = {
    average: approvedCount > 0 ? parseFloat((sum / approvedCount).toFixed(2)) : 0,
    count: approvedCount,
    distribution
  };
  this.rating = this.ratingSummary.average;
  this.reviewsCount = approvedCount;
  
  await this.save();
};

ProductSchema.methods.findVariation = function(attributes) {
  if (this.productType !== 'variable' || !this.variations) return null;
  
  return this.variations.find(variation => {
    return attributes.every(attr => {
      return variation.attributes.some(va => 
        va.slug === attr.slug && va.valueSlug === attr.valueSlug
      );
    });
  });
};

ProductSchema.methods.reduceStock = async function(quantity, variationId = null) {
  if (this.productType === 'simple' && this.inventory) {
    if (this.inventory.manageStock) {
      this.inventory.stock = Math.max(0, this.inventory.stock - quantity);
      if (this.inventory.stock === 0) {
        this.inventory.stockStatus = 'out_of_stock';
      }
    }
  } else if (this.productType === 'variable' && variationId) {
    const variation = this.variations.id(variationId);
    if (variation && variation.manageStock) {
      variation.stock = Math.max(0, variation.stock - quantity);
      if (variation.stock === 0) {
        variation.stockStatus = 'out_of_stock';
      }
    }
  }
  
  this.totalSales += quantity;
  await this.save();
};

ProductSchema.methods.restoreStock = async function(quantity, variationId = null) {
  if (this.productType === 'simple' && this.inventory) {
    if (this.inventory.manageStock) {
      this.inventory.stock += quantity;
      this.inventory.stockStatus = 'in_stock';
    }
  } else if (this.productType === 'variable' && variationId) {
    const variation = this.variations.id(variationId);
    if (variation && variation.manageStock) {
      variation.stock += quantity;
      variation.stockStatus = 'in_stock';
    }
  }
  
  this.totalSales = Math.max(0, this.totalSales - quantity);
  await this.save();
};

ProductSchema.methods.calculatePriceRange = function() {
  if (this.productType !== 'variable' || !this.variations || this.variations.length === 0) {
    return;
  }
  
  // Get valid prices from active variations (filter out 0, null, undefined)
  const prices = this.variations
    .filter(v => v.isActive && v.price && v.price > 0)
    .map(v => Number(v.price))
    .filter(price => !isNaN(price) && price > 0);
  
  if (prices.length > 0) {
    this.priceRange.min = Math.min(...prices);
    this.priceRange.max = Math.max(...prices);
    // Also update the product price to the minimum variation price for display
    this.price = this.priceRange.min;
  } else {
    // If no valid prices, set to null or keep existing price
    this.priceRange.min = null;
    this.priceRange.max = null;
  }
};

// ============================================
// MIDDLEWARE
// ============================================

ProductSchema.pre('save', function(next) {
  // Generate slug if not exists
  if (this.isModified('name') && (!this.seo || !this.seo.slug)) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (!this.seo) this.seo = {};
    this.seo.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
  }
  
  // Set featured image
  if (this.images && this.images.length > 0 && !this.featuredImage) {
    const featured = this.images.find(img => img.isFeatured);
    this.featuredImage = featured ? featured.url : this.images[0].url;
  }
  
  // Backward compatibility: Map legacy fields to new structure
  if (this.isNew || this.isModified('price') || this.isModified('oldPrice')) {
    if (!this.pricing) {
      this.pricing = {
        regularPrice: this.oldPrice || this.price || 0,
        salePrice: this.oldPrice && this.price < this.oldPrice ? this.price : null,
        price: this.price || this.oldPrice || 0,
        currency: this.currency || 'USD',
        onSale: this.oldPrice && this.price < this.oldPrice
      };
    }
  }
  
  if (this.isNew || this.isModified('countInStock')) {
    if (!this.inventory && this.countInStock !== undefined) {
      this.inventory = {
        stock: this.countInStock || 0,
        stockStatus: (this.countInStock || 0) > 0 ? 'in_stock' : 'out_of_stock',
        manageStock: true
      };
    }
  }
  
  // Calculate current price for simple products
  if (this.productType === 'simple' && this.pricing) {
    const now = new Date();
    const saleActive = 
      this.pricing.salePrice !== null &&
      this.pricing.salePrice < this.pricing.regularPrice &&
      (!this.pricing.saleStartDate || this.pricing.saleStartDate <= now) &&
      (!this.pricing.saleEndDate || this.pricing.saleEndDate >= now);
    
    this.pricing.price = saleActive ? this.pricing.salePrice : this.pricing.regularPrice;
    this.pricing.onSale = saleActive;
    
    // Update legacy price field for backward compatibility
    this.price = this.pricing.price;
    this.oldPrice = this.pricing.regularPrice;
  }
  
  // Calculate variation prices
  if (this.productType === 'variable' && this.variations) {
    this.variations.forEach(variation => {
      const now = new Date();
      const saleActive = 
        variation.salePrice !== null &&
        variation.salePrice < variation.regularPrice &&
        (!variation.saleStartDate || variation.saleStartDate <= now) &&
        (!variation.saleEndDate || variation.saleEndDate >= now);
      
      variation.price = saleActive ? variation.salePrice : variation.regularPrice;
      
      if (variation.manageStock) {
        if (variation.stock === 0 && !variation.allowBackorders) {
          variation.stockStatus = 'out_of_stock';
        } else if (variation.stock > 0) {
          variation.stockStatus = 'in_stock';
        } else if (variation.allowBackorders) {
          variation.stockStatus = 'on_backorder';
        }
      }
    });
    
    this.calculatePriceRange();
  }
  
  // Set categories array from category if empty
  if (this.category && (!this.categories || this.categories.length === 0)) {
    this.categories = [this.category];
  }
  
  // Auto-publish if status changed to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

ProductSchema.pre('save', function(next) {
  if (this.productType === 'variable') {
    if (!this.variations || this.variations.length === 0) {
      return next(new Error('Variable products must have at least one variation'));
    }
    
    const skus = this.variations
      .filter(v => v.sku)
      .map(v => v.sku);
    
    const duplicates = skus.filter((sku, index) => skus.indexOf(sku) !== index);
    if (duplicates.length > 0) {
      return next(new Error(`Duplicate SKUs found in variations: ${duplicates.join(', ')}`));
    }
  }
  
  next();
});

const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;

