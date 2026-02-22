import mongoose from 'mongoose';

const GiftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Gift card code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [8, 'Gift card code must be at least 8 characters'],
    maxlength: [20, 'Gift card code cannot exceed 20 characters']
  },
  initialBalance: {
    type: Number,
    required: [true, 'Initial balance is required'],
    min: [0, 'Initial balance cannot be negative']
  },
  currentBalance: {
    type: Number,
    required: [true, 'Current balance is required'],
    min: [0, 'Current balance cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'CAD', 'EUR', 'GBP']
  },
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means gift card can be used by anyone
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Admin user who issued the card
  },
  recipientEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: null
  },
  recipientName: {
    type: String,
    default: null
  },
  message: {
    type: String,
    maxlength: 500,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null // null means no expiry
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isRedeemed: {
    type: Boolean,
    default: false
  },
  usageHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    amount: {
      type: Number,
      required: true
    },
    balanceBefore: Number,
    balanceAfter: Number,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Note: code field already has unique: true which creates an index automatically
// Only add additional compound indexes
GiftCardSchema.index({ isActive: 1, expiryDate: 1 });
GiftCardSchema.index({ issuedTo: 1 });
GiftCardSchema.index({ recipientEmail: 1 });

GiftCardSchema.virtual('isValid').get(function() {
  const now = new Date();
  const isActiveStatus = this.isActive;
  const hasBalance = this.currentBalance > 0;
  const isNotExpired = !this.expiryDate || this.expiryDate >= now;
  const isNotFullyRedeemed = !this.isRedeemed;
  
  return isActiveStatus && hasBalance && isNotExpired && isNotFullyRedeemed;
});

GiftCardSchema.methods.canUse = function(userId = null, email = null) {
  if (!this.isValid) return false;
  
  // If issued to specific user, only that user can use it
  if (this.issuedTo) {
    return userId && this.issuedTo.toString() === userId.toString();
  }
  
  // If recipient email is set, check email match
  if (this.recipientEmail && email) {
    return this.recipientEmail.toLowerCase() === email.toLowerCase();
  }
  
  // Otherwise, anyone can use it
  return true;
};

GiftCardSchema.methods.applyBalance = async function(amount, orderId) {
  if (amount > this.currentBalance) {
    throw new Error('Insufficient gift card balance');
  }
  
  const balanceBefore = this.currentBalance;
  this.currentBalance = Math.max(0, this.currentBalance - amount);
  
  // Mark as redeemed if balance is 0
  if (this.currentBalance <= 0) {
    this.isRedeemed = true;
  }
  
  // Record usage
  this.usageHistory.push({
    orderId,
    amount,
    balanceBefore,
    balanceAfter: this.currentBalance,
    usedAt: new Date()
  });
  
  await this.save();
  
  return {
    amountApplied: amount,
    remainingBalance: this.currentBalance
  };
};

GiftCardSchema.methods.addBalance = async function(amount, reason = 'Balance added') {
  this.currentBalance += amount;
  this.isRedeemed = false; // Reactivate if it was redeemed
  
  this.usageHistory.push({
    orderId: null,
    amount: amount,
    balanceBefore: this.currentBalance - amount,
    balanceAfter: this.currentBalance,
    usedAt: new Date(),
    reason
  });
  
  await this.save();
};

// Generate unique gift card code
GiftCardSchema.statics.generateCode = async function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Keep generating until we get a unique code
  while (!isUnique && attempts < maxAttempts) {
    code = '';
    // Generate 12-character code
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existing = await this.findOne({ code: code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique gift card code');
  }
  
  // Format as XXXX-XXXX-XXXX
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}`;
};

const GiftCardModel = mongoose.model('GiftCard', GiftCardSchema);

export default GiftCardModel;

