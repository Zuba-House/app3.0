import mongoose from 'mongoose';

/**
 * Banner Model
 * Stores banner information for desktop and mobile displays
 */
const bannerSchema = new mongoose.Schema({
  // Banner type: 'desktop' or 'mobile' (can have multiple of each)
  type: {
    type: String,
    required: true,
    enum: ['desktop', 'mobile']
    // Removed unique constraint to allow multiple banners
  },
  
  // Image details (stored in Cloudinary)
  imageUrl: {
    type: String,
    default: ''
  },
  
  // Cloudinary public_id for image management
  cloudinaryId: {
    type: String,
    default: ''
  },
  
  // Banner content
  title: {
    type: String,
    default: '',
    maxlength: 100
  },
  
  subtitle: {
    type: String,
    default: '',
    maxlength: 200
  },
  
  ctaText: {
    type: String,
    default: '',
    maxlength: 50
  },
  
  ctaLink: {
    type: String,
    default: '',
    maxlength: 200
  },
  
  // Banner status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Display order (for sorting multiple banners)
  order: {
    type: Number,
    default: 0
  },
  
  // Color customization
  backgroundColor: {
    type: String,
    default: ''
  },
  
  textColor: {
    type: String,
    default: ''
  },
  
  ctaColor: {
    type: String,
    default: ''
  },
  
  ctaTextColor: {
    type: String,
    default: ''
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bannerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better performance (NOT unique - allows multiple banners per type)
bannerSchema.index({ type: 1, isActive: 1 }, { unique: false });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
