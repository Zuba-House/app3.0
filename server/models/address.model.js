import mongoose from "mongoose";

/**
 * Advanced Address Schema - Compatible with Google Places & Stallion Express
 * Default Country: Canada
 * Supports both new and old address formats for backward compatibility
 */
const addressSchema = mongoose.Schema({
    // User reference
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Address Type (for backward compatibility)
    addressType: {
        type: String,
        enum: ["Home", "Office", "shipping", "billing", "both"],
        default: "Home"
    },

    // ========================================
    // NEW ADVANCED ADDRESS STRUCTURE
    // ========================================
    
    // Contact Information
    contactInfo: {
        firstName: {
            type: String,
            trim: true,
            maxlength: 50
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 50
        },
        phone: {
            type: String,
            validate: {
                validator: function(v) {
                    if (!v) return true; // Optional
                    return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/im.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
        }
    },

    // Standardized Address Fields (Google Places + Stallion format)
    address: {
        // Street address
        streetNumber: {
            type: String,
            trim: true
        },
        streetName: {
            type: String,
            trim: true
        },
        // Combined for display
        addressLine1: {
            type: String,
            trim: true,
            maxlength: 100
        },
        addressLine2: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ''
        },
        
        // City/Town
        city: {
            type: String,
            trim: true,
            maxlength: 50
        },
        
        // Province/State
        province: {
            type: String,
            trim: true,
            maxlength: 50
        },
        provinceCode: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: 3 // e.g., ON, BC, QC
        },
        
        // Country
        country: {
            type: String,
            default: 'Canada',
            trim: true
        },
        countryCode: {
            type: String,
            default: 'CA',
            uppercase: true,
            trim: true,
            maxlength: 2
        },
        
        // Postal Code / ZIP Code
        postalCode: {
            type: String,
            trim: true,
            uppercase: true,
            validate: {
                validator: function(v) {
                    if (!v) return true; // Optional for backward compatibility
                    // Canada: A1A 1A1 or A1A1A1
                    // USA: 12345 or 12345-6789
                    const canadaPostal = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
                    const usaZip = /^\d{5}(-\d{4})?$/;
                    return canadaPostal.test(v) || usaZip.test(v);
                },
                message: props => `${props.value} is not a valid postal/zip code!`
            }
        }
    },

    // Google Places Data
    googlePlaces: {
        placeId: {
            type: String,
            trim: true
        },
        formattedAddress: {
            type: String,
            trim: true
        },
        // Geocoding
        coordinates: {
            lat: {
                type: Number,
                min: -90,
                max: 90
            },
            lng: {
                type: Number,
                min: -180,
                max: 180
            }
        }
    },

    // Stallion Express Validation
    stallionValidation: {
        isValidated: {
            type: Boolean,
            default: false
        },
        validatedAt: {
            type: Date
        },
        validationResponse: {
            type: mongoose.Schema.Types.Mixed
        }
    },

    // User Preferences
    isDefault: {
        type: Boolean,
        default: false
    },
    
    // Metadata
    label: {
        type: String,
        trim: true,
        maxlength: 50,
        default: '' // e.g., "Home", "Office", "Mom's House"
    },
    
    notes: {
        type: String,
        trim: true,
        maxlength: 200,
        default: '' // e.g., "Ring the doorbell twice"
    },

    // ========================================
    // OLD FIELDS - Keep for backward compatibility
    // ========================================
    address_line1: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    pincode: {
        type: String
    },
    country: {
        type: String
    },
    mobile: {
        type: Number,
        default: null
    },
    landmark: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    selected: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, status: 1 });
addressSchema.index({ 'address.postalCode': 1 });
addressSchema.index({ 'googlePlaces.placeId': 1 });

// Virtual for full name
addressSchema.virtual('contactInfo.fullName').get(function() {
    if (this.contactInfo?.firstName && this.contactInfo?.lastName) {
        return `${this.contactInfo.firstName} ${this.contactInfo.lastName}`;
    }
    return '';
});

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
    // Use new format if available
    if (this.address?.addressLine1) {
        const addr = this.address;
        return `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.provinceCode} ${addr.postalCode}, ${addr.country}`;
    }
    // Fallback to old format
    if (this.address_line1) {
        return `${this.address_line1}, ${this.city}, ${this.state} ${this.pincode}, ${this.country}`;
    }
    return '';
});

// Middleware: Ensure only one default address per user
addressSchema.pre('save', async function(next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { 
                userId: this.userId, 
                _id: { $ne: this._id }
            },
            { isDefault: false }
        );
    }
    
    // Auto-populate old fields from new structure for backward compatibility
    if (this.address?.addressLine1 && !this.address_line1) {
        this.address_line1 = this.address.addressLine1;
    }
    if (this.address?.city && !this.city) {
        this.city = this.address.city;
    }
    if (this.address?.province && !this.state) {
        this.state = this.address.province;
    }
    if (this.address?.postalCode && !this.pincode) {
        this.pincode = this.address.postalCode;
    }
    if (this.address?.country && !this.country) {
        this.country = this.address.country;
    }
    if (this.contactInfo?.phone && !this.mobile) {
        // Extract numeric part from phone
        const numericPhone = this.contactInfo.phone.replace(/\D/g, '');
        if (numericPhone) {
            this.mobile = parseInt(numericPhone.substring(0, 15)); // Limit to 15 digits
        }
    }
    
    next();
});

// Static method: Get user's default address
addressSchema.statics.getDefaultAddress = function(userId) {
    return this.findOne({ 
        userId, 
        isDefault: true,
        status: true
    });
};

// Static method: Get all user addresses
addressSchema.statics.getUserAddresses = function(userId) {
    return this.find({ userId, status: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance method: Format for Stallion API
addressSchema.methods.toStallionFormat = function() {
    return {
        name: this.contactInfo?.fullName || `${this.contactInfo?.firstName || ''} ${this.contactInfo?.lastName || ''}`.trim(),
        phone: this.contactInfo?.phone || (this.mobile ? `+${this.mobile}` : ''),
        street: this.address?.addressLine1 || this.address_line1 || '',
        unit: this.address?.addressLine2 || this.landmark || '',
        city: this.address?.city || this.city || '',
        province: this.address?.provinceCode || this.state || '',
        postal_code: this.address?.postalCode || this.pincode || '',
        country: this.address?.countryCode || (this.country === 'Canada' ? 'CA' : 'US') || 'CA'
    };
};

// Instance method: Format for Google Places
addressSchema.methods.toGooglePlacesFormat = function() {
    return {
        place_id: this.googlePlaces?.placeId,
        formatted_address: this.googlePlaces?.formattedAddress || this.formattedAddress,
        geometry: {
            location: {
                lat: this.googlePlaces?.coordinates?.lat,
                lng: this.googlePlaces?.coordinates?.lng
            }
        }
    };
};

const AddressModel = mongoose.model('address', addressSchema);

export default AddressModel;
