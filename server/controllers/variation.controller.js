import ProductVariationModel from "../models/productVariation.model.js";
import AttributeValueModel from "../models/attributeValue.model.js";
import ProductModel from "../models/product.model.js";

// ============ VARIATIONS CRUD ============

/**
 * Get all variations for a product
 * GET /api/products/:id/variations
 */
export const getProductVariations = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.query;

    let query = { productId: id };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const variations = await ProductVariationModel.find(query)
      .populate("attributes.attributeId", "name slug type")
      .populate("attributes.valueId", "label value meta")
      .sort({ isDefault: -1, createdAt: 1 });

    res.status(200).json({
      error: false,
      message: "Variations retrieved successfully",
      data: variations,
    });
  } catch (error) {
    console.error("Error fetching variations:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch variations",
    });
  }
};

/**
 * Get single variation
 * GET /api/products/:id/variations/:variationId
 */
export const getVariationById = async (req, res) => {
  try {
    const { id, variationId } = req.params;

    const variation = await ProductVariationModel.findOne({
      _id: variationId,
      productId: id,
    })
      .populate("attributes.attributeId", "name slug type")
      .populate("attributes.valueId", "label value meta");

    if (!variation) {
      return res.status(404).json({
        error: true,
        message: "Variation not found",
      });
    }

    res.status(200).json({
      error: false,
      message: "Variation retrieved successfully",
      data: variation,
    });
  } catch (error) {
    console.error("Error fetching variation:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch variation",
    });
  }
};

/**
 * Create a single variation
 * POST /api/products/:id/variations
 */
export const createVariation = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes, sku, price, salePrice, stock, images, isDefault } =
      req.body;

    // Validate product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    // Validate required fields
    if (!attributes || attributes.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Attributes are required",
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        error: true,
        message: "Valid price is required",
      });
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        error: true,
        message: "Valid stock is required",
      });
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existingSku = await ProductVariationModel.findOne({ sku });
      if (existingSku) {
        return res.status(409).json({
          error: true,
          message: "SKU already exists",
        });
      }
    }

    // If this is the default variation, unset other defaults
    if (isDefault) {
      await ProductVariationModel.updateMany(
        { productId: id, isDefault: true },
        { isDefault: false }
      );
    }

    const variation = new ProductVariationModel({
      productId: id,
      attributes,
      sku: sku || null,
      price,
      salePrice: salePrice || null,
      stock,
      images: images || [],
      isDefault: isDefault || false,
      isActive: true,
    });

    await variation.save();

    // Update product stock (sum of all variations)
    await updateProductStock(id);

    // Populate before returning
    await variation.populate("attributes.attributeId", "name slug type");
    await variation.populate("attributes.valueId", "label value meta");

    res.status(201).json({
      error: false,
      message: "Variation created successfully",
      data: variation,
    });
  } catch (error) {
    console.error("Error creating variation:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to create variation",
    });
  }
};

/**
 * Update variation
 * PUT /api/products/:id/variations/:variationId
 */
export const updateVariation = async (req, res) => {
  try {
    const { id, variationId } = req.params;
    const { price, salePrice, stock, images, isActive, isDefault, sku } =
      req.body;

    const variation = await ProductVariationModel.findOne({
      _id: variationId,
      productId: id,
    });

    if (!variation) {
      return res.status(404).json({
        error: true,
        message: "Variation not found",
      });
    }

    // Update fields if provided
    if (price !== undefined && price > 0) variation.price = price;
    if (salePrice !== undefined) variation.salePrice = salePrice;
    if (stock !== undefined && stock >= 0) variation.stock = stock;
    if (images !== undefined) variation.images = images;
    if (isActive !== undefined) variation.isActive = isActive;
    if (sku !== undefined) variation.sku = sku;

    // Handle default variation logic
    if (isDefault === true && !variation.isDefault) {
      await ProductVariationModel.updateMany(
        { productId: id, _id: { $ne: variationId } },
        { isDefault: false }
      );
      variation.isDefault = true;
    }

    await variation.save();

    // Update product stock
    await updateProductStock(id);

    await variation.populate("attributes.attributeId", "name slug type");
    await variation.populate("attributes.valueId", "label value meta");

    res.status(200).json({
      error: false,
      message: "Variation updated successfully",
      data: variation,
    });
  } catch (error) {
    console.error("Error updating variation:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to update variation",
    });
  }
};

/**
 * Delete variation
 * DELETE /api/products/:id/variations/:variationId
 */
export const deleteVariation = async (req, res) => {
  try {
    const { id, variationId } = req.params;

    const variation = await ProductVariationModel.findOne({
      _id: variationId,
      productId: id,
    });

    if (!variation) {
      return res.status(404).json({
        error: true,
        message: "Variation not found",
      });
    }

    // Decrease usage count for attribute values
    for (const attr of variation.attributes) {
      await AttributeValueModel.findByIdAndUpdate(
        attr.valueId,
        { $inc: { usageCount: -1 } },
        { new: true }
      );
    }

    await ProductVariationModel.findByIdAndDelete(variationId);

    // Update product stock
    await updateProductStock(id);

    // Check if any variations remain
    const remainingVariations = await ProductVariationModel.countDocuments({
      productId: id,
    });

    if (remainingVariations === 0) {
      // If no variations remain, set product back to simple
      await ProductModel.findByIdAndUpdate(id, { productType: "simple" });
    }

    res.status(200).json({
      error: false,
      message: "Variation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting variation:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to delete variation",
    });
  }
};

/**
 * Find variation by attribute values
 * GET /api/products/:id/variations/find?color=red&size=large
 */
export const findVariationByAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const queryParams = req.query;

    // Build query to find variation matching the attributes
    const product = await ProductModel.findById(id).populate(
      "attributes.attributeId"
    );

    if (!product || product.productType !== "variable") {
      return res.status(404).json({
        error: true,
        message: "Variable product not found",
      });
    }

    // Get all variations
    let variations = await ProductVariationModel.find({
      productId: id,
      isActive: true,
    })
      .populate("attributes.attributeId", "slug")
      .populate("attributes.valueId", "value");

    // Filter variations based on query parameters
    for (const [attrSlug, attrValue] of Object.entries(queryParams)) {
      variations = variations.filter((variation) => {
        return variation.attributes.some(
          (attr) =>
            attr.attributeId?.slug === attrSlug &&
            attr.valueId?.value === attrValue.toLowerCase()
        );
      });
    }

    if (variations.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Variation not found with given attributes",
      });
    }

    const variation = variations[0];
    await variation
      .populate("attributes.attributeId", "name slug type")
      .populate("attributes.valueId", "label value meta");

    res.status(200).json({
      error: false,
      message: "Variation found successfully",
      data: variation,
    });
  } catch (error) {
    console.error("Error finding variation:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to find variation",
    });
  }
};

/**
 * Bulk update variations
 * PUT /api/products/:id/variations/bulk-update
 */
export const bulkUpdateVariations = async (req, res) => {
  try {
    const { id } = req.params;
    const { variations } = req.body;

    if (!Array.isArray(variations) || variations.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Variations array is required and must not be empty",
      });
    }

    const updatePromises = variations.map((variation) =>
      ProductVariationModel.findByIdAndUpdate(
        variation._id,
        {
          price: variation.price,
          salePrice: variation.salePrice,
          stock: variation.stock,
          isActive: variation.isActive,
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Update product stock
    await updateProductStock(id);

    res.status(200).json({
      error: false,
      message: "Variations updated successfully",
    });
  } catch (error) {
    console.error("Error bulk updating variations:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to bulk update variations",
    });
  }
};

// ============ HELPER FUNCTIONS ============

/**
 * Update product stock (sum of all active variations)
 * and price range
 */
export const updateProductStock = async (productId) => {
  try {
    const variations = await ProductVariationModel.find({
      productId,
      isActive: true,
    });

    if (variations.length === 0) {
      // No active variations
      await ProductModel.findByIdAndUpdate(
        productId,
        { countInStock: 0, priceRange: { min: 0, max: 0 } },
        { new: true }
      );
      return;
    }

    // Calculate total stock
    const totalStock = variations.reduce(
      (sum, v) => sum + (v.stock || 0),
      0
    );

    // Calculate price range
    const prices = variations.map((v) => v.price);
    const salePrices = variations
      .map((v) => v.salePrice)
      .filter((p) => p !== null && p !== undefined);
    const allPrices = [...prices, ...salePrices];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    // Update product
    await ProductModel.findByIdAndUpdate(
      productId,
      {
        countInStock: totalStock,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
};

/**
 * Auto-generate variations from attribute combinations
 * POST /api/products/:id/generate-variations
 */
export const generateVariations = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes } = req.body;

    if (!Array.isArray(attributes) || attributes.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Attributes array is required",
      });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    // Get all attribute values for each attribute
    const attributeValuesList = await Promise.all(
      attributes.map(async (attr) => {
        const values = await AttributeValueModel.find({
          attributeId: attr.attributeId,
          _id: { $in: attr.valueIds },
          isActive: true,
        });
        return {
          attributeId: attr.attributeId,
          values,
        };
      })
    );

    // Generate all combinations
    const combinations = generateCombinations(attributeValuesList);

    if (combinations.length === 0) {
      return res.status(400).json({
        error: true,
        message: "No valid attribute combinations found",
      });
    }

    // Create variations for each combination
    const createdVariations = [];
    let isDefault = true;

    for (const combo of combinations) {
      // Build attributes array for this variation
      const variationAttributes = combo.map((attr) => ({
        attributeId: attr.attributeId,
        valueId: attr.value._id,
        label: `${attr.attributeName}: ${attr.value.label}`,
      }));

      // Create SKU from combination
      const skuParts = combo.map((attr) => attr.value.value);
      const sku = `${product.name.substring(0, 3).toUpperCase()}-${skuParts.join("-").toUpperCase()}`;

      const variation = new ProductVariationModel({
        productId: id,
        attributes: variationAttributes,
        sku,
        price: product.price || 0,
        salePrice: product.oldPrice || null,
        stock: product.countInStock || 0,
        isActive: true,
        isDefault: isDefault,
      });

      await variation.save();

      // Increase usage count for attribute values
      for (const attr of variationAttributes) {
        await AttributeValueModel.findByIdAndUpdate(
          attr.valueId,
          { $inc: { usageCount: 1 } },
          { new: true }
        );
      }

      createdVariations.push(variation);
      isDefault = false;
    }

    // Update product to variable type
    await ProductModel.findByIdAndUpdate(
      id,
      {
        productType: "variable",
        attributes: attributes.map((attr) => ({
          attributeId: attr.attributeId,
          values: attr.valueIds,
        })),
      },
      { new: true }
    );

    // Update product stock and price range
    await updateProductStock(id);

    res.status(201).json({
      error: false,
      message: `${createdVariations.length} variations generated successfully`,
      data: createdVariations,
    });
  } catch (error) {
    console.error("Error generating variations:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Failed to generate variations",
    });
  }
};

/**
 * Helper function to generate all combinations of attribute values
 */
function generateCombinations(attributeValuesList) {
  if (attributeValuesList.length === 0) return [];

  let combinations = attributeValuesList[0].values.map((val) => [
    {
      attributeId: attributeValuesList[0].attributeId,
      attributeName:
        attributeValuesList[0].attributeName ||
        `Attribute ${attributeValuesList[0].attributeId}`,
      value: val,
    },
  ]);

  for (let i = 1; i < attributeValuesList.length; i++) {
    const newCombinations = [];
    for (const combo of combinations) {
      for (const val of attributeValuesList[i].values) {
        newCombinations.push([
          ...combo,
          {
            attributeId: attributeValuesList[i].attributeId,
            attributeName:
              attributeValuesList[i].attributeName ||
              `Attribute ${attributeValuesList[i].attributeId}`,
            value: val,
          },
        ]);
      }
    }
    combinations = newCombinations;
  }

  return combinations;
}
