import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createAttribute,
  getAllAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  getAttributeValues,
} from "../controllers/attribute.controller.js";

const attributeRouter = Router();

// ============ ATTRIBUTES ROUTES ============

// Create attribute
attributeRouter.post("/", auth, createAttribute);

// Get all attributes
attributeRouter.get("/", getAllAttributes);

// Get single attribute with values
attributeRouter.get("/:id", getAttributeById);

// Update attribute
attributeRouter.put("/:id", auth, updateAttribute);

// Delete attribute
attributeRouter.delete("/:id", auth, deleteAttribute);

// ============ ATTRIBUTE VALUES ROUTES ============

// Get all values for an attribute
attributeRouter.get("/:id/values", getAttributeValues);

// Create attribute value
attributeRouter.post("/:id/values", auth, createAttributeValue);

// Update attribute value
attributeRouter.put("/:id/values/:valueId", auth, updateAttributeValue);

// Delete attribute value
attributeRouter.delete("/:id/values/:valueId", auth, deleteAttributeValue);

export default attributeRouter;
