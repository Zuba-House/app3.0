import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema(
  {
    vendor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor', 
      required: true,
      index: true
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    currency: { 
      type: String, 
      default: 'USD',
      enum: ['USD', 'CAD', 'EUR', 'GBP']
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'],
      default: 'REQUESTED',
      index: true
    },
    requestedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    // Payment method snapshot at time of request
    paymentMethodSnapshot: {
      payoutMethod: {
        type: String,
        enum: ['BANK_TRANSFER', 'PAYPAL', 'MOMO'],
        default: 'BANK_TRANSFER'
      },
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
      paypalEmail: String,
      momoNumber: String,
      momoProvider: String
    },
    // External transaction reference
    transactionRef: {
      type: String,
      default: ''
    },
    // Dates
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes
PayoutSchema.index({ vendor: 1, status: 1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ requestedAt: -1 });

// Virtual for formatted amount
PayoutSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

const PayoutModel = mongoose.model('Payout', PayoutSchema);

export default PayoutModel;

