import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDb.js';

// Route imports
import userRoutes from './route/user.route.js';
import productRoutes from './route/product.route.js';
import categoryRoutes from './route/category.route.js';
import cartRoutes from './route/cart.route.js';
import orderRoutes from './route/order.route.js';
import vendorRoutes from './route/vendor.route.js';
import adminVendorRoutes from './route/adminVendor.route.js';
import attributeRoutes from './route/attribute.route.js';
import variationRoutes from './route/variation.route.js';
import mediaRoutes from './route/media.route.js';
import shippingRoutes from './route/shipping.route.js';
import couponRoutes from './route/coupon.route.js';
import giftCardRoutes from './route/giftCard.route.js';
import discountRoutes from './route/discount.route.js';
import analyticsRoutes from './route/analytics.route.js';
import seoRoutes from './route/seo.route.js';
import stripeRoutes from './route/stripe.route.js';
import bannerRoutes from './route/banner.route.js';
import bannerV1Routes from './route/bannerV1.route.js';
import bannerList2Routes from './route/bannerList2.route.js';
import homeSlidesRoutes from './route/homeSlides.route.js';
import blogRoutes from './route/blog.route.js';
import mylistRoutes from './route/mylist.route.js';
import addressRoutes from './route/address.route.js';
import notificationRoutes from './route/notification.route.js';
import orderTrackingRoutes from './route/orderTracking.route.js';
import logoRoutes from './route/logo.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'https://zubahouse.com',
  'https://www.zubahouse.com',
  'https://admin.zubahouse.com',
  'https://vendor.zubahouse.com',
  'https://api.zubahouse.com',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.VENDOR_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel deployment
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    // Allow any Render deployment
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    // Log rejected origin for debugging
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Zuba House API Server',
    status: 'running',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin/vendors', adminVendorRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/products', variationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/bannersV1', bannerV1Routes);
app.use('/api/bannerList2', bannerList2Routes);
app.use('/api/homeSlides', homeSlidesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/myList', mylistRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders/tracking', orderTrackingRoutes);
app.use('/api/logo', logoRoutes);

// Payment success/cancel redirects for mobile app
app.get('/payment-success', (req, res) => {
  const { session_id, orderId } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
          .success-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #2d3748; margin-bottom: 10px; }
          p { color: #718096; margin-bottom: 20px; }
          .order-id { font-family: monospace; background: #edf2f7; padding: 8px 16px; border-radius: 8px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your order.</p>
          ${orderId ? `<p class="order-id">Order: #${orderId.slice(-8).toUpperCase()}</p>` : ''}
          <p style="margin-top: 20px; font-size: 14px;">You can close this window and return to the app.</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/payment-cancel', (req, res) => {
  const { orderId } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Cancelled</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f7fafc; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .cancel-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #2d3748; margin-bottom: 10px; }
          p { color: #718096; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="cancel-icon">❌</div>
          <h1>Payment Cancelled</h1>
          <p>Your payment was cancelled. No charges were made.</p>
          <p style="margin-top: 20px; font-size: 14px;">You can close this window and return to the app to try again.</p>
        </div>
      </body>
    </html>
  `);
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: true,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: true,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
