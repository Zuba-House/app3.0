# Zuba App 3.0 - Complete Architecture Overview

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [API Structure](#api-structure)
5. [Authentication & Authorization](#authentication--authorization)
6. [Database Models](#database-models)
7. [Mobile App Integration Strategy](#mobile-app-integration-strategy)

---

## 🏗️ Project Structure

```
zuba-app3.0/web/
├── server/          # Backend API (Node.js/Express/MongoDB)
├── client/          # Customer Frontend (React/Vite)
├── admin/           # Admin Dashboard (React/Vite)
├── vendor/          # Vendor Dashboard (React/Vite)
└── [config files]   # Root-level configuration
```

### Directory Breakdown

#### **server/** - Backend API
```
server/
├── index.js                    # Main server entry point
├── config/                     # Configuration files
│   ├── connectDb.js           # MongoDB connection
│   ├── emailService.js        # Email service (SendGrid)
│   ├── validateEnv.js         # Environment validation
│   └── stallion.js            # Additional configs
├── controllers/                  # Route handlers (business logic)
│   ├── product.controller.js
│   ├── user.controller.js
│   ├── order.controller.js
│   ├── cart.controller.js
│   ├── vendor.controller.js
│   └── [25+ more controllers]
├── models/                     # Mongoose database models
│   ├── product.model.js
│   ├── user.model.js
│   ├── order.model.js
│   ├── vendor.model.js
│   └── [27+ more models]
├── route/                      # Express route definitions
│   ├── product.route.js
│   ├── user.route.js
│   ├── vendor.route.js
│   └── [29+ more routes]
├── middlewares/                # Express middlewares
│   ├── auth.js                # JWT authentication
│   ├── vendorAuth.js          # Vendor-specific auth
│   ├── errorHandler.js        # Global error handling
│   ├── multer.js              # File upload handling
│   └── analytics.js           # Visitor tracking
├── services/                   # Business logic services
│   ├── discount.service.js
│   └── shipping.service.js
├── utils/                      # Utility functions
└── uploads/                    # Local file storage (temporary)
```

#### **client/** - Customer Frontend
```
client/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # React entry point
│   ├── Pages/                  # Page components
│   │   ├── Home/
│   │   ├── ProductDetails/
│   │   ├── Cart/
│   │   ├── Checkout/
│   │   ├── Orders/
│   │   └── [45+ page components]
│   ├── components/             # Reusable UI components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── ProductCard/
│   │   └── [75+ components]
│   ├── utils/                  # Utilities
│   │   ├── api.js             # API client functions
│   │   └── currency.js        # Currency formatting
│   ├── firebase.jsx           # Firebase configuration
│   └── responsive.css         # Responsive styles
├── public/                    # Static assets
└── package.json
```

#### **admin/** - Admin Dashboard
```
admin/
├── src/
│   ├── App.jsx
│   ├── Pages/                  # Admin pages
│   │   ├── Products/
│   │   │   ├── addProductV2.jsx
│   │   │   └── VariationsManager.jsx
│   │   ├── Orders/
│   │   ├── Users/
│   │   ├── Analytics/
│   │   └── [52+ admin pages]
│   ├── Components/             # Admin components
│   │   ├── UploadBox/
│   │   └── [11+ components]
│   ├── utils/
│   │   ├── api.js             # API client with token refresh
│   │   └── currency.js
│   └── firebase.jsx
└── package.json
```

#### **vendor/** - Vendor Dashboard
```
vendor/
├── src/
│   ├── App.jsx
│   ├── Pages/                  # Vendor pages
│   │   ├── Dashboard/
│   │   ├── Products/
│   │   ├── Orders/
│   │   └── [26+ vendor pages]
│   ├── utils/
│   │   └── api.js             # Vendor API client
│   └── firebase.jsx
└── package.json
```

---

## 🔧 Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB (via Mongoose 8.9.2)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **File Storage**: Cloudinary 2.5.1 (with Multer 1.4.5 for uploads)
- **Email**: SendGrid 8.1.3 (via Nodemailer 6.9.16)
- **Payments**: Stripe 19.3.0, PayPal SDK 1.0.3
- **Shipping**: EasyPost API 8.3.0
- **Security**: Helmet 8.0.0, CORS 2.8.5, bcryptjs 2.4.3

### Server Entry Point (`server/index.js`)

**Key Features:**
1. **CORS Configuration**: Supports multiple origins (local dev, Vercel, production)
2. **Health Check Endpoints**: `/` and `/api/health`
3. **Analytics Middleware**: Tracks all visitors
4. **Error Handling**: Global error handler and 404 handler
5. **Security**: Helmet for security headers, cookie parser

**Main Routes:**
```javascript
/api/user              # User authentication & management
/api/product           # Product CRUD operations
/api/category          # Category management
/api/cart              # Shopping cart operations
/api/order             # Order management
/api/vendor            # Vendor operations
/api/admin/vendors     # Admin vendor management
/api/attributes        # Product attributes
/api/products/:id/variations  # Product variations
/api/media             # Media uploads
/api/shipping          # Shipping calculations
/api/coupons           # Coupon management
/api/gift-cards        # Gift card management
/api/discounts         # Discount management
/api/analytics         # Analytics data
/api/seo               # SEO (sitemap, robots.txt)
/api/stripe            # Stripe payment processing
```

### Authentication Flow

1. **User Registration/Login**:
   - POST `/api/user/register` → Creates user, returns JWT tokens
   - POST `/api/user/login` → Validates credentials, returns JWT tokens
   - Tokens stored: `accessToken` (short-lived) and `refreshToken` (long-lived)

2. **Token Validation**:
   - Middleware: `server/middlewares/auth.js`
   - Checks `Authorization: Bearer <token>` header OR `accessToken` cookie
   - Attaches `userId`, `userRole`, `vendorId` to request object

3. **Token Refresh**:
   - POST `/api/user/refresh-token` → Uses refreshToken to get new accessToken
   - Admin frontend has automatic token refresh interceptor

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "error": false,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": true,
  "message": "Error description",
  "details": { ... }
}
```

---

## 🎨 Frontend Architecture

### Client (Customer Frontend)

**Tech Stack:**
- React 18.3.1
- Vite 5.4.10
- React Router DOM 7.0.1
- Tailwind CSS 3.4.15
- Material-UI 6.1.8
- Algolia Search 4.25.3
- Stripe React 5.3.0
- Firebase 11.2.0

**API Client (`client/src/utils/api.js`):**
- Base URL: `import.meta.env.VITE_API_URL`
- Functions: `fetchDataFromApi()`, `postData()`, `editData()`, `deleteData()`, `uploadImage()`
- Token handling: Reads `accessToken` from localStorage
- Error handling: Detects auth errors (401/403) and marks them

**Key Features:**
- Product browsing and search
- Shopping cart
- Checkout with Stripe/PayPal
- User authentication
- Order tracking
- Wishlist (MyList)
- Address management
- Product reviews

### Admin Dashboard

**Tech Stack:**
- React 18.3.1
- Material-UI 6.2.0
- Recharts 2.15.0 (analytics charts)
- React Simple WYSIWYG 3.2.0

**API Client (`admin/src/utils/api.js`):**
- **Automatic Token Refresh**: Axios interceptor handles token expiration
- Queue system for concurrent requests during refresh
- Same base URL pattern as client

**Key Features:**
- Product management (simple & variable products)
- Attribute & variation management
- Order management
- User management
- Analytics dashboard
- Banner management
- Category management
- Coupon & discount management

### Vendor Dashboard

**Tech Stack:**
- React 18.3.1
- Material-UI 6.2.0
- Lucide React (icons)

**Key Features:**
- Vendor product management
- Order management (vendor-specific)
- Finance dashboard
- Coupon management
- Profile management

---

## 🔌 API Structure

### Authentication Endpoints

```
POST   /api/user/register          # User registration
POST   /api/user/login              # User login
POST   /api/user/refresh-token      # Refresh access token
POST   /api/user/logout             # User logout
GET    /api/user/me                 # Get current user (protected)
PUT    /api/user/me                 # Update user profile (protected)
```

### Product Endpoints

```
GET    /api/product/getAllProducts  # List all products (with filters)
GET    /api/product/:id              # Get product details
POST   /api/product/create           # Create product (admin)
PUT    /api/product/:id              # Update product (admin)
DELETE /api/product/:id              # Delete product (admin)
POST   /api/product/:id/variations/generate  # Generate variations
```

### Cart Endpoints

```
GET    /api/cart                     # Get user's cart (protected)
POST   /api/cart/add                 # Add item to cart (protected)
PUT    /api/cart/:id                 # Update cart item (protected)
DELETE /api/cart/:id                 # Remove cart item (protected)
```

### Order Endpoints

```
GET    /api/order                    # Get user's orders (protected)
POST   /api/order/create             # Create order (protected)
GET    /api/order/:id                # Get order details (protected)
PUT    /api/order/:id/status         # Update order status (admin)
```

### Vendor Endpoints

```
# Public
POST   /api/vendor/send-otp          # Send OTP for registration
POST   /api/vendor/verify-otp        # Verify OTP
POST   /api/vendor/apply             # Apply to become vendor
POST   /api/vendor/login             # Vendor login

# Protected (requires vendor auth)
GET    /api/vendor/me                # Get vendor profile
GET    /api/vendor/dashboard         # Get dashboard stats
GET    /api/vendor/products          # List vendor products
POST   /api/vendor/products          # Create vendor product
GET    /api/vendor/orders            # List vendor orders
GET    /api/vendor/finance           # Get finance data
```

### Category Endpoints

```
GET    /api/category                 # List all categories
GET    /api/category/:id             # Get category details
POST   /api/category                 # Create category (admin)
PUT    /api/category/:id             # Update category (admin)
DELETE /api/category/:id             # Delete category (admin)
```

### Media Endpoints

```
POST   /api/media/upload             # Upload image
DELETE /api/media/:id                # Delete media (admin)
```

### Payment Endpoints

```
POST   /api/stripe/create-payment-intent  # Create Stripe payment
POST   /api/stripe/webhook                # Stripe webhook handler
```

---

## 🔐 Authentication & Authorization

### User Roles

1. **USER**: Regular customer (default)
2. **ADMIN**: Platform administrator
3. **VENDOR**: Marketplace vendor

### Authentication Middleware

**`server/middlewares/auth.js`:**
- Validates JWT token from header or cookie
- Attaches `userId`, `userRole`, `vendorId` to request
- Returns 401 if token missing/invalid/expired

**`server/middlewares/vendorAuth.js`:**
- Requires `auth` middleware first
- Checks if user has `VENDOR` role
- Returns 403 if not a vendor

### Token Storage (Frontend)

- **Storage**: `localStorage`
- **Keys**: `accessToken`, `refreshToken`
- **Format**: JWT tokens
- **Header**: `Authorization: Bearer <accessToken>`

### Security Features

1. **CORS**: Configured for specific origins
2. **Helmet**: Security headers
3. **bcryptjs**: Password hashing
4. **JWT**: Token-based authentication
5. **Rate Limiting**: (can be added)
6. **Input Validation**: (should be added)

---

## 💾 Database Models

### Core Models

**User Model** (`server/models/user.model.js`):
- Email, password (hashed), name
- Role (USER, ADMIN, VENDOR)
- vendorId (if vendor)
- Status (active, inactive)
- Addresses array

**Product Model** (`server/models/product.model.js`):
- Name, description, SKU
- Price, salePrice
- Images array
- Category references
- Attributes and variations
- Stock quantity
- Status (draft, published)

**Order Model** (`server/models/order.model.js`):
- User reference
- Products array with quantities
- Shipping address
- Payment info
- Status (pending, processing, shipped, delivered, cancelled)
- Total amount

**Vendor Model** (`server/models/vendor.model.js`):
- Business name, email
- Status (pending, approved, rejected)
- Products reference
- Finance data

**Cart Model** (`server/models/cartProduct.modal.js`):
- User reference
- Products array with quantities
- Timestamp

**Category Model** (`server/models/category.modal.js`):
- Name, slug, description
- Parent category (for hierarchy)
- Image

**Attribute Model** (`server/models/attribute.model.js`):
- Name (e.g., "Color", "Size")
- Values array (e.g., ["Red", "Blue", "Green"])

**Variation Model** (`server/models/productVariation.model.js`):
- Product reference
- Attribute combinations
- Price, stock
- SKU

---

## 📱 Mobile App Integration Strategy

### Current Architecture (Web)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│  MongoDB    │
│  (React)    │     │  (Express)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │
┌─────────────┐
│    Admin    │
│  (React)    │
└─────────────┘
```

### Target Architecture (Web + Mobile)

```
┌─────────────┐
│   Client    │────┐
│  (React)    │    │
└─────────────┘    │
                   │
┌─────────────┐    │     ┌─────────────┐     ┌─────────────┐
│    Admin    │────┼────▶│   Server    │────▶│  MongoDB    │
│  (React)    │    │     │  (Express)  │     │             │
└─────────────┘    │     └─────────────┘     └─────────────┘
                   │
┌─────────────┐    │
│   Mobile    │────┘
│  (React Native│
│   / Flutter) │
└─────────────┘
```

### ✅ Backend is Already Mobile-Ready!

**Why the backend is ready:**
1. ✅ **RESTful API**: All endpoints use standard HTTP methods
2. ✅ **JSON Responses**: All responses are JSON
3. ✅ **Token-Based Auth**: JWT tokens work with mobile apps
4. ✅ **CORS Configured**: Can allow mobile app origins
5. ✅ **No Web-Specific Code**: Backend is framework-agnostic
6. ✅ **Bearer Token Auth**: Standard Authorization header

### What You Need to Do

#### 1. **Choose Mobile Framework**

**Option A: React Native** (Recommended if you know React)
- Share business logic with web
- Same language (JavaScript/TypeScript)
- Can share API client code

**Option B: Flutter**
- Cross-platform (iOS + Android)
- Single codebase
- Good performance

**Option C: Native (Swift + Kotlin)**
- Best performance
- Platform-specific features
- More development time

#### 2. **Create API Client for Mobile**

Create a mobile API client similar to web:

**React Native Example:**
```javascript
// mobile/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://your-api-url.com'; // Same as VITE_API_URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/user/refresh-token`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          const newToken = response.data.data.accessToken;
          await AsyncStorage.setItem('accessToken', newToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(error.config);
        } catch (refreshError) {
          // Refresh failed - logout
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          // Navigate to login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 3. **Update Backend CORS (if needed)**

The backend already allows requests with no origin (mobile apps), but you can add specific mobile app origins:

```javascript
// server/index.js
const allowedOrigins = [
  // ... existing origins
  'capacitor://localhost',  // Capacitor apps
  'ionic://localhost',      // Ionic apps
  // Add your mobile app bundle IDs if needed
];
```

#### 4. **Reuse API Endpoints**

**All existing endpoints work with mobile:**
- ✅ `/api/user/login` - Mobile login
- ✅ `/api/user/register` - Mobile registration
- ✅ `/api/product/getAllProducts` - Product listing
- ✅ `/api/cart/*` - Cart operations
- ✅ `/api/order/*` - Order management
- ✅ `/api/vendor/*` - Vendor operations (if vendor app)

**No backend changes needed!**

#### 5. **Mobile-Specific Considerations**

**Push Notifications:**
- Add Firebase Cloud Messaging (FCM) or Apple Push Notification (APN)
- Create endpoint: `POST /api/user/register-device-token`
- Store device tokens in User model

**File Uploads:**
- Use same `/api/media/upload` endpoint
- Mobile apps can upload images using FormData (same as web)

**Offline Support:**
- Cache API responses locally (AsyncStorage/Realm/SQLite)
- Sync when online

**Deep Linking:**
- Handle product URLs: `zubaapp://product/:id`
- Handle order tracking: `zubaapp://order/:id`

### Mobile App Structure (React Native Example)

```
mobile/
├── src/
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.js
│   │   ├── ProductScreen.js
│   │   ├── CartScreen.js
│   │   └── ...
│   ├── components/           # Reusable components
│   ├── services/             # API services
│   │   ├── api.js           # API client
│   │   ├── auth.service.js  # Auth functions
│   │   └── product.service.js
│   ├── navigation/           # Navigation setup
│   ├── context/              # React Context (Auth, Cart)
│   ├── utils/                # Utilities
│   └── assets/               # Images, fonts
├── App.js                    # Root component
└── package.json
```

### API Endpoints Summary for Mobile

**Authentication:**
- `POST /api/user/login` - Login
- `POST /api/user/register` - Register
- `POST /api/user/refresh-token` - Refresh token
- `GET /api/user/me` - Get current user

**Products:**
- `GET /api/product/getAllProducts` - List products
- `GET /api/product/:id` - Product details
- `GET /api/category` - List categories

**Cart:**
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:id` - Update cart
- `DELETE /api/cart/:id` - Remove from cart

**Orders:**
- `GET /api/order` - List orders
- `POST /api/order/create` - Create order
- `GET /api/order/:id` - Order details

**User:**
- `PUT /api/user/me` - Update profile
- `GET /api/address` - Get addresses
- `POST /api/address` - Add address

### Testing Mobile API Integration

1. **Use Postman/Insomnia**: Test all endpoints
2. **Check CORS**: Ensure mobile requests are allowed
3. **Test Authentication**: Login flow with mobile app
4. **Test File Uploads**: Upload product images from mobile
5. **Test Payments**: Stripe/PayPal integration

---

## 🚀 Next Steps for Mobile Development

1. **Set up mobile project** (React Native/Flutter)
2. **Create API client** (reuse web patterns)
3. **Implement authentication flow** (login, register, token refresh)
4. **Build core screens** (Home, Products, Cart, Checkout)
5. **Integrate payment SDKs** (Stripe, PayPal mobile SDKs)
6. **Add push notifications** (FCM/APN)
7. **Test with backend** (use same API endpoints)
8. **Deploy mobile app** (App Store, Google Play)

---

## 📝 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://...
MONGODB_LOCAL_URI=mongodb://localhost:27017/zuba
SECRET_KEY_ACCESS_TOKEN=your-secret-key
SECRET_KEY_REFRESH_TOKEN=your-refresh-secret
EMAIL_USER=your-email
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://zubahouse.com
ADMIN_URL=https://admin.zubahouse.com
```

### Frontend (`client/.env` / `admin/.env`)
```env
VITE_API_URL=https://your-api-url.com
```

### Mobile (React Native `.env`)
```env
API_URL=https://your-api-url.com
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

---

## 🎯 Summary

**Your backend is already mobile-ready!** The RESTful API architecture means you can build a mobile app that uses the exact same endpoints as your web app. The main work is:

1. ✅ **Backend**: Already done - no changes needed
2. 🔨 **Mobile App**: Build using React Native/Flutter
3. 🔌 **API Integration**: Use same endpoints with mobile HTTP client
4. 🔐 **Authentication**: Same JWT token flow
5. 📦 **Features**: All features available via API

The backend serves as a **single source of truth** for all platforms (web, admin, vendor, and mobile).

