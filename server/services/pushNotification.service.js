import { Expo } from 'expo-server-sdk';
import PushToken from '../models/pushToken.model.js';
import NotificationLog from '../models/notificationLog.model.js';
import { env } from '../config/env.js';

const expo = new Expo({
  accessToken: env.expoAccessToken || undefined,
  useFcmV1: true,
});

async function getUserModel() {
  return (await import('../models/user.model.js')).default;
}

function normalizePlatform(value) {
  const p = String(value || '').toLowerCase();
  if (p === 'ios' || p === 'android') return p;
  return 'unknown';
}

export async function upsertPushToken({
  userId,
  token,
  platform,
  deviceName,
}) {
  const User = await getUserModel();
  const plat = normalizePlatform(platform);

  await PushToken.findOneAndUpdate(
    { token },
    {
      userId,
      token,
      platform: plat,
      deviceName: deviceName || 'Unknown Device',
      isActive: true,
      lastSeen: new Date(),
    },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(userId, {
    $addToSet: { pushTokens: token },
  });
}

export async function deactivatePushToken(token) {
  if (!token) return;
  const User = await getUserModel();
  const doc = await PushToken.findOne({ token }).select('userId');
  await PushToken.findOneAndUpdate({ token }, { isActive: false });
  if (doc?.userId) {
    await User.findByIdAndUpdate(doc.userId, { $pull: { pushTokens: token } });
  } else {
    await User.updateMany(
      { pushTokens: token },
      { $pull: { pushTokens: token } }
    );
  }
}

async function collectActiveTokens() {
  const tokenDocs = await PushToken.find({ isActive: true })
    .select('token userId platform _id')
    .lean();

  if (tokenDocs.length > 0) {
    return tokenDocs;
  }

  const User = await getUserModel();
  const users = await User.find({
    pushTokens: { $exists: true, $ne: [] },
  })
    .select('pushTokens userId')
    .lean();

  const fallback = [];
  for (const user of users) {
    for (const token of user.pushTokens || []) {
      fallback.push({
        _id: null,
        token,
        userId: user._id,
        platform: 'unknown',
      });
    }
  }
  return fallback;
}

function buildMessage(doc, { title, body, channel, data, sound, imageUrl }) {
  const msg = {
    to: doc.token,
    sound: sound || 'default',
    title,
    body,
    badge: 1,
    channelId: channel,
    data: {
      ...data,
      channel,
      channelId: channel,
      sentAt: new Date().toISOString(),
    },
    priority: 'high',
  };

  if (imageUrl) {
    msg.richContent = { image: imageUrl };
  }

  return msg;
}

async function deliverMessages(messages, tokenDocs) {
  if (!messages.length) {
    return { successCount: 0, failureCount: 0, tickets: [] };
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  let successCount = 0;
  let failureCount = 0;
  let msgIndex = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        const doc = tokenDocs[msgIndex];
        tickets.push(ticket);

        if (ticket.status === 'ok') {
          successCount++;
        } else {
          failureCount++;
          if (
            ticket.details?.error === 'DeviceNotRegistered' &&
            doc?._id
          ) {
            await PushToken.updateOne(
              { _id: doc._id },
              { isActive: false }
            );
          } else if (
            ticket.details?.error === 'DeviceNotRegistered' &&
            doc?.token
          ) {
            await deactivatePushToken(doc.token);
          }
        }
        msgIndex++;
      }
    } catch (chunkErr) {
      console.error('[Push] Chunk send error:', chunkErr);
      failureCount += chunk.length;
      msgIndex += chunk.length;
    }
  }

  return { successCount, failureCount, tickets };
}

export async function sendBroadcast({
  title,
  message,
  channel = 'general',
  audience = 'all',
  data = {},
  sentBy = 'admin',
  sound = 'default',
  imageUrl = null,
}) {
  const tokenDocs = await collectActiveTokens();

  if (!tokenDocs.length) {
    return {
      sent: 0,
      failed: 0,
      total: 0,
      message: 'No registered devices found',
      status: 'failed',
    };
  }

  const messages = [];
  const validDocs = [];

  for (const doc of tokenDocs) {
    if (!Expo.isExpoPushToken(doc.token)) {
      if (doc._id) {
        await PushToken.updateOne({ _id: doc._id }, { isActive: false });
      }
      continue;
    }
    messages.push(
      buildMessage(doc, {
        title,
        body: message,
        channel,
        data,
        sound,
        imageUrl,
      })
    );
    validDocs.push(doc);
  }

  if (!messages.length) {
    return {
      sent: 0,
      failed: 0,
      total: 0,
      message: 'No valid push tokens',
      status: 'failed',
    };
  }

  const { successCount, failureCount, tickets } = await deliverMessages(
    messages,
    validDocs
  );

  const status =
    failureCount === 0 ? 'sent' : successCount === 0 ? 'failed' : 'partial';

  const log = await NotificationLog.create({
    title,
    message,
    channel,
    audience,
    data,
    sentBy,
    recipientCount: messages.length,
    successCount,
    failureCount,
    status,
    tickets: tickets.slice(0, 50),
  });

  return {
    sent: successCount,
    failed: failureCount,
    total: messages.length,
    logId: log._id,
    status,
    message:
      successCount > 0
        ? `Delivered to ${successCount} of ${messages.length} devices`
        : 'No devices received the notification',
  };
}

export async function sendToUser(
  userId,
  { title, message, channel = 'orders', data = {} }
) {
  const tokens = await PushToken.find({
    userId,
    isActive: true,
  }).lean();

  let tokenList = tokens;

  if (!tokenList.length) {
    const User = await getUserModel();
    const user = await User.findById(userId).select('pushTokens').lean();
    tokenList = (user?.pushTokens || []).map((token) => ({
      token,
      _id: null,
      userId,
    }));
  }

  const messages = [];
  const validDocs = [];

  for (const doc of tokenList) {
    if (!Expo.isExpoPushToken(doc.token)) continue;
    messages.push(
      buildMessage(doc, {
        title,
        body: message,
        channel,
        data,
        sound: 'default',
      })
    );
    validDocs.push(doc);
  }

  if (!messages.length) return { sent: 0 };

  const { successCount } = await deliverMessages(messages, validDocs);
  return { sent: successCount };
}

export async function getDeviceStats() {
  const total = await PushToken.countDocuments({ isActive: true });
  const ios = await PushToken.countDocuments({
    isActive: true,
    platform: 'ios',
  });
  const android = await PushToken.countDocuments({
    isActive: true,
    platform: 'android',
  });

  if (total > 0) {
    return { total, ios, android };
  }

  const User = await getUserModel();
  const users = await User.find({
    pushTokens: { $exists: true, $ne: [] },
  }).select('pushTokens');
  const legacyTotal = users.reduce(
    (sum, u) => sum + (u.pushTokens?.length || 0),
    0
  );
  return { total: legacyTotal, ios: 0, android: 0, legacy: true };
}
