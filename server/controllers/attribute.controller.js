import AttributeModel from "../models/attribute.model.js";
import AttributeValueModel from "../models/attributeValue.model.js";
import ProductVariationModel from "../models/productVariation.model.js";

// ============ ATTRIBUTES CRUD ============

/**
 * Create a new attribute
 * POST /api/attributes
 */
export const createAttribute = async (req, res) => {
  try {
    const { name, type, description, visibility } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: true,
        message: "Attribute name is required",
      });
    }

    // Check if attribute already exists
    const existingAttribute = await AttributeModel.findOne({
      slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
    });

    if (existingAttribute) {
      return res.status(409).json({
        error: true,
        message: "Attribute with this name already exists",
      });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    const attribute = new AttributeModel({
      name,
      slug,
      type: type || "select",
      description: description || "",
      visibility: visibility || "both",
      isGlobal: true,
    });

    await attribute.save();

    res.status(201).json({
      error: false,
      message: "Attribute created successfully",
      data: attribute,
    });
  } catch (error) {
    console.error("Error creating attribute:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to create attribute",
    });
  }
};

/**
 * Get all attributes
 * GET /api/attributes
 */
export const getAllAttributes = async (req, res) => {
  try {
    const { isActive, type } = req.query;

    let query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (type) query.type = type;

    const attributes = await AttributeModel.find(query).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    // Fetch attribute values for each attribute
    const attributesWithValues = await Promise.all(
      attributes.map(async (attr) => {
        const values = await AttributeValueModel.find(
          { attributeId: attr._id, isActive: true },
          null,
          { sort: { "meta.sortOrder": 1 } }
        );
        return {
          ...attr.toObject(),
          values,
        };
      })
    );

    res.status(200).json({
      error: false,
      message: "Attributes retrieved successfully",
      data: attributesWithValues,
    });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch attributes",
    });
  }
};

/**
 * Get single attribute with values
 * GET /api/attributes/:id
 */
export const getAttributeById = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await AttributeModel.findById(id);
    if (!attribute) {
      return res.status(404).json({
        error: true,
        message: "Attribute not found",
      });
    }

    const values = await AttributeValueModel.find(
      { attributeId: id },
      null,
      { sort: { "meta.sortOrder": 1 } }
    );

    res.status(200).json({
      error: false,
      message: "Attribute retrieved successfully",
      data: {
        ...attribute.toObject(),
        values,
      },
    });
  } catch (error) {
    console.error("Error fetching attribute:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch attribute",
    });
  }
};

/**
 * Update attribute
 * PUT /api/attributes/:id
 */
export const updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, visibility, isActive } = req.body;

    const attribute = await AttributeModel.findById(id);
    if (!attribute) {
      return res.status(404).json({
        error: true,
        message: "Attribute not found",
      });
    }

    // Update fields if provided
    if (name) attribute.name = name;
    if (type) attribute.type = type;
    if (description !== undefined) attribute.description = description;
    if (visibility) attribute.visibility = visibility;
    if (isActive !== undefined) attribute.isActive = isActive;

    await attribute.save();

    res.status(200).json({
      error: false,
      message: "Attribute updated successfully",
      data: attribute,
    });
  } catch (error) {
    console.error("Error updating attribute:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to update attribute",
    });
  }
};

/**
 * Delete attribute
 * DELETE /api/attributes/:id
 */
export const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if attribute is in use
    const attributeValuesInUse = await AttributeValueModel.findOne({
      attributeId: id,
      usageCount: { $gt: 0 },
    });

    if (attributeValuesInUse) {
      return res.status(409).json({
        error: true,
        message:
          "Cannot delete attribute that is currently in use by products",
      });
    }

    // Delete all attribute values
    await AttributeValueModel.deleteMany({ attributeId: id });

    // Delete attribute
    const result = await AttributeModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        error: true,
        message: "Attribute not found",
      });
    }

    res.status(200).json({
      error: false,
      message: "Attribute deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to delete attribute",
    });
  }
};

// ============ ATTRIBUTE VALUES CRUD ============

/**
 * Create attribute value
 * POST /api/attributes/:id/values
 */
export const createAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, value, meta } = req.body;

    if (!label || !value) {
      return res.status(400).json({
        error: true,
        message: "Label and value are required",
      });
    }

    const attribute = await AttributeModel.findById(id);
    if (!attribute) {
      return res.status(404).json({
        error: true,
        message: "Attribute not found",
      });
    }

    // Check for duplicate value
    const existingValue = await AttributeValueModel.findOne({
      attributeId: id,
      value: value.toLowerCase().trim(),
    });

    if (existingValue) {
      return res.status(409).json({
        error: true,
        message: "This value already exists for this attribute",
      });
    }

    const attributeValue = new AttributeValueModel({
      attributeId: id,
      label,
      value: value.toLowerCase().trim(),
      meta: meta || {},
      isActive: true,
    });

    await attributeValue.save();

    res.status(201).json({
      error: false,
      message: "Attribute value created successfully",
      data: attributeValue,
    });
  } catch (error) {
    console.error("Error creating attribute value:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to create attribute value",
    });
  }
};

/**
 * Update attribute value
 * PUT /api/attributes/:id/values/:valueId
 */
export const updateAttributeValue = async (req, res) => {
  try {
    const { id, valueId } = req.params;
    const { label, meta, isActive } = req.body;

    const attributeValue = await AttributeValueModel.findById(valueId);
    if (!attributeValue || attributeValue.attributeId.toString() !== id) {
      return res.status(404).json({
        error: true,
        message: "Attribute value not found",
      });
    }

    if (label) attributeValue.label = label;
    if (meta) attributeValue.meta = { ...attributeValue.meta, ...meta };
    if (isActive !== undefined) attributeValue.isActive = isActive;

    await attributeValue.save();

    res.status(200).json({
      error: false,
      message: "Attribute value updated successfully",
      data: attributeValue,
    });
  } catch (error) {
    console.error("Error updating attribute value:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to update attribute value",
    });
  }
};

/**
 * Delete attribute value
 * DELETE /api/attributes/:id/values/:valueId
 */
export const deleteAttributeValue = async (req, res) => {
  try {
    const { id, valueId } = req.params;

    const attributeValue = await AttributeValueModel.findById(valueId);
    if (!attributeValue || attributeValue.attributeId.toString() !== id) {
      return res.status(404).json({
        error: true,
        message: "Attribute value not found",
      });
    }

    if (attributeValue.usageCount > 0) {
      return res.status(409).json({
        error: true,
        message:
          "Cannot delete value that is in use by product variations. Disable it instead.",
      });
    }

    await AttributeValueModel.findByIdAndDelete(valueId);

    res.status(200).json({
      error: false,
      message: "Attribute value deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute value:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to delete attribute value",
    });
  }
};

/**
 * Get all values for an attribute
 * GET /api/attributes/:id/values
 */
export const getAttributeValues = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.query;

    let query = { attributeId: id };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const values = await AttributeValueModel.find(query).sort({
      "meta.sortOrder": 1,
    });

    res.status(200).json({
      error: false,
      message: "Attribute values retrieved successfully",
      data: values,
    });
  } catch (error) {
    console.error("Error fetching attribute values:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch attribute values",
    });
  }
};
