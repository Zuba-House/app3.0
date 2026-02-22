# Vendor Panel System - Complete Implementation Guide

## 📋 Overview

This document outlines the complete vendor panel system implementation, including:
- Database models (additive, non-breaking)
- Backend API endpoints
- Frontend structure
- Integration points

---

## 🗄️ Database Models

### New Models Created

1. **`server/models/vendor.model.js`** ✅
   - Complete vendor profile
   - Commission settings
   - Payout information
   - Store stats and balances
   - SEO fields

2. **`server/models/payout.model.js`** ✅
   - Payout requests
   - Status tracking
   - Payment method snapshots

### Updated Models (Additive Only)

1. **`server/models/product.model.js`** ✅
   - Added: `productOwnerType` (PLATFORM/VENDOR)
   - Added: `approvalStatus` (APPROVED/PENDING_REVIEW/REJECTED)
   - Added: Commission override fields

2. **`server/models/order.model.js`** ✅
   - Enhanced product items with commission/earnings
   - Added: `vendorSummary` array for finance tracking
   - Updated: `vendorStatus` enum values

3. **`server/models/coupon.model.js`** ✅
   - Added: `vendor` reference
   - Added: `scope` (GLOBAL/VENDOR)

4. **`server/models/user.model.js`** ✅
   - Already has: `role`, `vendorId` (no changes needed)

---

## 🔐 Middleware

### Created: `server/middlewares/vendorAuth.js`

- **`requireVendor`**: Requires authenticated vendor with APPROVED status
- **`optionalVendor`**: Optional vendor context (for onboarding)

---

## 🛣️ Backend Routes Structure

### Vendor Routes: `server/route/vendor.route.js`

```javascript
// All routes prefixed with /api/vendor
// All protected with requireVendor middleware

// Profile & Dashboard
GET    /api/vendor/me
PUT    /api/vendor/me
GET    /api/vendor/dashboard

// Products
GET    /api/vendor/products
POST   /api/vendor/products
GET    /api/vendor/products/:id
PUT    /api/vendor/products/:id
DELETE /api/vendor/products/:id

// Orders
GET    /api/vendor/orders
GET    /api/vendor/orders/:id
PUT    /api/vendor/orders/:id/status
PUT    /api/vendor/orders/:id/tracking

// Finance
GET    /api/vendor/finance/summary
GET    /api/vendor/payouts
POST   /api/vendor/payouts/request

// Coupons
GET    /api/vendor/coupons
POST   /api/vendor/coupons
GET    /api/vendor/coupons/:id
PUT    /api/vendor/coupons/:id
DELETE /api/vendor/coupons/:id

// Analytics
GET    /api/vendor/analytics

// Store Settings
GET    /api/vendor/store/profile
PUT    /api/vendor/store/profile
GET    /api/vendor/store/seo
PUT    /api/vendor/store/seo
```

### Public Vendor Routes (for application)

```javascript
// No auth required
POST   /api/vendor/apply          // Vendor application
GET    /api/vendor/application-status  // Check application status

// Auth required but vendor approval not needed
GET    /api/vendor/onboarding     // Onboarding data
POST   /api/vendor/onboarding     // Complete onboarding
```

---

## 🎨 Frontend Structure

### Vendor Panel: `vendor/` (New App)

```
vendor/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── routes/
│   │   └── index.jsx
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── VendorDashboardLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── onboarding/
│   │   │   └── VendorOnboarding.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardHome.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductBulkUpload.jsx
│   │   ├── orders/
│   │   │   ├── OrderList.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── shipping/
│   │   │   └── ShippingSettings.jsx
│   │   ├── finance/
│   │   │   ├── Earnings.jsx
│   │   │   └── Withdrawals.jsx
│   │   ├── coupons/
│   │   │   ├── VendorCoupons.jsx
│   │   │   └── CouponForm.jsx
│   │   ├── store/
│   │   │   ├── StoreProfile.jsx
│   │   │   └── StoreSEO.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticsOverview.jsx
│   │   ├── support/
│   │   │   └── SupportTickets.jsx
│   │   └── settings/
│   │       ├── AccountSettings.jsx
│   │       └── Notifications.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── OrderStatusChip.jsx
│   │   └── ConfirmDialog.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── auth.service.js
│   │   ├── vendor.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── coupon.service.js
│   │   └── payout.service.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useVendor.js
│   ├── context/
│   │   └── AuthContext.jsx
│   └── assets/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🔄 Integration Points

### 1. Order Creation Enhancement

**File**: `server/controllers/order.controller.js`

**Changes needed** (additive):
- After order creation, calculate vendor splits
- Populate `vendorSummary` array
- Update vendor balances when payment confirmed

### 2. Product Creation Enhancement

**File**: `server/controllers/product.controller.js`

**Changes needed** (additive):
- Auto-assign `vendorId` if user is vendor
- Set `productOwnerType = 'VENDOR'`
- Set `approvalStatus` based on settings

### 3. Coupon Application Enhancement

**File**: `server/services/discount.service.js`

**Changes needed** (additive):
- Check coupon `scope` (GLOBAL vs VENDOR)
- For vendor coupons, only apply to vendor's products
- Validate vendor coupon eligibility

---

## 📝 Next Steps

1. **Create vendor controllers** (`server/controllers/vendor.controller.js`)
2. **Create vendor routes** (`server/route/vendor.route.js`)
3. **Update order controller** (add vendor split logic)
4. **Update product controller** (vendor assignment)
5. **Create vendor frontend** (React app)
6. **Test with 1-2 vendors** before full rollout

---

## ⚠️ Safety Notes

- All model changes are **additive** with safe defaults
- Existing functionality remains unchanged
- Vendor features are opt-in (products default to PLATFORM)
- Backward compatible with existing orders/products

---

**Status**: Models and middleware created ✅
**Next**: Controllers and routes implementation

