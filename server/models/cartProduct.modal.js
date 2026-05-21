import mongoose from 'mongoose';

const cartProductSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.CartProduct ||
  mongoose.model('CartProduct', cartProductSchema);
