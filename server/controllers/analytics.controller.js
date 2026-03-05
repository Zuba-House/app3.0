/**
 * Analytics Controller
 * Handles analytics tracking events
 */

import AnalyticsModel from '../models/analytics.model.js';

/**
 * Track analytics event
 * POST /api/analytics/track
 */
export const trackEvent = async (req, res) => {
  try {
    const { event, properties, userId } = req.body;

    if (!event || typeof event !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Event name is required'
      });
    }

    // Store analytics event
    try {
      await AnalyticsModel.create({
        event,
        properties: properties || {},
        userId: userId || req.userId || null,
        timestamp: new Date(),
        platform: properties?.platform || 'unknown',
      });
    } catch (dbError) {
      // Don't fail if analytics model doesn't exist
      console.warn('Analytics model not available:', dbError.message);
    }

    return res.json({
      success: true,
      message: 'Event tracked'
    });

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
};

/**
 * Get analytics dashboard data
 * GET /api/analytics/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // This would aggregate analytics data
    // For now, return basic structure
    return res.json({
      success: true,
      data: {
        totalEvents: 0,
        uniqueUsers: 0,
        topEvents: [],
        recentEvents: [],
      }
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get analytics data'
    });
  }
};
