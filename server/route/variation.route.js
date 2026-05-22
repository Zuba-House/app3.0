import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  getProductVariations,
  getVariationById,
  createVariation,
  updateVariation,
  deleteVariation,
  findVariationByAttributes,
  bulkUpdateVariations,
  generateVariations,
} from "../controllers/variation.controller.js";

const variationRouter = Router({ mergeParams: true });

// Get all variations for a product
// GET /api/products/:id/variations
variationRouter.get("/", getProductVariations);

// Find variation by attribute query params
// GET /api/products/:id/variations/find?color=red&size=large
variationRouter.get("/find", findVariationByAttributes);

// Get single variation
// GET /api/products/:id/variations/:variationId
variationRouter.get("/:variationId", getVariationById);

// Create single variation
// POST /api/products/:id/variations
variationRouter.post("/", auth, createVariation);

// Auto-generate variations from attributes
// POST /api/products/:id/variations/generate
variationRouter.post("/generate", auth, generateVariations);

// Update variation
// PUT /api/products/:id/variations/:variationId
variationRouter.put("/:variationId", auth, updateVariation);

// Bulk update variations
// PUT /api/products/:id/variations/bulk-update
variationRouter.put("/bulk-update", auth, bulkUpdateVariations);

// Delete variation
// DELETE /api/products/:id/variations/:variationId
variationRouter.delete("/:variationId", auth, deleteVariation);

export default variationRouter;
