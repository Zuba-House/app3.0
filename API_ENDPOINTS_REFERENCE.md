# API Endpoints Quick Reference

## Base URL
All endpoints are prefixed with `/api`

Example: `https://your-api-url.com/api/user/login`

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/user/register` | No | Register new user |
| POST | `/api/user/login` | No | User login |
| POST | `/api/user/refresh-token` | No* | Refresh access token (*requires refreshToken) |
| POST | `/api/user/logout` | Yes | Logout user |
| GET | `/api/user/me` | Yes | Get current user profile |
| PUT | `/api/user/me` | Yes | Update user profile |
| GET | `/api/auth/debug` | No | Debug auth status |

---

## 📦 Product Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/product/getAllProducts` | No | List all products (with filters) |
| GET | `/api/product/:id` | No | Get product details |
| POST | `/api/product/create` | Yes (Admin) | Create new product |
| PUT | `/api/product/:id` | Yes (Admin) | Update product |
| DELETE | `/api/product/:id` | Yes (Admin) | Delete product |
| POST | `/api/product/:id/variations/generate` | Yes (Admin) | Generate product variations |

---

## 🛒 Cart Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/cart` | Yes | Get user's cart |
| POST | `/api/cart/add` | Yes | Add item to cart |
| PUT | `/api/cart/:id` | Yes | Update cart item quantity |
| DELETE | `/api/cart/:id` | Yes | Remove item from cart |
| DELETE | `/api/cart` | Yes | Clear entire cart |

---

## 📋 Order Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/order` | Yes | Get user's orders |
| GET | `/api/order/:id` | Yes | Get order details |
| POST | `/api/order/create` | Yes | Create new order |
| PUT | `/api/order/:id/status` | Yes (Admin) | Update order status |
| GET | `/api/orders/tracking/:id` | Yes | Track order |

---

## 🏷️ Category Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/category` | No | List all categories |
| GET | `/api/category/:id` | No | Get category details |
| POST | `/api/category` | Yes (Admin) | Create category |
| PUT | `/api/category/:id` | Yes (Admin) | Update category |
| DELETE | `/api/category/:id` | Yes (Admin) | Delete category |

---

## 👤 User Management Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/user` | Yes (Admin) | List all users |
| GET | `/api/user/:id` | Yes (Admin) | Get user details |
| PUT | `/api/user/:id` | Yes (Admin) | Update user |
| DELETE | `/api/user/:id` | Yes (Admin) | Delete user |

---

## 📍 Address Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/address` | Yes | Get user addresses |
| POST | `/api/address` | Yes | Add new address |
| PUT | `/api/address/:id` | Yes | Update address |
| DELETE | `/api/address/:id` | Yes | Delete address |

---

## 🛍️ Vendor Endpoints

### Public Endpoints
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/vendor/send-otp` | No | Send OTP for vendor registration |
| POST | `/api/vendor/verify-otp` | No | Verify OTP |
| POST | `/api/vendor/apply` | No | Apply to become vendor |
| POST | `/api/vendor/login` | No | Vendor login |
| POST | `/api/vendor/forgot-password` | No | Request password reset |
| POST | `/api/vendor/reset-password` | No | Reset password |
| GET | `/api/vendor/application-status/:email` | No | Check application status |

### Protected Endpoints (Vendor Auth Required)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/vendor/me` | Yes (Vendor) | Get vendor profile |
| PUT | `/api/vendor/me` | Yes (Vendor) | Update vendor profile |
| GET | `/api/vendor/dashboard` | Yes (Vendor) | Get dashboard stats |
| GET | `/api/vendor/products` | Yes (Vendor) | List vendor products |
| POST | `/api/vendor/products` | Yes (Vendor) | Create vendor product |
| GET | `/api/vendor/products/:id` | Yes (Vendor) | Get vendor product |
| PUT | `/api/vendor/products/:id` | Yes (Vendor) | Update vendor product |
| DELETE | `/api/vendor/products/:id` | Yes (Vendor) | Delete vendor product |
| GET | `/api/vendor/orders` | Yes (Vendor) | List vendor orders |
| GET | `/api/vendor/orders/:id` | Yes (Vendor) | Get vendor order |
| PUT | `/api/vendor/orders/:id/status` | Yes (Vendor) | Update order status |
| GET | `/api/vendor/finance` | Yes (Vendor) | Get finance data |
| GET | `/api/vendor/coupons` | Yes (Vendor) | List vendor coupons |
| POST | `/api/vendor/coupons` | Yes (Vendor) | Create vendor coupon |

---

## 🎫 Coupon & Discount Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/coupons` | No | List available coupons |
| GET | `/api/coupons/:code` | No | Validate coupon code |
| POST | `/api/coupons` | Yes (Admin) | Create coupon |
| PUT | `/api/coupons/:id` | Yes (Admin) | Update coupon |
| DELETE | `/api/coupons/:id` | Yes (Admin) | Delete coupon |
| GET | `/api/discounts` | No | List active discounts |
| POST | `/api/discounts` | Yes (Admin) | Create discount |

---

## 💳 Payment Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/stripe/create-payment-intent` | Yes | Create Stripe payment intent |
| POST | `/api/stripe/webhook` | No* | Stripe webhook (*requires Stripe signature) |
| POST | `/api/payment/paypal/create` | Yes | Create PayPal payment |
| POST | `/api/payment/paypal/capture` | Yes | Capture PayPal payment |

---

## 🚚 Shipping Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/shipping/rates` | Yes | Calculate shipping rates |
| POST | `/api/shipping/create` | Yes (Admin) | Create shipping method |
| GET | `/api/shipping` | No | List shipping methods |

---

## 📸 Media Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/media/upload` | Yes | Upload image/file |
| DELETE | `/api/media/:id` | Yes (Admin) | Delete media |
| GET | `/api/media/:id` | No | Get media details |

---

## 🔍 Attribute & Variation Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/attributes` | No | List all attributes |
| POST | `/api/attributes` | Yes (Admin) | Create attribute |
| PUT | `/api/attributes/:id` | Yes (Admin) | Update attribute |
| DELETE | `/api/attributes/:id` | Yes (Admin) | Delete attribute |
| GET | `/api/products/:id/variations` | No | Get product variations |
| POST | `/api/products/:id/variations` | Yes (Admin) | Create variation |
| PUT | `/api/products/:id/variations/:variationId` | Yes (Admin) | Update variation |
| DELETE | `/api/products/:id/variations/:variationId` | Yes (Admin) | Delete variation |

---

## 📊 Analytics Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/analytics/visitors` | Yes (Admin) | Get visitor analytics |
| GET | `/api/analytics/sales` | Yes (Admin) | Get sales analytics |
| GET | `/api/analytics/products` | Yes (Admin) | Get product analytics |

---

## 🔖 Wishlist (MyList) Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/myList` | Yes | Get user's wishlist |
| POST | `/api/myList/add` | Yes | Add product to wishlist |
| DELETE | `/api/myList/:id` | Yes | Remove from wishlist |

---

## 📝 Blog Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/blog` | No | List blog posts |
| GET | `/api/blog/:id` | No | Get blog post |
| POST | `/api/blog` | Yes (Admin) | Create blog post |
| PUT | `/api/blog/:id` | Yes (Admin) | Update blog post |
| DELETE | `/api/blog/:id` | Yes (Admin) | Delete blog post |

---

## 🎨 Banner & Slider Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/banners` | No | List banners |
| GET | `/api/homeSlides` | No | List home slider images |
| POST | `/api/banners` | Yes (Admin) | Create banner |
| PUT | `/api/banners/:id` | Yes (Admin) | Update banner |
| DELETE | `/api/banners/:id` | Yes (Admin) | Delete banner |

---

## 🔍 SEO Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/seo/sitemap.xml` | No | Get sitemap |
| GET | `/api/seo/robots.txt` | No | Get robots.txt |
| GET | `/api/seo/product-feed` | No | Get product feed (RSS/XML) |

---

## 🎁 Gift Card Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/gift-cards` | Yes | List user's gift cards |
| POST | `/api/gift-cards` | Yes (Admin) | Create gift card |
| POST | `/api/gift-cards/redeem` | Yes | Redeem gift card |
| GET | `/api/gift-cards/:code` | Yes | Check gift card balance |

---

## 📱 Request Headers

### Authentication Header
```
Authorization: Bearer <accessToken>
```

### Content Type
```
Content-Type: application/json
```

For file uploads, don't set Content-Type (let browser/app set it with boundary).

---

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "error": false,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": true,
  "message": "Error description",
  "details": { ... }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": true,
  "message": "Authentication token required" | "Invalid token" | "Token expired"
}
```

---

## 🔄 Token Refresh Flow

1. **Initial Login**: Returns `accessToken` and `refreshToken`
2. **Store Tokens**: Save both in localStorage/AsyncStorage
3. **API Requests**: Include `accessToken` in `Authorization` header
4. **Token Expired**: When you get 401 error
5. **Refresh Token**: POST to `/api/user/refresh-token` with `refreshToken`
6. **New Access Token**: Save new `accessToken` and retry original request

---

## 🧪 Testing Endpoints

### Health Check
```
GET /api/health
```

### Debug Auth
```
GET /api/auth/debug
```

---

## 📝 Notes for Mobile Development

1. **All endpoints work with mobile apps** - No changes needed
2. **Use same authentication flow** - JWT tokens work the same way
3. **File uploads** - Use FormData (same as web)
4. **Error handling** - Check for 401/403 for auth errors
5. **Token storage** - Use AsyncStorage (React Native) or SecureStorage
6. **Base URL** - Set in environment variables

---

## 🔗 Related Documentation

- See `ARCHITECTURE_OVERVIEW.md` for complete architecture details
- See `ECOMMERCE_ARCHITECTURE_AND_FEATURES.md` for feature documentation

