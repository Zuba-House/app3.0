import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        default: null
    },
    discount: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    subTotal: {
        type: Number,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0
    },
    userId: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: null
    },
    
    // ========================================
    // NEW VARIATION FIELDS
    // ========================================
    productType: {
        type: String,
        enum: ['simple', 'variable'],
        default: 'simple'
    },
    variationId: {
        type: String,
        default: null
    },
    variation: {
        attributes: [{
            name: String,
            value: String
        }],
        sku: String,
        image: String
    },
    
    // ========================================
    // OLD FIELDS - Keep for backward compatibility
    // ========================================
    size: {
        type: String,
        default: null
    },
    weight: {
        type: String,
        default: null
    },
    ram: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// ========================================
// INDEXES for better query performance
// ========================================
cartProductSchema.index({ userId: 1, productId: 1, variationId: 1 });
cartProductSchema.index({ userId: 1 });

// ========================================
// MIDDLEWARE - Validate and calculate
// ========================================
cartProductSchema.pre('save', function(next) {
    // Ensure quantity doesn't exceed stock
    if (this.quantity > this.countInStock) {
        return next(new Error(`Cannot add ${this.quantity} items. Only ${this.countInStock} in stock.`));
    }
    
    // Recalculate subtotal with proper decimal handling
    this.subTotal = parseFloat(this.price) * this.quantity;
    
    next();
});

const CartProductModel = mongoose.model('cart', cartProductSchema);

export default CartProductModel;
