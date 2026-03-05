/**
 * Notification Controller
 * Handles push notifications for mobile apps
 */

// In-memory store for push tokens (in production, use a database table)
const pushTokenStore = new Map();

/**
 * Register push token
 * POST /api/notifications/register-token
 */
export const registerPushToken = async (req, res) => {
  try {
    const { pushToken, deviceType, userId } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        error: 'Push token is required'
      });
    }

    // Store or update the token
    const tokenData = {
      pushToken,
      deviceType: deviceType || 'unknown',
      userId: userId || req.userId || null,
      updatedAt: new Date()
    };

    // Store by token (to prevent duplicates)
    pushTokenStore.set(pushToken, tokenData);

    // If user is authenticated, also store by userId
    if (userId || req.userId) {
      const userTokens = pushTokenStore.get(`user_${userId || req.userId}`) || [];
      if (!userTokens.includes(pushToken)) {
        userTokens.push(pushToken);
        pushTokenStore.set(`user_${userId || req.userId}`, userTokens);
      }
    }

    console.log(`[Notifications] Token registered: ${pushToken.substring(0, 20)}...`);

    return res.status(200).json({
      success: true,
      message: 'Push token registered successfully'
    });
  } catch (error) {
    console.error('[Notifications] Error registering token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register push token'
    });
  }
};

/**
 * Send push notification to specific user
 * POST /api/notifications/send
 */
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data, type } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required'
      });
    }

    // Get user's push tokens
    const userTokens = pushTokenStore.get(`user_${userId}`) || [];

    if (userTokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No push tokens found for this user'
      });
    }

    // Send to all user's devices
    const results = await sendExpoPushNotifications(userTokens, {
      title,
      body,
      data: {
        ...data,
        type: type || 'general'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications sent',
      results
    });
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    });
  }
};

/**
 * Send push notification to multiple users (broadcast)
 * POST /api/notifications/broadcast
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, body, data, type, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required'
      });
    }

    // Get all tokens or specific user tokens
    let tokens = [];

    if (userIds && Array.isArray(userIds)) {
      // Send to specific users
      for (const userId of userIds) {
        const userTokens = pushTokenStore.get(`user_${userId}`) || [];
        tokens.push(...userTokens);
      }
    } else {
      // Send to all registered tokens
      for (const [key, value] of pushTokenStore.entries()) {
        if (!key.startsWith('user_') && typeof value === 'object' && value.pushToken) {
          tokens.push(value.pushToken);
        }
      }
    }

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No push tokens found'
      });
    }

    // Remove duplicates
    tokens = [...new Set(tokens)];

    // Send notifications
    const results = await sendExpoPushNotifications(tokens, {
      title,
      body,
      data: {
        ...data,
        type: type || 'general'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Broadcast sent to ${tokens.length} devices`,
      results
    });
  } catch (error) {
    console.error('[Notifications] Error broadcasting:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification'
    });
  }
};

/**
 * Get notification history for user
 * GET /api/notifications/history
 */
export const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // In production, fetch from database
    // For now, return empty array
    return res.status(200).json({
      success: true,
      data: [],
      message: 'Notification history retrieved'
    });
  } catch (error) {
    console.error('[Notifications] Error getting history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get notification history'
    });
  }
};

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderUpdates, promotions, cartReminders, priceDrops } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // In production, save to database
    console.log(`[Notifications] Preferences updated for user ${userId}:`, req.body);

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      preferences: {
        orderUpdates: orderUpdates !== false,
        promotions: promotions !== false,
        cartReminders: cartReminders !== false,
        priceDrops: priceDrops !== false
      }
    });
  } catch (error) {
    console.error('[Notifications] Error updating preferences:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
};

/**
 * Remove push token (on logout)
 * DELETE /api/notifications/token
 */
export const removePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.userId;

    if (pushToken) {
      pushTokenStore.delete(pushToken);
    }

    if (userId) {
      pushTokenStore.delete(`user_${userId}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Push token removed'
    });
  } catch (error) {
    console.error('[Notifications] Error removing token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove push token'
    });
  }
};

/**
 * Helper: Send notifications via Expo Push API
 */
async function sendExpoPushNotifications(tokens, notification) {
  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  // Prepare messages
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    priority: 'high',
    channelId: notification.data?.type === 'order_status' ? 'orders' : 'default'
  }));

  // Send in batches of 100
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch)
      });

      const result = await response.json();
      results.push(result);

      console.log(`[Notifications] Batch ${i / batchSize + 1} sent:`, result.data?.length || 0, 'notifications');
    } catch (error) {
      console.error(`[Notifications] Error sending batch ${i / batchSize + 1}:`, error);
      results.push({ error: error.message });
    }
  }

  return results;
}

/**
 * Helper: Send order status notification
 * Call this from order controller when order status changes
 */
export async function sendOrderNotification(userId, orderId, status, orderNumber) {
  const messages = {
    'PENDING': {
      title: '🛒 Order Received',
      body: `Your order #${orderNumber} has been received and is being processed.`
    },
    'PROCESSING': {
      title: '📦 Order Processing',
      body: `Your order #${orderNumber} is being prepared for shipping.`
    },
    'SHIPPED': {
      title: '🚚 Order Shipped',
      body: `Your order #${orderNumber} is on its way! Track your delivery.`
    },
    'DELIVERED': {
      title: '✅ Order Delivered',
      body: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`
    },
    'CANCELLED': {
      title: '❌ Order Cancelled',
      body: `Your order #${orderNumber} has been cancelled.`
    }
  };

  const message = messages[status];
  if (!message) return;

  const userTokens = pushTokenStore.get(`user_${userId}`) || [];
  if (userTokens.length === 0) return;

  await sendExpoPushNotifications(userTokens, {
    title: message.title,
    body: message.body,
    data: {
      type: 'order_status',
      orderId,
      status,
      orderNumber
    }
  });
}
