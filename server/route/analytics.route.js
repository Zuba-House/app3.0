import { Router } from 'express';
import auth, { optionalAuth } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import {
  getActiveSessionsController,
  trackEventController,
} from '../controllers/analytics.controller.js';
import { basicRateLimit } from '../middlewares/basicRateLimit.js';

const analyticsRouter = Router();
const trackLimiter = basicRateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: 'analytics-track',
});

analyticsRouter.post('/track', trackLimiter, optionalAuth, trackEventController);
analyticsRouter.get('/active-sessions', auth, adminOnly, getActiveSessionsController);

export default analyticsRouter;
