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
analyticsRouter.post('/track', trackPageView);

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

