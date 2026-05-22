import mongoose from "mongoose";

const attributeValueSchema = mongoose.Schema(
  {
    // Reference to parent attribute
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: [true, "Attribute ID is required"],
    },

    // Display label (e.g., "Red", "Large", "Cotton")
    label: {
      type: String,
      required: [true, "Value label is required"],
      trim: true,
      maxlength: [100, "Label cannot exceed 100 characters"],
    },

    // Machine-readable value (lowercase, no spaces)
    value: {
      type: String,
      required: [true, "Value slug is required"],
      lowercase: true,
      trim: true,
    },

    // Metadata varies by attribute type
    // For color_swatch: { colorCode: "#FF0000" }
    // For image_swatch: { imageUrl: "..." }
    // For button: { sortOrder: 1 }
    meta: {
      colorCode: {
        type: String,
        default: null,
        match: [/^#[0-9A-F]{6}$/i, "Invalid color code format"],
      },
      imageUrl: {
        type: String,
        default: null,
      },
      sortOrder: {
        type: Number,
        default: 0,
      },
    },

    // Track whether this value is active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Count of products using this value (for deletion safety)
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique value per attribute
attributeValueSchema.index({ attributeId: 1, value: 1 }, { unique: true });
attributeValueSchema.index({ attributeId: 1, isActive: 1 });

const AttributeValueModel = mongoose.model("AttributeValue", attributeValueSchema);

export default AttributeValueModel;
