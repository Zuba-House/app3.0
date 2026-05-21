import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    platform: { type: String, default: 'unknown' },
    properties: mongoose.Schema.Types.Mixed,
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.AnalyticsEvent ||
  mongoose.model('AnalyticsEvent', analyticsEventSchema);
