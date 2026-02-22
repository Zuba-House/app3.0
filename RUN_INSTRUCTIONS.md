# 🚀 How to Run Admin Panel & Mobile App

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- For mobile: React Native CLI, Android Studio (Android) or Xcode (iOS)

---

## 📱 **1. RUN ADMIN PANEL**

### Step 1: Navigate to admin directory
```bash
cd admin
```

### Step 2: Install dependencies (if not already installed)
```bash
npm install
```

### Step 3: Check environment variable
The admin panel needs `VITE_API_URL` set to your backend URL.

**Already configured:** `https://zuba-api.onrender.com`

If you need to change it, edit `admin/.env`:
```env
VITE_API_URL=https://zuba-api.onrender.com
```

### Step 4: Start the admin panel
```bash
npm run dev
```

The admin panel will start at: **http://localhost:5173** (or the port shown in terminal)

### Step 5: Access Admin Panel
1. Open browser: `http://localhost:5173`
2. Login with your admin credentials
3. You should see the admin dashboard

---

## 📱 **2. RUN MOBILE APP**

### Step 1: Navigate to mobile directory
```bash
cd mobile
```

### Step 2: Install dependencies (if not already installed)
```bash
npm install
```

### Step 3: Check environment variable
The mobile app API URL is already configured in `mobile/src/constants/config.ts`:
```typescript
export const API_URL = 'https://zuba-api.onrender.com';
```

### Step 4: Start Metro Bundler
Open a new terminal and run:
```bash
cd mobile
npm start
```

### Step 5: Run on Android
In another terminal:
```bash
cd mobile
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator running OR physical device connected
- USB debugging enabled (for physical device)

### Step 6: Run on iOS (Mac only)
```bash
cd mobile
cd ios && pod install && cd ..
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator or physical device
- CocoaPods installed

---

## 🔧 **TROUBLESHOOTING**

### Admin Panel Issues

**Port already in use:**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill
```

**API connection errors:**
- Check backend is running at https://zuba-api.onrender.com
- Check browser console for errors
- Verify `VITE_API_URL` in `.env` file

**CORS errors:**
- Backend should allow requests from `http://localhost:5173`
- Check backend CORS configuration

### Mobile App Issues

**Metro bundler won't start:**
```bash
# Clear cache
npm start -- --reset-cache
```

**Android build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS build fails:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**API connection errors:**
- Check backend is running at https://zuba-api.onrender.com
- Check device/emulator has internet connection
- Verify API_URL in `src/constants/config.ts`

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📋 **QUICK START COMMANDS**

### Admin Panel
```bash
cd admin
npm install
npm run dev
# Open http://localhost:5173
```

### Mobile App
```bash
cd mobile
npm install
npm start        # Terminal 1: Metro bundler
npm run android  # Terminal 2: Run Android
# OR
npm run ios      # Terminal 2: Run iOS
```

---

## 🌐 **BACKEND STATUS**

Your backend is live at: **https://zuba-api.onrender.com**

Check if it's running:
```bash
curl https://zuba-api.onrender.com
```

Should return:
```json
{"message":"Server is running on port 8000","status":"healthy","timestamp":"..."}
```

---

## ✅ **VERIFICATION CHECKLIST**

### Admin Panel
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file exists with `VITE_API_URL`
- [ ] `npm run dev` starts successfully
- [ ] Can access http://localhost:5173
- [ ] Can login to admin panel
- [ ] Can see dashboard

### Mobile App
- [ ] Dependencies installed (`npm install`)
- [ ] API URL configured in `src/constants/config.ts`
- [ ] Metro bundler starts (`npm start`)
- [ ] App builds successfully
- [ ] App runs on device/emulator
- [ ] Can see login screen
- [ ] Can register/login
- [ ] Can browse products

---

## 🎯 **NEXT STEPS**

Once both are running:

1. **Test Admin Panel:**
   - Create a product
   - Manage categories
   - View orders
   - Check analytics

2. **Test Mobile App:**
   - Register new user
   - Browse products
   - Add to cart
   - View cart

3. **Integration Test:**
   - Create product in admin
   - See it appear in mobile app
   - Place order in mobile app
   - See order in admin panel

---

## 📞 **NEED HELP?**

If you encounter issues:
1. Check the error messages in terminal/console
2. Verify backend is running
3. Check environment variables
4. Clear caches and reinstall dependencies
5. Check network connectivity

Happy coding! 🚀


