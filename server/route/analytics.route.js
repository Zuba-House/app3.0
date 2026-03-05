import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
    getDashboardStats,
    getVisitorsByCountry,
    getVisitorsByDevice,
    getTopPages,
    getTopReferrers,
    getVisitorsOverTime,
    getBrowserStats,
    getRealTimeVisitors,
    getProductViews,
    getSearchQueries
} from "../controllers/analytics.controller.js";
import { trackPageView } from "../middlewares/analytics.js";

const analyticsRouter = Router();

// ========================================
// PUBLIC ROUTES (for tracking)
// ========================================

// Track page view (called from client-side)
// Enhanced to support mobile app events
analyticsRouter.post('/track', async (req, res, next) => {
  try {
    const { event, properties, userId } = req.body;
    
    // Store event in analytics model if available (for mobile app events)
    if (event && properties && properties.platform === 'mobile') {
      try {
        const AnalyticsModel = (await import('../models/analytics.model.js')).default;
        await AnalyticsModel.create({
          event,
          properties: properties || {},
          userId: userId || req.userId || null,
          timestamp: new Date(),
          platform: 'mobile',
        });
      } catch (dbError) {
        // Silent fail - analytics shouldn't break the app
        console.warn('Analytics storage failed:', dbError.message);
      }
    }
    
    // Call existing middleware for web tracking
    return trackPageView(req, res, next);
  } catch (error) {
    console.error('Error in analytics track:', error);
    // Fallback to existing middleware
    return trackPageView(req, res, next);
  }
});

// ========================================
// PROTECTED ROUTES (Admin only)
// ========================================

// Dashboard overview
analyticsRouter.get('/dashboard', auth, getDashboardStats);

// Visitors by country
analyticsRouter.get('/countries', auth, getVisitorsByCountry);

// Visitors by device
analyticsRouter.get('/devices', auth, getVisitorsByDevice);

// Top pages
analyticsRouter.get('/pages', auth, getTopPages);

// Top referrers
analyticsRouter.get('/referrers', auth, getTopReferrers);

// Visitors over time (for charts)
analyticsRouter.get('/timeline', auth, getVisitorsOverTime);

// Browser stats
analyticsRouter.get('/browsers', auth, getBrowserStats);

// Real-time visitors
analyticsRouter.get('/realtime', auth, getRealTimeVisitors);

// Product views
analyticsRouter.get('/products', auth, getProductViews);

// Search queries
analyticsRouter.get('/searches', auth, getSearchQueries);

export default analyticsRouter;

