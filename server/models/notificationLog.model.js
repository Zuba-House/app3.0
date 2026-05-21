import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, default: 'general' },
    audience: { type: String, default: 'all' },
    sentBy: String,
    sentAt: { type: Date, default: Date.now },
    recipientCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['sent', 'failed', 'queued', 'partial'],
      default: 'sent',
    },
    tickets: [{ type: Object }],
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.NotificationLog ||
  mongoose.model('NotificationLog', notificationLogSchema);
