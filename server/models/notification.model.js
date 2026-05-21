import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    title: String,
    message: String,
    orderId: mongoose.Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
