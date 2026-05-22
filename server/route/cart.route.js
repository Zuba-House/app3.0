import { Router } from "express";
import { addToCartItemController, deleteCartItemQtyController, emptyCartController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";
import auth, { optionalAuth } from "../middlewares/auth.js";

const cartRouter = Router();

// Test route to verify cart router is working
cartRouter.get('/test', (req, res) => {
    return res.json({ 
        error: false, 
        success: true, 
        message: 'Cart router is working',
        timestamp: new Date().toISOString()
    });
});

// Allow guests to add to cart (will need session/cookie-based cart for guests)
// For now, we'll allow it but guests will need to login at checkout
cartRouter.post('/add', optionalAuth, addToCartItemController);
cartRouter.get("/get", optionalAuth, getCartItemController);
cartRouter.put('/update-qty', optionalAuth, updateCartItemQtyController);
cartRouter.delete('/delete-cart-item/:id', optionalAuth, deleteCartItemQtyController);
cartRouter.delete('/emptyCart/:id', optionalAuth, emptyCartController);

export default cartRouter;