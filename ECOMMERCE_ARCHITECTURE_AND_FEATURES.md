# Zuba House E-Commerce Platform - Complete Architecture & Features Documentation

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Core Features](#core-features)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Admin Panel Features](#admin-panel-features)
7. [Client Features](#client-features)
8. [Payment & Shipping](#payment--shipping)
9. [Security & Authentication](#security--authentication)

---

## 🏗️ System Architecture

### Architecture Overview
- **Type**: Full-stack MERN (MongoDB, Express, React, Node.js)
- **Deployment**: Multi-platform (Render, Vercel)
- **Structure**: Monorepo with 3 main applications:
  - **Server**: Node.js/Express REST API
  - **Client**: React frontend (customer-facing)
  - **Admin**: React frontend (admin dashboard)

### Application Structure
```
zuba-web2.0/
├── server/          # Backend API (Node.js/Express)
├── client/          # Customer Frontend (React)
├── admin/           # Admin Dashboard (React)
└── config files
```

---

## 🛠️ Tech Stack

### Backend (Server)
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB (Mongoose 8.9.2)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **File Upload**: Multer 1.4.5, Cloudinary 2.5.1
- **Email**: Nodemailer 6.9.16, SendGrid 8.1.3
- **Payment**: Stripe 19.3.0, PayPal SDK 1.0.3
- **Shipping**: EasyPost API 8.3.0
- **Security**: Helmet 8.0.0, CORS 2.8.5, bcryptjs 2.4.3

### Frontend (Client)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.10
- **Routing**: React Router DOM 7.0.1
- **UI Library**: Material-UI 6.1.8
- **Styling**: Tailwind CSS 3.4.15, Styled Components 6.1.13
- **Search**: Algolia Search 4.25.3, React InstantSearch 7.19.0
- **Payment**: Stripe React 5.3.0
- **Notifications**: React Hot Toast 2.4.1
- **Maps**: React Google Maps 2.20.7
- **Animations**: Framer Motion 11.0.0
- **Image Handling**: React Lazy Load, React Inner Image Zoom

### Frontend (Admin)
- **Framework**: React 18.3.1
- **UI Library**: Material-UI 6.2.0
- **Charts**: Recharts 2.15.0
- **WYSIWYG**: React Simple WYSIWYG 3.2.0
- **Loading**: React Top Loading Bar 3.0.2

---

## ✨ Core Features

### 1. Product Management

#### Product Types
- **Simple Products**: Single SKU products
- **Variable Products**: Products with variations (size, color, weight, RAM, etc.)
- **Product Variations**: Multiple SKUs per product with different attributes

#### Product Features
- ✅ Product name, description, short description
- ✅ Multiple product images (with featured image)
- ✅ Category assignment (primary + multiple categories)
- ✅ Sub-categories and third-level categories
- ✅ SKU and barcode management
- ✅ Brand assignment
- ✅ Pricing (regular price, sale price, currency)
- ✅ Inventory management (stock quantity, stock status, low stock threshold)
- ✅ Shipping information (weight, dimensions)
- ✅ Product status (draft, published, pending)
- ✅ SEO fields (meta title, description, keywords, slug)
- ✅ Product attributes and variations
- ✅ Product ratings and reviews
- ✅ Featured products
- ✅ Product banners
- ✅ Endless stock option

### 2. Category Management
- ✅ Hierarchical categories (3 levels: Category → Sub-Category → Third-Level)
- ✅ Category images and banners
- ✅ Category SEO
- ✅ Category visibility settings

### 3. Shopping Cart
- ✅ Add/remove products
- ✅ Update quantities
- ✅ Support for simple and variable products
- ✅ Variation selection in cart
- ✅ Stock validation
- ✅ Cart persistence (user-based)

### 4. Order Management

#### Order Features
- ✅ Guest checkout support
- ✅ Registered user checkout
- ✅ Order status tracking (Received → Processing → Shipped → Out for Delivery → Delivered)
- ✅ Order history
- ✅ Order cancellation (within 2 hours)
- ✅ Order tracking with tracking numbers
- ✅ Estimated delivery dates
- ✅ Shipping address management
- ✅ Delivery notes
- ✅ Apartment/unit numbers
- ✅ Order status history
- ✅ Multi-vendor order support (vendor-specific status per product)

### 5. User Management
- ✅ User registration (email/password)
- ✅ Google OAuth sign-up
- ✅ Email verification (OTP-based)
- ✅ Password reset (forgot password)
- ✅ User roles (ADMIN, USER, VENDOR)
- ✅ User profiles
- ✅ Address management (multiple addresses)
- ✅ Order history
- ✅ Account status (Active, Inactive, Suspended)

### 6. Discount System

#### Coupon System
- ✅ Coupon codes (unique, uppercase)
- ✅ Discount types:
  - Percentage discount
  - Fixed cart discount
  - Fixed product discount
- ✅ Usage limits (total and per-user)
- ✅ Date range (start/end dates)
- ✅ Minimum/maximum purchase amounts
- ✅ Product restrictions (include/exclude specific products)
- ✅ Category restrictions (include/exclude categories)
- ✅ Email restrictions (allowed/excluded emails)
- ✅ Exclude sale items option
- ✅ Free shipping option
- ✅ Individual use (cannot combine with other coupons)
- ✅ Usage tracking

#### Gift Card System
- ✅ Unique gift card codes (12 characters, formatted as XXXX-XXXX-XXXX)
- ✅ Initial and current balance tracking
- ✅ Multi-currency support (USD, CAD, EUR, GBP)
- ✅ User-specific or general use
- ✅ Expiry dates
- ✅ Usage history
- ✅ Balance management (add/apply)
- ✅ Email delivery to recipients

#### Automatic Discounts
- ✅ Cart threshold discounts
- ✅ First-time buyer discounts
- ✅ Discount stacking rules

### 7. Payment Processing

#### Payment Methods
- ✅ **Stripe Integration**
  - Payment intents
  - Automatic payment methods
  - Multi-currency support
  - Organization account support
- ✅ **PayPal Integration** (SDK configured)
- ✅ Credit/Debit Cards (Visa, MasterCard, American Express)
- ✅ Digital wallets support
- ✅ PCI DSS compliance

#### Payment Features
- ✅ Secure payment processing
- ✅ Payment status tracking
- ✅ Payment intent creation
- ✅ Payment health checks

### 8. Shipping & Delivery

#### Shipping Features
- ✅ **EasyPost Integration** (for Canada Post)
- ✅ **Region-based shipping calculator**
  - Canada, USA, Europe, Asia, Oceania, South America, Africa, Middle East
- ✅ Distance-based calculations
- ✅ Weight-based pricing
- ✅ Multiple shipping rates
- ✅ Shipping address validation
- ✅ Tracking number management
- ✅ Estimated delivery dates
- ✅ Free shipping options (via coupons)
- ✅ Shipping cost calculation per order

#### Shipping Zones
- Warehouse: Gatineau, Quebec, Canada (J9H5W5)
- Supports international shipping
- Region-specific base rates and multipliers

### 9. Search & Filtering

#### Search Features
- ✅ **Algolia Search Integration** (client-side)
- ✅ **MongoDB Text Search** (server-side)
- ✅ Search by:
  - Product name
  - Description
  - Short description
  - Brand
  - Category names
  - SKU
- ✅ Case-insensitive search
- ✅ Search result pagination

#### Filtering Features
- ✅ Filter by category
- ✅ Filter by sub-category
- ✅ Filter by third-level category
- ✅ Filter by price range
- ✅ Filter by rating
- ✅ Filter by brand
- ✅ Filter by product type (simple/variable)
- ✅ Filter by stock status (in stock, out of stock, low stock)
- ✅ Multiple filter combinations
- ✅ Sort by name, price (ascending/descending)

### 10. Reviews & Ratings
- ✅ Product reviews
- ✅ Star ratings
- ✅ Review display on product pages
- ✅ Average rating calculation

### 11. Wishlist/My List
- ✅ Save products to wishlist
- ✅ View saved items
- ✅ Remove from wishlist

### 12. Blog System
- ✅ Blog post creation
- ✅ Blog post editing
- ✅ Blog categories
- ✅ Blog SEO
- ✅ Blog detail pages

### 13. Banner Management
- ✅ **Home Slider Banners** (carousel)
- ✅ **Banner V1** (single banners)
- ✅ **Banner List 2** (grid banners)
- ✅ **Responsive Banners** (device-specific)
- ✅ Banner images and links
- ✅ Banner display on home page

### 14. Analytics & Tracking
- ✅ Visitor tracking
- ✅ Page views
- ✅ Unique visitors
- ✅ New vs returning visitors
- ✅ Bot detection
- ✅ Daily statistics
- ✅ Monthly statistics
- ✅ Dashboard analytics
- ✅ Order analytics
- ✅ Product analytics
- ✅ User analytics

### 15. Media Management
- ✅ Media library
- ✅ Image upload (Cloudinary)
- ✅ Multiple image formats
- ✅ Image optimization
- ✅ Media organization

### 16. Notifications
- ✅ Order notifications
- ✅ Email notifications
- ✅ Order status emails
- ✅ Admin notifications

### 17. Address Management
- ✅ Multiple addresses per user
- ✅ Address validation
- ✅ Default address selection
- ✅ Shipping address selection
- ✅ Address coordinates (for shipping calculations)

### 18. Order Tracking
- ✅ Real-time order status
- ✅ Tracking number integration
- ✅ Status history
- ✅ Estimated delivery
- ✅ Delivery confirmation

---

## 🗄️ Database Models

### Core Models
1. **User** (`user.model.js`)
   - Authentication, roles, profile, addresses, order history

2. **Product** (`product.model.js`)
   - Product details, pricing, inventory, images, variations, SEO

3. **Order** (`order.model.js`)
   - Order details, products, shipping, payment, status, tracking

4. **Cart** (`cartProduct.modal.js`)
   - Cart items, quantities, variations, user association

5. **Category** (`category.modal.js`)
   - Category hierarchy, images, SEO

6. **Coupon** (`coupon.model.js`)
   - Discount codes, rules, usage tracking

7. **GiftCard** (`giftCard.model.js`)
   - Gift card codes, balances, usage history

8. **Address** (`address.model.js`)
   - User addresses, shipping details

9. **Blog** (`blog.model.js`)
   - Blog posts, content, SEO

10. **Review** (`reviews.model.js.js`)
    - Product reviews, ratings

11. **MyList** (`myList.modal.js`)
    - User wishlists

12. **Visitor** (`visitor.model.js`)
    - Analytics tracking

13. **Notification** (`notification.model.js`)
    - User notifications

14. **Media** (`media.model.js`)
    - Media library items

15. **Logo** (`logo.model.js`)
    - Site logo management

16. **Banner Models**
    - `homeSlider.modal.js`
    - `bannerV1.model.js`
    - `bannerList2.model.js`

17. **Attribute Models**
    - `attribute.model.js`
    - `attributeValue.model.js`
    - `productVariation.model.js`
    - `productRAMS.js`
    - `productSIZE.js`
    - `productWEIGHT.js`

---

## 🔌 API Endpoints

### Product Endpoints
- `GET /api/product/getAllProducts` - Get all products
- `GET /api/product/getAllProductsByCatId/:id` - Get products by category
- `GET /api/product/:id` - Get single product
- `POST /api/product/create` - Create product (auth required)
- `PUT /api/product/:id` - Update product (auth required)
- `DELETE /api/product/:id` - Delete product (auth required)
- `POST /api/product/uploadImages` - Upload product images
- `POST /api/product/filters` - Filter products
- `POST /api/product/search` - Search products
- `POST /api/product/sortBy` - Sort products

### Order Endpoints
- `GET /api/order` - Get user orders (auth required)
- `POST /api/order/create` - Create order (optional auth - guest checkout)
- `GET /api/order/:id` - Get order details
- `PUT /api/order/:id/status` - Update order status (admin)
- `PUT /api/order/:id/cancel` - Cancel order

### Cart Endpoints
- `GET /api/cart` - Get cart items (auth required)
- `POST /api/cart/add` - Add to cart (auth required)
- `PUT /api/cart/:id` - Update cart item (auth required)
- `DELETE /api/cart/:id` - Remove from cart (auth required)
- `DELETE /api/cart` - Clear cart (auth required)

### User Endpoints
- `POST /api/user/register` - Register user
- `POST /api/user/login` - Login
- `POST /api/user/logout` - Logout
- `GET /api/user/getUserDetails` - Get user details (auth required)
- `PUT /api/user/update` - Update user (auth required)
- `POST /api/user/forgot-password` - Forgot password
- `POST /api/user/reset-password` - Reset password
- `POST /api/user/verify-email` - Verify email
- `POST /api/user/refresh-token` - Refresh JWT token

### Category Endpoints
- `GET /api/category` - Get all categories
- `POST /api/category/create` - Create category (admin)
- `PUT /api/category/:id` - Update category (admin)
- `DELETE /api/category/:id` - Delete category (admin)

### Coupon Endpoints
- `GET /api/coupon` - Get all coupons (admin)
- `POST /api/coupon/create` - Create coupon (admin)
- `POST /api/coupon/apply` - Apply coupon code
- `PUT /api/coupon/:id` - Update coupon (admin)
- `DELETE /api/coupon/:id` - Delete coupon (admin)

### Gift Card Endpoints
- `GET /api/giftCard` - Get all gift cards (admin)
- `POST /api/giftCard/create` - Create gift card (admin)
- `POST /api/giftCard/apply` - Apply gift card code
- `PUT /api/giftCard/:id` - Update gift card (admin)

### Shipping Endpoints
- `POST /api/shipping/rates` - Get shipping rates
- `GET /api/shipping/regions` - Get shipping regions

### Payment Endpoints
- `POST /api/stripe/create-payment-intent` - Create Stripe payment intent
- `GET /api/stripe/health` - Stripe health check
- `GET /api/stripe/account-info` - Get Stripe account info

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/visitors` - Get visitor analytics
- `GET /api/analytics/orders` - Get order analytics

### Address Endpoints
- `GET /api/address` - Get user addresses (auth required)
- `POST /api/address/create` - Create address (auth required)
- `PUT /api/address/:id` - Update address (auth required)
- `DELETE /api/address/:id` - Delete address (auth required)

### Blog Endpoints
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get blog post
- `POST /api/blog/create` - Create blog (admin)
- `PUT /api/blog/:id` - Update blog (admin)
- `DELETE /api/blog/:id` - Delete blog (admin)

### Media Endpoints
- `GET /api/media` - Get media library
- `POST /api/media/upload` - Upload media
- `DELETE /api/media/:id` - Delete media

---

## 👨‍💼 Admin Panel Features

### Dashboard
- ✅ Overview statistics (orders, products, users, reviews)
- ✅ Recent orders
- ✅ Product management
- ✅ Charts and analytics
- ✅ Quick actions

### Product Management
- ✅ Create/Edit/Delete products
- ✅ Simple product creation
- ✅ Variable product creation
- ✅ Product variations management
- ✅ Bulk operations
- ✅ Product status management
- ✅ Image management
- ✅ SEO management

### Order Management
- ✅ View all orders
- ✅ Order details
- ✅ Update order status
- ✅ Order search and filtering
- ✅ Order cancellation
- ✅ Tracking number management

### User Management
- ✅ View all users
- ✅ User details
- ✅ User status management
- ✅ User roles

### Category Management
- ✅ Create/Edit/Delete categories
- ✅ Sub-category management
- ✅ Third-level category management
- ✅ Category hierarchy

### Coupon Management
- ✅ Create/Edit/Delete coupons
- ✅ Coupon rules configuration
- ✅ Usage tracking

### Gift Card Management
- ✅ Create/Edit/Delete gift cards
- ✅ Balance management
- ✅ Usage tracking

### Banner Management
- ✅ Home slider banners
- ✅ Banner V1 management
- ✅ Banner List 2 management
- ✅ Responsive banner management

### Blog Management
- ✅ Create/Edit/Delete blog posts
- ✅ Blog SEO

### Analytics
- ✅ Dashboard analytics
- ✅ Visitor analytics
- ✅ Order analytics
- ✅ Product analytics

### Settings
- ✅ Logo management
- ✅ Profile management
- ✅ Password change

---

## 🛒 Client Features

### Home Page
- ✅ Hero slider banners
- ✅ Featured products
- ✅ Category showcase
- ✅ Promotional banners
- ✅ Product listings

### Product Pages
- ✅ Product listing (grid/list view)
- ✅ Product detail page
- ✅ Product images (zoom, gallery)
- ✅ Product variations selection
- ✅ Add to cart
- ✅ Add to wishlist
- ✅ Product reviews and ratings
- ✅ Related products
- ✅ Product filtering
- ✅ Product sorting

### Shopping Cart
- ✅ View cart items
- ✅ Update quantities
- ✅ Remove items
- ✅ Apply coupon codes
- ✅ Apply gift cards
- ✅ Calculate totals
- ✅ Proceed to checkout

### Checkout
- ✅ Shipping address selection/entry
- ✅ Shipping method selection
- ✅ Payment method selection
- ✅ Order review
- ✅ Discount application
- ✅ Order placement
- ✅ Guest checkout support

### User Account
- ✅ Dashboard
- ✅ Order history
- ✅ Order tracking
- ✅ Address management
- ✅ Profile management
- ✅ Wishlist/My List
- ✅ Password change

### Search
- ✅ Algolia-powered search
- ✅ Search suggestions
- ✅ Search results page
- ✅ Search filtering

### Other Pages
- ✅ About Us
- ✅ Blog listing and detail
- ✅ FAQ
- ✅ Shipping Information
- ✅ Return & Refund Policy
- ✅ Privacy Policy
- ✅ Terms of Use
- ✅ Support Center
- ✅ Contact information
- ✅ How to Order
- ✅ How to Track
- ✅ Partner With Us

---

## 💳 Payment & Shipping

### Payment Integration
- **Stripe**: Fully integrated with payment intents
- **PayPal**: SDK configured
- **Credit Cards**: Visa, MasterCard, American Express
- **Security**: PCI DSS compliant, SSL encryption

### Shipping Integration
- **EasyPost**: Integrated for Canada Post
- **Region Calculator**: Custom shipping calculator
- **Zones**: 8 shipping zones (Canada, USA, Europe, Asia, Oceania, South America, Africa, Middle East)
- **Features**: Distance-based, weight-based, quantity-based pricing

---

## 🔐 Security & Authentication

### Authentication
- ✅ JWT-based authentication
- ✅ Access tokens and refresh tokens
- ✅ Token refresh mechanism
- ✅ Password hashing (bcrypt)
- ✅ Email verification (OTP)
- ✅ Password reset flow
- ✅ Google OAuth integration

### Security Features
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ Rate limiting (via middleware)
- ✅ Secure file uploads
- ✅ Environment variable management

---

## 📊 Additional Features

### Multi-Vendor Support (Partially Implemented)
- ✅ Vendor model structure
- ✅ Vendor application flow
- ✅ Vendor approval system
- ✅ Vendor dashboard (UI created)
- ✅ Product-vendor association
- ✅ Order-vendor management
- ⚠️ Note: Vendor routes were removed from client App.jsx (needs restoration)

### Email System
- ✅ Order confirmation emails
- ✅ Order status update emails
- ✅ Email verification
- ✅ Password reset emails
- ✅ Admin notifications
- ✅ SendGrid integration
- ✅ Nodemailer fallback

### File Management
- ✅ Cloudinary integration
- ✅ Image optimization
- ✅ Multiple file uploads
- ✅ Media library

### SEO Features
- ✅ Product SEO fields
- ✅ Category SEO
- ✅ Blog SEO
- ✅ Meta tags
- ✅ Structured data

---

## 🚀 Deployment

### Current Deployment
- **Backend**: Render.com
- **Frontend**: Vercel (client)
- **Admin**: Separate deployment
- **Database**: MongoDB Atlas (assumed)

### Configuration Files
- `render.yaml` - Render deployment config
- `vercel.json` - Vercel deployment config
- Environment variables for API keys, database, etc.

---

## 📝 Notes

### Known Limitations
1. **Vendor System**: Routes removed from client App.jsx - needs restoration
2. **Search**: Algolia configured but may need API key setup
3. **Multi-currency**: Supported in models but may need frontend implementation
4. **Inventory**: Endless stock option available

### Future Enhancements
- Complete multi-vendor marketplace
- Advanced analytics dashboard
- Email marketing integration
- SMS notifications
- Mobile app (React Native)
- Advanced reporting
- Inventory alerts
- Automated order processing

---

## 📞 Support & Documentation

- API Documentation: Available in Postman collection (`Postman_Collection.json`)
- Environment Setup: `server/ENV_SETUP.md`
- Code Structure: Well-organized MVC pattern

---

**Last Updated**: Based on current codebase analysis
**Version**: 2.0
**Status**: Production-ready with ongoing enhancements

