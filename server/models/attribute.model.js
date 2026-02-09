import mongoose from "mongoose";

const attributeSchema = mongoose.Schema(
  {
    // Attribute identification
    name: {
      type: String,
      required: [true, "Attribute name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Attribute name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Attribute type determines how values are displayed
    type: {
      type: String,
      enum: ["select", "color_swatch", "image_swatch", "button"],
      default: "select",
    },

    // Description for admin reference
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Visibility options
    visibility: {
      type: String,
      enum: ["shop", "filter", "both"],
      default: "both",
    },

    // Whether this is a global reusable attribute
    isGlobal: {
      type: Boolean,
      default: true,
    },

    // Used for ordering attributes in admin UI
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Track whether this attribute is active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: slug already has unique index from field definition
attributeSchema.index({ isGlobal: 1, isActive: 1 });

const AttributeModel = mongoose.model("Attribute", attributeSchema);

export default AttributeModel;
