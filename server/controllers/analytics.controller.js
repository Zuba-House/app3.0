import AnalyticsEventModel from '../models/analyticsEvent.model.js';
import UserModel from '../models/user.model.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const ACTIVE_SESSION_WINDOW_MS = 30 * 60 * 1000;

export async function trackEventController(request, response) {
  try {
    const { event, properties, userId: bodyUserId, timestamp } = request.body || {};
    const eventName = String(event || '').trim();

    if (!eventName) {
      return sendError(response, 400, 'event is required');
    }

    const userId = request.userId || bodyUserId || null;
    const props = properties && typeof properties === 'object' ? properties : {};
    const sessionId =
      props.session_id || props.sessionId
        ? String(props.session_id || props.sessionId).trim()
        : null;

    const occurredAt = timestamp ? new Date(timestamp) : new Date();

    await AnalyticsEventModel.create({
      event: eventName,
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      platform: props.platform || 'unknown',
      properties: props,
      occurredAt: Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt,
    });

    if (userId) {
      await UserModel.updateOne(
        { _id: userId },
        { $set: { lastActiveAt: new Date() } }
      );
    }

    return sendSuccess(response, 200, 'Event tracked');
  } catch (error) {
    console.error('Analytics track error:', error);
    return sendError(response, 500, error.message || 'Failed to track event');
  }
}

export async function getActiveSessionsController(request, response) {
  try {
    if (request.userRole !== 'ADMIN') {
      return sendError(response, 403, 'Unauthorized');
    }

    const since = new Date(Date.now() - ACTIVE_SESSION_WINDOW_MS);

    const sessionIds = await AnalyticsEventModel.distinct('sessionId', {
      occurredAt: { $gte: since },
      sessionId: { $exists: true, $nin: [null, ''] },
    });

    let activeSessions = sessionIds.length;

    if (activeSessions === 0) {
      const userIds = await AnalyticsEventModel.distinct('userId', {
        occurredAt: { $gte: since },
        userId: { $exists: true, $ne: null },
      });
      activeSessions = userIds.length;
    }

    if (activeSessions === 0) {
      activeSessions = await UserModel.countDocuments({
        lastActiveAt: { $gte: since },
      });
    }

    return sendSuccess(response, 200, 'Active sessions', {
      activeSessions,
      windowMinutes: Math.round(ACTIVE_SESSION_WINDOW_MS / 60000),
    });
  } catch (error) {
    console.error('Active sessions error:', error);
    return sendError(response, 500, error.message || 'Failed to load active sessions');
  }
}
