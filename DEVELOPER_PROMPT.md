# 🚀 Developer Prompt for Zuba House Mobile App

## Quick Start Prompt for New Developers

Copy and paste this prompt to help developers understand the project quickly:

---

## 📱 **Project: Zuba House Mobile App**

**Type**: React Native E-commerce App (Expo)
**Backend**: Shared with Zuba House website (`https://zuba-api.onrender.com`)
**Goal**: Create a TEMU-like shopping experience

---

## 🎯 **What You're Building**

A mobile shopping app where users can:
- Browse products by category and brand
- Search and filter products
- Add items to cart and wishlist
- Complete purchases (checkout flow needs implementation)
- Track orders
- Manage profile and addresses

---

## ✅ **What's Already Done**

### **Implemented Features:**
1. ✅ **Authentication** - Login, register, password reset
2. ✅ **Home Screen** - Product browsing, categories, brands, promotional banners
3. ✅ **Search** - TEMU-style search with category sidebar
4. ✅ **Product Details** - View products, add to cart/wishlist
5. ✅ **Brands Page** - Circular brand logos, brand filtering
6. ✅ **Cart** - Add/remove items, update quantities
7. ✅ **Wishlist** - Save/remove products
8. ✅ **Orders** - View order history
9. ✅ **Profile** - User account management
10. ✅ **Navigation** - Bottom tabs + stack navigation
11. ✅ **UI/UX** - Brand colors, smooth animations, responsive design

### **Backend Integration:**
- ✅ All API endpoints configured
- ✅ Authentication working
- ✅ Product fetching working
- ✅ Cart API ready
- ✅ Order API ready

---

## ❌ **What Needs to Be Built**

### **Critical (Must Have):**
1. **Checkout Flow** - Complete purchase process
   - Shipping address selection/entry
   - Shipping method selection
   - Payment method selection (Stripe/PayPal)
   - Order review
   - Coupon/gift card application
   - Order placement

2. **Address Management** - Add/edit/delete addresses
   - Address list screen
   - Add new address form
   - Edit address
   - Set default address

3. **Payment Integration** - Process payments
   - Stripe SDK integration
   - PayPal SDK integration
   - Payment confirmation handling

4. **Product Variations** - Handle size/color/etc.
   - Variation selection UI
   - Variation display
   - Stock validation

### **Important (Should Have):**
5. **Review Submission** - Let users write reviews
6. **Advanced Search** - Filters, sorting, autocomplete
7. **Push Notifications** - Order updates, promotions
8. **Order Tracking** - Detailed status tracking

### **Nice to Have (TEMU Features):**
9. **Gamification** - Daily check-in, points, rewards
10. **Social Features** - Share products, referrals
11. **Flash Sales** - Countdown timers, limited stock
12. **Personalization** - Recommendations, trending

---

## 🛠️ **Tech Stack**

- **React Native** 0.81.5 (Expo ~54.0.0)
- **TypeScript** 5.3.3
- **React Navigation** 6.x
- **Redux Toolkit** 2.0.1
- **Expo Image** for images
- **AsyncStorage** for local storage

---

## 📁 **Key Files**

### **Navigation:**
- `mobile/src/navigation/AppNavigator.tsx` - All screens and routes

### **API:**
- `mobile/src/constants/config.ts` - API URL and endpoints
- `mobile/src/services/api.ts` - Base API client
- `mobile/src/services/*.service.ts` - Feature-specific services

### **Screens:**
- `mobile/src/screens/Home/HomeScreen.tsx` - Main browsing
- `mobile/src/screens/Search/SearchScreen.tsx` - Search page
- `mobile/src/screens/Products/ProductDetailScreen.tsx` - Product details
- `mobile/src/screens/Cart/CartScreen.tsx` - Shopping cart

### **State:**
- `mobile/src/store/slices/authSlice.ts` - Auth state

### **Styling:**
- `mobile/src/constants/colors.ts` - Brand colors

---

## 🔌 **Backend API**

**Base URL**: `https://zuba-api.onrender.com`

**Key Endpoints:**
- Products: `GET /api/product/getAllProducts`
- Cart: `GET /api/cart`, `POST /api/cart/add`
- Orders: `GET /api/order`, `POST /api/order/create`
- Address: `GET /api/address`, `POST /api/address`
- Payment: `POST /api/stripe/create-payment-intent`

**Response Format:**
```json
{
  "success": true,
  "error": false,
  "data": {...},
  "message": "Success"
}
```

**Authentication:**
- JWT tokens (access + refresh)
- Header: `Authorization: Bearer <token>`
- Stored in AsyncStorage

---

## 🎨 **Design Guidelines**

### **Brand Colors:**
- **Primary**: `#0b2735` (Dark teal) - Headers, text, buttons
- **Secondary**: `#efb291` (Peach) - Prices, accents, active states
- **Tertiary**: `#e5e2db` (Cream) - Backgrounds, borders

### **UI Patterns:**
- Use existing component patterns
- Follow TEMU-style layouts (clean, minimalist)
- Smooth animations and transitions
- Responsive design (use Dimensions)
- Loading and empty states

---

## 🚀 **Getting Started**

### **1. Setup:**
```bash
cd mobile
npm install
```

### **2. Run:**
```bash
npm start
# Press 'a' for Android, 'i' for iOS
```

### **3. Test Backend:**
- Check: `https://zuba-api.onrender.com/api/health`
- Products: `https://zuba-api.onrender.com/api/product/getAllProducts`

---

## 📝 **Development Workflow**

### **Adding a Feature:**
1. Create screen in `mobile/src/screens/[Feature]/`
2. Add service method in `mobile/src/services/[feature].service.ts`
3. Add route in `AppNavigator.tsx`
4. Add TypeScript types
5. Style with brand colors
6. Test on device

### **API Integration:**
1. Check if endpoint exists in `config.ts`
2. Add service method
3. Call from screen/component
4. Handle loading/error states
5. Update Redux state if needed

---

## 🐛 **Common Issues**

1. **Products not loading?**
   - Check backend is running
   - Check API_URL in config.ts
   - Check network/CORS

2. **Navigation errors?**
   - Check route is in AppNavigator
   - Check TypeScript types match

3. **Styling issues?**
   - Use brand colors from colors.ts
   - Check responsive dimensions

---

## ✅ **Success Criteria**

Your work is complete when:
- ✅ Users can browse products
- ✅ Users can add to cart
- ✅ Users can complete checkout
- ✅ Users can make payments
- ✅ Users can track orders
- ✅ App is smooth and responsive
- ✅ Matches TEMU-like experience

---

## 📞 **Questions?**

- Check `ZUBA_HOUSE_APP_COMPREHENSIVE_SUMMARY.md` for full details
- Review existing code patterns
- Test API endpoints directly
- Check Expo/React Native docs

---

**Ready to code? Start with the checkout flow!** 🚀
