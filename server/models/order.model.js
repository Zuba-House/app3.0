import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    // Guest customer fields
    guestCustomer: {
        name: {
            type: String,
            required: function() { return !this.userId; }
        },
        email: {
            type: String,
            required: function() { return !this.userId; }
        },
        phone: {
            type: String,
            required: function() { return !this.userId; }
        }
    },
    isGuestOrder: {
        type: Boolean,
        default: false
    },
    products: [
        {
            productId: {
                type: String,
                required: true
            },
            productTitle: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                type: String
            },
            subTotal: {
                type: Number,
                required: true
            },
            // New variation fields
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
            // Old fields (backward compatibility)
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
            },
            countInStock: {
                type: Number
            },
            // Vendor information
            vendor: {
                type: mongoose.Schema.ObjectId,
                ref: 'Vendor',
                default: null
            },
            vendorId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Vendor',
                default: null
            },
            vendorShopName: {
                type: String,
                default: ''
            },
            // Vendor-specific order tracking
            vendorStatus: {
                type: String,
                enum: ['RECEIVED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
                default: 'RECEIVED'
            },
            trackingNumber: {
                type: String,
                default: ''
            },
            shippedAt: {
                type: Date,
                default: null
            },
            deliveredAt: {
                type: Date,
                default: null
            },
            // NEW: Commission and earnings per item
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
            commissionAmount: {
                type: Number,
                default: 0,
                min: 0
            },
            vendorEarning: {
                type: Number,
                default: 0,
                min: 0
            },
            unitPrice: {
                type: Number,
                default: null
            }
        }
    ],
    // Vendor information for multi-vendor orders
    vendors: [{
        vendorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Vendor'
        },
        vendorShopName: String,
        totalAmount: Number,
        commission: Number,
        vendorEarning: Number
    }],
    // NEW: Vendor summary for finance tracking
    vendorSummary: [{
        vendor: {
            type: mongoose.Schema.ObjectId,
            ref: 'Vendor',
            required: true
        },
        vendorShopName: {
            type: String,
            default: ''
        },
        grossAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        commissionAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        netEarning: {
            type: Number,
            default: 0,
            min: 0
        },
        payoutStatus: {
            type: String,
            enum: ['PENDING', 'ON_HOLD', 'PAID'],
            default: 'PENDING'
        },
        itemsCount: {
            type: Number,
            default: 0
        }
    }],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    order_status : {
        type : String,
        default : "confirm"
    },
    // Enhanced status tracking
    status: {
        type: String,
        enum: ['Received', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
        default: 'Received',
        required: true
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['Received', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    trackingNumber: {
        type: String,
        default: ''
    },
    estimatedDelivery: {
        type: Date,
        default: null
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    shippingRate: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Store shipping address directly in order (for admin visibility)
    shippingAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        province: String,
        provinceCode: String,
        postalCode: String,
        postal_code: String,
        country: String,
        countryCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    // Store phone number directly in order (for admin visibility)
    phone: {
        type: String,
        default: ''
    },
    // Customer name for delivery (required for accurate delivery)
    customerName: {
        type: String,
        default: ''
    },
    // Apartment/Office/Unit number for apartment or office buildings (optional)
    apartmentNumber: {
        type: String,
        default: ''
    },
    // Special delivery instructions from customer (optional)
    deliveryNote: {
        type: String,
        default: '',
        maxlength: 500
    },
    // Discount information
    discounts: {
        couponCode: {
            type: String,
            default: null
        },
        couponDiscount: {
            type: Number,
            default: 0
        },
        giftCardCode: {
            type: String,
            default: null
        },
        giftCardDiscount: {
            type: Number,
            default: 0
        },
        automaticDiscounts: [{
            type: {
                type: String,
                enum: ['cart_threshold', 'first_time_buyer', 'bulk_quantity', 'other']
            },
            name: String,
            discount: Number
        }],
        totalDiscount: {
            type: Number,
            default: 0
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        subtotal: {
            type: Number,
            default: 0
        },
        finalTotal: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel