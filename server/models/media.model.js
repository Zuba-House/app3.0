import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
    // Cloudinary data
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    secureUrl: {
        type: String,
        required: true
    },
    
    // Image metadata
    filename: {
        type: String,
        default: ''
    },
    originalName: {
        type: String,
        default: ''
    },
    format: {
        type: String, // jpg, png, etc.
        default: ''
    },
    width: {
        type: Number,
        default: null
    },
    height: {
        type: Number,
        default: null
    },
    bytes: {
        type: Number, // File size in bytes
        default: null
    },
    
    // Usage tracking
    usageCount: {
        type: Number,
        default: 0
    },
    usedIn: [{
        type: {
            type: String, // 'product', 'category', 'banner', etc.
            enum: ['product', 'category', 'banner', 'blog', 'logo', 'user', 'other']
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'usedIn.resourceType'
        },
        resourceType: {
            type: String
        }
    }],
    
    // Organization
    folder: {
        type: String,
        default: 'media-library'
    },
    tags: [{
        type: String
    }],
    alt: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Upload info
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
// Note: publicId already has an index from unique: true, so we don't need to add it again
MediaSchema.index({ uploadedAt: -1 });
MediaSchema.index({ 'usedIn.type': 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isActive: 1 });

// Virtual for file size in human-readable format
MediaSchema.virtual('fileSizeFormatted').get(function() {
    if (!this.bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(this.bytes) / Math.log(1024)));
    return Math.round(this.bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment usage count
MediaSchema.methods.incrementUsage = function(resourceType, resourceId) {
    this.usageCount += 1;
    this.usedIn.push({
        type: resourceType,
        resourceId: resourceId,
        resourceType: this.getResourceModelName(resourceType)
    });
    return this.save();
};

// Method to decrement usage count
MediaSchema.methods.decrementUsage = function(resourceType, resourceId) {
    if (this.usageCount > 0) {
        this.usageCount -= 1;
    }
    this.usedIn = this.usedIn.filter(
        usage => !(usage.type === resourceType && usage.resourceId.toString() === resourceId.toString())
    );
    return this.save();
};

// Helper to get model name from resource type
MediaSchema.methods.getResourceModelName = function(resourceType) {
    const modelMap = {
        'product': 'Product',
        'category': 'Category',
        'banner': 'Banner',
        'blog': 'Blog',
        'logo': 'Logo',
        'user': 'User'
    };
    return modelMap[resourceType] || 'Other';
};

const Media = mongoose.model('Media', MediaSchema);

export default Media;

