# 🚀 Quick Start Guide

## ✅ **Everything is Ready!**

Your backend is live at: **https://zuba-api.onrender.com**

---

## 📱 **1. RUN ADMIN PANEL** (Web Dashboard)

### Option A: Use the batch file (Windows)
Double-click: **`start-admin.bat`**

### Option B: Manual commands
```bash
cd admin
npm install          # First time only
npm run dev
```

**Then open:** http://localhost:5173

**Login with your admin credentials**

---

## 📱 **2. RUN MOBILE APP**

### Step 1: Start Metro Bundler
Open **Terminal 1**:
```bash
cd mobile
npm install          # First time only
npm start
```

### Step 2: Run on Android
Open **Terminal 2**:
```bash
cd mobile
npm run android
```

**OR use the batch file:** Double-click **`start-mobile-android.bat`**

### Step 3: Run on iOS (Mac only)
```bash
cd mobile
cd ios && pod install && cd ..
npm run ios
```

---

## 🔧 **CONFIGURATION CHECK**

### ✅ Admin Panel
- **API URL:** Already configured to `https://zuba-api.onrender.com`
- **Location:** `admin/src/utils/api.js` uses `VITE_API_URL`
- **Environment:** Create `admin/.env` if needed:
  ```
  VITE_API_URL=https://zuba-api.onrender.com
  ```

### ✅ Mobile App
- **API URL:** Already configured to `https://zuba-api.onrender.com`
- **Location:** `mobile/src/constants/config.ts`
- **No .env needed** - hardcoded in config

---

## 🧪 **TEST THE APPS**

### Admin Panel Test:
1. ✅ Open http://localhost:5173
2. ✅ Login with admin account
3. ✅ Check Dashboard loads
4. ✅ Try creating a product
5. ✅ View orders

### Mobile App Test:
1. ✅ App opens on device/emulator
2. ✅ See login screen
3. ✅ Register new account
4. ✅ Browse products
5. ✅ Add to cart
6. ✅ View cart

---

## 🐛 **COMMON ISSUES**

### Admin Panel won't start:
```bash
cd admin
rm -rf node_modules
npm install
npm run dev
```

### Mobile app won't build:
```bash
cd mobile
npm start -- --reset-cache
# In another terminal:
npm run android
```

### API connection errors:
- ✅ Backend is live at https://zuba-api.onrender.com
- ✅ Check internet connection
- ✅ Check browser/device console for errors

---

## 📋 **WHAT'S INCLUDED**

### Admin Panel Features:
- ✅ Product Management
- ✅ Category Management
- ✅ Order Management
- ✅ User Management
- ✅ Analytics Dashboard
- ✅ Vendor Management
- ✅ Banner Management

### Mobile App Features:
- ✅ User Authentication
- ✅ Product Browsing
- ✅ Product Search
- ✅ Shopping Cart
- ✅ Product Details
- ✅ User Profile

---

## 🎯 **NEXT STEPS**

1. **Run Admin Panel** - Manage your store
2. **Run Mobile App** - Test customer experience
3. **Create Products** - Add products via admin
4. **Test Flow** - Browse products in mobile app
5. **Place Order** - Test checkout (when implemented)

---

## 💡 **TIPS**

- Keep Metro bundler running while developing mobile app
- Use hot reload in admin panel (automatic)
- Check backend logs if API calls fail
- Use browser DevTools for admin panel debugging
- Use React Native Debugger for mobile app

---

**Ready to go!** 🚀


