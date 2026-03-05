import { Router } from "express";
import auth, { optionalAuth } from "../middlewares/auth.js";
import NotificationModel from "../models/notification.model.js";
import {
  registerPushToken,
  sendNotification,
  broadcastNotification,
  getNotificationHistory,
  updatePreferences,
  removePushToken
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

// Push token management
notificationRouter.post('/register-token', optionalAuth, registerPushToken);
notificationRouter.delete('/token', optionalAuth, removePushToken);

// Push notification sending (admin only in production)
notificationRouter.post('/send', optionalAuth, sendNotification);
notificationRouter.post('/broadcast', optionalAuth, broadcastNotification);

// User notification preferences
notificationRouter.get('/history', auth, getNotificationHistory);
notificationRouter.put('/preferences', auth, updatePreferences);

// Get all notifications for logged-in user
notificationRouter.get('/notifications', auth, async (request, response) => {
    try {
        const userId = request.userId;
        
        const notifications = await NotificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        
        const unreadCount = await NotificationModel.countDocuments({ 
            userId, 
            isRead: false 
        });
        
        return response.json({
            success: true,
            error: false,
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: true,
            message: error.message || "Failed to fetch notifications"
        });
    }
});

// Mark notification as read
notificationRouter.put('/notifications/:id/read', auth, async (request, response) => {
    try {
        const userId = request.userId;
        const { id } = request.params;
        
        const notification = await NotificationModel.findOne({ 
            _id: id, 
            userId 
        });
        
        if (!notification) {
            return response.status(404).json({
                success: false,
                error: true,
                message: "Notification not found"
            });
        }
        
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        
        return response.json({
            success: true,
            error: false,
            message: "Notification marked as read",
            notification: notification
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: true,
            message: error.message || "Failed to update notification"
        });
    }
});

// Mark all notifications as read
notificationRouter.put('/notifications/read-all', auth, async (request, response) => {
    try {
        const userId = request.userId;
        
        await NotificationModel.updateMany(
            { userId, isRead: false },
            { 
                $set: { 
                    isRead: true, 
                    readAt: new Date() 
                } 
            }
        );
        
        return response.json({
            success: true,
            error: false,
            message: "All notifications marked as read"
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: true,
            message: error.message || "Failed to update notifications"
        });
    }
});

// Delete notification
notificationRouter.delete('/notifications/:id', auth, async (request, response) => {
    try {
        const userId = request.userId;
        const { id } = request.params;
        
        const notification = await NotificationModel.findOneAndDelete({ 
            _id: id, 
            userId 
        });
        
        if (!notification) {
            return response.status(404).json({
                success: false,
                error: true,
                message: "Notification not found"
            });
        }
        
        return response.json({
            success: true,
            error: false,
            message: "Notification deleted"
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: true,
            message: error.message || "Failed to delete notification"
        });
    }
});

export default notificationRouter;

