import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, lowercase: true },
    password: String,
    role: { type: String, default: 'USER', enum: ['USER', 'ADMIN', 'VENDOR'] },
    status: { type: String, default: 'active' },
    avatar: String,
    mobile: String,
    vendorId: mongoose.Schema.Types.ObjectId,
    pushTokens: { type: [String], default: [] },
    refreshTokens: [String],
    lastActiveAt: { type: Date, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
