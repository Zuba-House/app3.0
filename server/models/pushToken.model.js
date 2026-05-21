import mongoose from 'mongoose';

const pushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: { type: String, required: true, unique: true },
    platform: {
      type: String,
      enum: ['ios', 'android', 'unknown'],
      default: 'unknown',
    },
    deviceName: String,
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PushToken ||
  mongoose.model('PushToken', pushTokenSchema);
