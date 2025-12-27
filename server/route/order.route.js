import { Router } from "express";
import auth, { optionalAuth } from "../middlewares/auth.js";
import { 
    createOrderController, 
    deleteOrder, 
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
orderRouter.get("/order-list", auth, getOrderDetailsController)
orderRouter.put('/order-status/:id', auth, updateOrderStatusController)
orderRouter.get('/count', auth, getTotalOrdersCountController)
orderRouter.get('/sales', auth, totalSalesController)
orderRouter.get('/users', auth, totalUsersController)
orderRouter.get('/order-list/orders', auth, getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id', auth, deleteOrder)

export default orderRouter;