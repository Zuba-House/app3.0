import mongoose from "mongoose";

const productVariationSchema = mongoose.Schema(
  {
    // Reference to parent product
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },

    // Attribute combination that defines this variation
    // Example: [ { attributeId: ObjectId, valueId: ObjectId, label: "Color: Red" } ]
    attributes: [
      {
        attributeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        valueId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeValue",
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
      },
    ],

    // Variation identification
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Pricing - override parent product price
    price: {
      type: Number,
      required: [true, "Variation price is required"],
      min: [0, "Price must be non-negative"],
    },

    salePrice: {
      type: Number,
      default: null,
      min: [0, "Sale price must be non-negative"],
    },

    // Stock management per variation
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Status tracking
    isActive: {
      type: Boolean,
      default: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    // Variation-specific images (if different from parent)
    images: [
      {
        type: String,
        default: null,
      },
    ],

    // Shipping dimensions
    weight: {
      type: Number,
      default: null,
      min: [0, "Weight cannot be negative"],
    },

    dimensions: {
      length: {
        type: Number,
        default: null,
      },
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },

    // Currency (inherited from product, but can override if needed)
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "INR", "EUR"],
    },

    // Metadata for future use
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique variation per product
productVariationSchema.index({ productId: 1, attributes: 1 });
productVariationSchema.index({ productId: 1, isActive: 1 });

// Virtual for display name (e.g., "Red - Large")
productVariationSchema.virtual("displayName").get(function () {
  return this.attributes.map((attr) => attr.label).join(" / ");
});

// Ensure virtuals are included when converting to JSON
productVariationSchema.set("toJSON", { virtuals: true });

const ProductVariationModel = mongoose.model(
  "ProductVariation",
  productVariationSchema
);

export default ProductVariationModel;
