import { Router } from "express";
import auth, { optionalAuth } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { 
    confirmOrderPaymentController,
    createOrderController, 
    deleteOrder, 
    getOrderByIdController,
    getOrderDetailsController, 
    getTotalOrdersCountController, 
    getUserOrderDetailsController, 
    totalSalesController, 
    totalUsersController, 
    updateOrderStatusController 
} from "../controllers/order.controller.js";

const orderRouter = Router();

// Guest checkout - use optionalAuth (allows both guests and logged-in users)
orderRouter.post('/create', optionalAuth, createOrderController)
orderRouter.post('/confirm-payment/:id', optionalAuth, confirmOrderPaymentController)
orderRouter.get("/order-list", auth, getOrderDetailsController)
orderRouter.put('/order-status/:id', auth, adminOnly, updateOrderStatusController)
orderRouter.get('/count', auth, getTotalOrdersCountController)
orderRouter.get('/sales', auth, totalSalesController)
orderRouter.get('/users', auth, totalUsersController)
orderRouter.get('/order-list/orders', auth, getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id', auth, deleteOrder)
orderRouter.get('/:id', auth, getOrderByIdController)

export default orderRouter;