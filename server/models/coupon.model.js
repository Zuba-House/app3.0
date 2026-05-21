import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, default: 'percentage' },
    discountAmount: Number,
    minimumAmount: { type: Number, default: 0 },
    maximumAmount: Number,
    usageLimit: Number,
    usageLimitPerUser: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    freeShipping: { type: Boolean, default: false },
    excludeSaleItems: { type: Boolean, default: false },
    individualUse: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    allowedChannels: {
      type: [String],
      default: ['web', 'mobile'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
