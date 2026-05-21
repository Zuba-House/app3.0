import { sendError, sendSuccess } from '../utils/response.js';
import NotificationLog from '../models/notificationLog.model.js';
import {
  upsertPushToken,
  deactivatePushToken,
  sendBroadcast,
  sendToUser,
  getDeviceStats,
} from '../services/pushNotification.service.js';

const STATUS_MESSAGES = {
  RECEIVED: {
    title: '✅ Order confirmed!',
    body: 'Your order #{num} is confirmed.',
  },
  CONFIRMED: {
    title: '✅ Order confirmed!',
    body: 'Your order #{num} is confirmed.',
  },
  PROCESSING: {
    title: '⚙️ Being prepared',
    body: 'Your order #{num} is being prepared.',
  },
  SHIPPED: {
    title: '🚚 On its way!',
    body: 'Your order #{num} has been shipped.',
  },
  'OUT FOR DELIVERY': {
    title: '📦 Almost there!',
    body: 'Your order #{num} is out for delivery.',
  },
  DELIVERED: {
    title: '🎉 Delivered!',
    body: 'Your order #{num} has arrived. Enjoy!',
  },
  CANCELLED: {
    title: '❌ Order cancelled',
    body: 'Your order #{num} was cancelled.',
  },
};

export async function sendPushToUser(userId, { title, body, data = {} }) {
  try {
    const channel = data.channel || data.channelId || 'orders';
    const result = await sendToUser(userId, {
      title,
      message: body,
      channel,
      data,
    });
    return result.sent;
  } catch (err) {
    console.error('[Push] sendPushToUser error:', err);
    return 0;
  }
}

export async function broadcastToAll(opts) {
  return sendBroadcast(opts);
}

export async function sendOrderNotification(
  userId,
  orderId,
  status,
  orderNumber
) {
  const key = String(status || '').toUpperCase().replace(/_/g, ' ');
  const msg = STATUS_MESSAGES[key];
  if (!msg) return 0;

  const ref = orderNumber
    ? `#${orderNumber}`
    : `#${String(orderId).slice(-6).toUpperCase()}`;

  return sendPushToUser(userId, {
    title: msg.title,
    body: msg.body.replace('{num}', ref).replace('{orderNum}', ref),
    data: {
      channel: 'orders',
      channelId: 'orders',
      type: 'order_status',
      orderId: String(orderId),
      orderNumber,
      screen: 'OrderDetail',
    },
  });
}

export const registerPushToken = async (req, res) => {
  try {
    const token = req.body.token || req.body.pushToken;
    const platform = req.body.platform || req.body.deviceType;
    const deviceName = req.body.deviceName;
    const userId = req.userId || req.body.userId;

    if (!token) {
      return sendError(res, 400, 'token is required');
    }
    if (!userId) {
      return sendError(res, 401, 'Authentication required to register push token');
    }

    await upsertPushToken({
      userId,
      token,
      platform,
      deviceName,
    });

    return sendSuccess(res, 200, 'Push token registered', { registered: true });
  } catch (e) {
    console.error('[Push] register-token:', e);
    return sendError(res, 500, e.message || 'Failed to register token');
  }
};

export const unregisterPushToken = async (req, res) => {
  try {
    const token = req.body.token || req.body.pushToken;
    if (!token) {
      return sendError(res, 400, 'token is required');
    }
    await deactivatePushToken(token);
    return sendSuccess(res, 200, 'Push token unregistered');
  } catch (e) {
    return sendError(res, 500, e.message || 'Failed to unregister token');
  }
};

export const broadcastNotifications = async (req, res) => {
  try {
    const {
      title,
      message,
      body,
      channel = 'general',
      audience = 'all',
      data = {},
      imageUrl = null,
    } = req.body;

    const msgBody = message || body;
    if (!title || !msgBody) {
      return sendError(res, 400, 'title and message are required');
    }

    const result = await sendBroadcast({
      title,
      message: msgBody,
      channel,
      audience,
      data,
      sentBy: req.user?.email || req.userEmail || 'admin',
      sound: 'default',
      imageUrl: imageUrl || null,
    });

    return sendSuccess(res, 200, result.message || 'Broadcast sent', result);
  } catch (e) {
    console.error('[Push] broadcast error:', e);
    return sendError(res, 500, e.message || 'Broadcast failed');
  }
};

export const sendToUserNotification = async (req, res) => {
  try {
    const { userId, title, message, body, channel, data } = req.body;
    const msgBody = message || body;
    if (!userId || !title || !msgBody) {
      return sendError(res, 400, 'userId, title, and message are required');
    }

    const result = await sendToUser(userId, {
      title,
      message: msgBody,
      channel: channel || 'general',
      data: data || {},
    });

    return sendSuccess(res, 200, 'Notification sent', result);
  } catch (e) {
    return sendError(res, 500, e.message || 'Send failed');
  }
};

export const getNotificationHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const logs = await NotificationLog.find()
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await NotificationLog.countDocuments();

    return sendSuccess(res, 200, 'Notification history', {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    return sendError(res, 500, e.message || 'Failed to load history');
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await NotificationLog.countDocuments({
      sentAt: { $gte: since },
    });
    return sendSuccess(res, 200, 'Unread count', { count });
  } catch (e) {
    return sendError(res, 500, e.message || 'Failed to load count');
  }
};

export const getRegisteredDevices = async (req, res) => {
  try {
    const stats = await getDeviceStats();
    return sendSuccess(res, 200, 'Registered devices', stats);
  } catch (e) {
    return sendError(res, 500, e.message || 'Failed to load devices');
  }
};
