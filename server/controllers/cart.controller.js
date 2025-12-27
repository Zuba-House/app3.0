import CartProductModel from "../models/cartProduct.modal.js";
import ProductModel from "../models/product.model.js";

// ========================================
// ADD TO CART - Enhanced with variations and stock validation
// ========================================
export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId;
        
        // Debug logging
        console.log('🛒 Add to cart request:', {
            hasUserId: !!userId,
            userId: userId,
            headers: {
                authorization: request.headers?.authorization ? 'present' : 'missing',
                cookie: request.cookies ? 'present' : 'missing'
            }
        });
        
        // For guest users, require login for cart functionality
        // In future, can implement session-based cart for guests
        if (!userId) {
            return response.status(401).json({
                error: true,
                success: false,
                message: "Please login to add items to cart. Guest checkout is available at checkout page."
            });
        }
        
        // Extract all fields (old + new)
        const {
            productTitle,
            image,
            rating,
            price,
            oldPrice,
            quantity,
            subTotal,
            productId,
            countInStock,
            discount,
            brand,
            // New variation fields
            productType,
            variationId,
            variation,
            // Old fields (backward compatibility)
            size,
            weight,
            ram
        } = request.body;

        // Validate and normalize required fields
        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        // Ensure quantity is at least 1
        const normalizedQuantity = Math.max(1, parseInt(quantity) || 1);
        
        // Ensure price is a number
        const normalizedPrice = parseFloat(price) || 0;
        
        // Ensure countInStock is a number
        const normalizedStock = parseInt(countInStock) || 0;
        
        // Normalize image (handle both string and object)
        const normalizedImage = typeof image === 'string' 
            ? image 
            : (image?.url || image?.secureUrl || image || '');

        // ========================================
        // STEP 1: Validate stock availability from DATABASE
        // ========================================
        // Fetch actual product from database to verify stock (security check)
        const actualProduct = await ProductModel.findById(productId);
        
        if (!actualProduct) {
            return response.status(404).json({
                error: true,
                success: false,
                message: "Product not found"
            });
        }

        // Check product-level stock status (inventory.stockStatus for simple products)
        // For variable products, we check each variation's stockStatus separately below
        if (actualProduct.productType !== 'variable' && 
            actualProduct.inventory?.stockStatus === 'out_of_stock') {
            return response.status(400).json({
                error: true,
                success: false,
                message: "This product is out of stock"
            });
        }

        // For variable products, check variation stock status
        let actualStock = normalizedStock;
        if (productType === 'variable') {
            // Variable products MUST have a variationId
            if (!variationId) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: "Variation selection is required for variable products. Please select a size, color, or other variation."
                });
            }
            
            // Use 'foundVariation' to avoid shadowing the 'variation' from request body
            const foundVariation = actualProduct.variations?.find(
                v => v._id && v._id.toString() === variationId.toString()
            );
            
            if (!foundVariation) {
                // Log for debugging
                console.log('Variation lookup failed:', {
                    variationId,
                    productId,
                    availableVariations: actualProduct.variations?.map(v => ({
                        id: v._id?.toString(),
                        sku: v.sku,
                        attributes: v.attributes
                    }))
                });
                
                return response.status(404).json({
                    error: true,
                    success: false,
                    message: "Product variation not found. Please refresh the page and try again."
                });
            }
            
            // Check variation stock status
            if (foundVariation.stockStatus === 'out_of_stock') {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: "This product variation is out of stock"
                });
            }
            
            // Use variation stock from database (more secure than client-sent value)
            if (!foundVariation.endlessStock) {
                actualStock = Number(foundVariation.stock || 0);
            } else {
                actualStock = 999999; // Endless stock
            }
        } else {
            // For simple products, use database stock
            if (!actualProduct.inventory?.endlessStock) {
                actualStock = Number(
                    actualProduct.inventory?.stock || 
                    actualProduct.countInStock || 
                    0
                );
            } else {
                actualStock = 999999; // Endless stock
            }
        }

        if (actualStock <= 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "This product is out of stock"
            });
        }

        if (normalizedQuantity > actualStock) {
            return response.status(400).json({
                error: true,
                success: false,
                message: `Only ${actualStock} items available in stock`
            });
        }

        // ========================================
        // STEP 2: Check if item already in cart
        // ========================================
        const query = {
            userId: userId,
            productId: productId
        };
        
        // For variable products, also check variationId
        if (productType === 'variable' && variationId) {
            query.variationId = variationId;
        }
        // For old system, check size/weight/ram
        else if (size || weight || ram) {
            query.size = size || null;
            query.weight = weight || null;
            query.ram = ram || null;
        }

        const existingCartItem = await CartProductModel.findOne(query);

        // ========================================
        // STEP 3: Update existing or create new
        // ========================================
        if (existingCartItem) {
            // Item already in cart - update quantity
            const newQuantity = existingCartItem.quantity + normalizedQuantity;
            
            // Validate new quantity doesn't exceed actual database stock
            if (newQuantity > actualStock) {
                return response.status(400).json({
                    error: true,
                    success: false,
                    message: `Cannot add ${normalizedQuantity} more. Only ${actualStock - existingCartItem.quantity} items remaining in stock.`
                });
            }
            
            // Update quantity and subtotal
            existingCartItem.quantity = newQuantity;
            existingCartItem.subTotal = normalizedPrice * newQuantity;
            
            await existingCartItem.save();
            
            return response.status(200).json({
                error: false,
                success: true,
                message: "Cart updated successfully",
                data: existingCartItem
            });
        }
        
        // Item not in cart - create new entry
        const cartItem = new CartProductModel({
            productTitle: productTitle || '',
            image: normalizedImage,
            rating: parseFloat(rating) || 0,
            price: normalizedPrice,
            oldPrice: oldPrice ? parseFloat(oldPrice) : null,
            quantity: normalizedQuantity,
            subTotal: normalizedPrice * normalizedQuantity,
            productId,
            userId,
            countInStock: actualStock, // Use verified database stock
            discount: discount ? parseFloat(discount) : 0,
            brand: brand || '',
            // New fields
            productType: productType || 'simple',
            variationId: variationId || null,
            variation: variation || null,
            // Old fields (backward compatibility)
            size: size || null,
            weight: weight || null,
            ram: ram || null
        });

        const savedCart = await cartItem.save();

        return response.status(201).json({
            error: false,
            success: true,
            message: "Product added to cart successfully",
            data: savedCart
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || "Failed to add product to cart"
        });
    }
};

// ========================================
// GET CART ITEMS - With stock validation
// ========================================
export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId;

        const cartItems = await CartProductModel.find({
            userId: userId
        }).sort({ createdAt: -1 });

        // ========================================
        // VALIDATE STOCK FOR EACH ITEM
        // ========================================
        const cartWithStockStatus = await Promise.all(
            cartItems.map(async (item) => {
                try {
                    // Get current product stock
                    const product = await ProductModel.findById(item.productId);
                    
                    let currentStock = item.countInStock;
                    let isOutOfStock = false;
                    let isLowStock = false;
                    let stockChanged = false;
                    
                    if (product) {
                        // For variable products, check variation stock
                        if (item.productType === 'variable' && item.variationId) {
                            const variation = product.variations?.find(
                                v => v._id && v._id.toString() === item.variationId
                            );
                            if (variation) {
                                currentStock = variation.stock || 0;
                            }
                        } else {
                            // For simple products, check product stock
                            currentStock = product.countInStock || product.inventory?.stock || 0;
                        }
                        
                        // Update cart item if stock changed
                        if (currentStock !== item.countInStock) {
                            stockChanged = true;
                            item.countInStock = currentStock;
                            
                            // Adjust quantity if exceeds current stock
                            if (item.quantity > currentStock) {
                                // If stock is 0, remove item from cart
                                if (currentStock <= 0) {
                                    await CartProductModel.deleteOne({ _id: item._id });
                                    return null; // Return null to filter out deleted items
                                }
                                
                                // Adjust quantity to available stock (minimum 1)
                                item.quantity = Math.max(1, currentStock);
                                item.subTotal = parseFloat(item.price) * item.quantity;
                            }
                            
                            // Only save if quantity is valid (>= 1)
                            if (item.quantity >= 1) {
                                await item.save();
                            } else {
                                // If quantity somehow became 0, delete the item
                                await CartProductModel.deleteOne({ _id: item._id });
                                return null;
                            }
                        }
                    }
                    
                    isOutOfStock = currentStock <= 0;
                    isLowStock = currentStock > 0 && currentStock <= 5;
                    
                    return {
                        ...item.toObject(),
                        isOutOfStock,
                        isLowStock,
                        stockChanged,
                        currentStock
                    };
                } catch (error) {
                    console.error(`Error processing cart item ${item._id}:`, error);
                    // If there's an error, try to delete the problematic item
                    try {
                        await CartProductModel.deleteOne({ _id: item._id });
                    } catch (deleteError) {
                        console.error(`Error deleting cart item ${item._id}:`, deleteError);
                    }
                    return null; // Filter out items with errors
                }
            })
        );
        
        // Filter out null values (deleted items)
        const validCartItems = cartWithStockStatus.filter(item => item !== null);

        return response.json({
            data: validCartItems,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Get cart error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// ========================================
// UPDATE CART ITEM - With stock validation
// ========================================
export const updateCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId;
        const { _id, qty, subTotal, size, weight, ram } = request.body;

        if (!_id || !qty) {
            return response.status(400).json({
                message: "Cart item ID and quantity are required",
                error: true,
                success: false
            });
        }

        // Find cart item
        const cartItem = await CartProductModel.findOne({
            _id: _id,
            userId: userId
        });

        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            });
        }

        // ========================================
        // STOCK VALIDATION
        // ========================================
        if (qty > cartItem.countInStock) {
            return response.status(400).json({
                error: true,
                success: false,
                message: `Only ${cartItem.countInStock} items available in stock`
            });
        }

        if (qty <= 0) {
            // If quantity is 0 or negative, remove from cart
            await CartProductModel.deleteOne({ _id: _id });
            return response.status(200).json({
                error: false,
                success: true,
                message: "Item removed from cart"
            });
        }

        // Update quantity and subtotal
        const updateData = {
            quantity: qty,
            subTotal: subTotal || parseFloat(cartItem.price) * qty
        };

        // Update old fields if provided (backward compatibility)
        if (size !== undefined) updateData.size = size;
        if (weight !== undefined) updateData.weight = weight;
        if (ram !== undefined) updateData.ram = ram;

        const updateCartitem = await CartProductModel.updateOne(
            { _id: _id, userId: userId },
            updateData,
            { new: true }
        );

        return response.json({
            message: "Cart updated successfully",
            success: true,
            error: false,
            data: updateCartitem
        });

    } catch (error) {
        console.error("Update cart error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// ========================================
// DELETE CART ITEM
// ========================================
export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId;
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({
                message: "Cart item ID is required",
                error: true,
                success: false
            });
        }

        const deleteCartItem = await CartProductModel.deleteOne({
            _id: id,
            userId: userId
        });

        if (!deleteCartItem || deleteCartItem.deletedCount === 0) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Item removed from cart successfully",
            error: false,
            success: true,
            data: deleteCartItem
        });

    } catch (error) {
        console.error("Delete cart item error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// ========================================
// EMPTY CART
// ========================================
export const emptyCartController = async (request, response) => {
    try {
        const userId = request.params.id;

        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        await CartProductModel.deleteMany({ userId: userId });

        return response.status(200).json({
            error: false,
            success: true,
            message: "Cart emptied successfully"
        });

    } catch (error) {
        console.error("Empty cart error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
