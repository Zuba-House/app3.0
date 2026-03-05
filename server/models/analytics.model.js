/**
 * Analytics Model
 * Stores analytics events for tracking user behavior
 */

import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true,
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  platform: {
    type: String,
    default: 'unknown',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

const AnalyticsModel = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

export default AnalyticsModel;
