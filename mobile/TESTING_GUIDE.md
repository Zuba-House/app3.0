# 🧪 Testing Guide - Zuba Mobile App

## ✅ Setup Complete!

- **Node Version:** v20.11.1 ✅
- **Dependencies:** Installed ✅
- **Expo:** Starting... ✅

---

## 📱 How to Test the App

### Option 1: Android Emulator (Recommended for Development)

1. **Start Android Emulator:**
   - Open Android Studio
   - Go to AVD Manager (Tools → Device Manager)
   - Click ▶️ Start on your emulator
   - Wait for emulator to fully boot

2. **In Expo Terminal:**
   - Press `a` to launch on Android
   - Wait for build and install (first time takes 2-5 minutes)
   - App will open automatically

### Option 2: Physical Phone (Easiest & Fastest!)

1. **Install Expo Go:**
   - **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
   - **iOS:** https://apps.apple.com/app/expo-go/id982107779

2. **Connect:**
   - Make sure phone and computer are on **same WiFi network**
   - In Expo terminal, you'll see a **QR code**

3. **Scan QR Code:**
   - **Android:** Open Expo Go app → Tap "Scan QR code"
   - **iOS:** Open Camera app → Point at QR code → Tap notification

4. **App loads on your phone!** 🎉

### Option 3: Web Browser

- In Expo terminal, press `w`
- App opens in default browser
- Note: Some native features may not work on web

---

## 🧪 What to Test

### 1. Authentication ✅
- [ ] **Register Screen:**
  - Enter name, email, password
  - Submit registration
  - Should redirect to login or home

- [ ] **Login Screen:**
  - Enter email and password
  - Submit login
  - Should redirect to home screen
  - Token should be saved

- [ ] **Logout:**
  - Go to Profile screen
  - Tap logout
  - Should return to login screen

### 2. Home Screen ✅
- [ ] Products load from backend
- [ ] Product cards display correctly
- [ ] Images load (if available)
- [ ] Can scroll through products
- [ ] Tap product → Opens Product Detail screen

### 3. Product Detail Screen ✅
- [ ] Product information displays
- [ ] Images load
- [ ] Price, description visible
- [ ] "Add to Cart" button works
- [ ] "Add to Wishlist" button works (if implemented)

### 4. Cart Screen ✅
- [ ] Cart items display
- [ ] Can increase/decrease quantity
- [ ] Can remove items
- [ ] Total price calculates correctly
- [ ] "Checkout" button works (if implemented)

### 5. Profile Screen ✅
- [ ] User information displays
- [ ] Email, name visible
- [ ] Can view orders (if implemented)
- [ ] Can update profile (if implemented)

### 6. Navigation ✅
- [ ] Bottom tabs work (Home, Cart, Profile)
- [ ] Can navigate between screens
- [ ] Back button works
- [ ] Navigation state persists

### 7. Backend Connection ✅
- [ ] API calls succeed
- [ ] Products load from `https://zuba-api.onrender.com`
- [ ] Authentication works
- [ ] Cart syncs with backend
- [ ] No network errors

---

## 🐛 Common Issues & Fixes

### Issue: "Unable to resolve module"
**Fix:** 
```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile
npm install
```

### Issue: "Network request failed"
**Check:**
- Backend is live: https://zuba-api.onrender.com
- Internet connection
- API URL in `src/constants/config.ts`

### Issue: "Metro bundler not running"
**Fix:**
```powershell
npx expo start --clear
```

### Issue: "No devices found"
**For Emulator:**
- Make sure emulator is running
- Check: `adb devices` should show emulator

**For Phone:**
- Make sure on same WiFi
- Try: `npx expo start --tunnel`

### Issue: App shows blank screen
**Check:**
- Expo terminal for errors
- Browser console (if web)
- React Native debugger

---

## 📊 Expected Behavior

### On App Launch:
1. **If not logged in:** Shows Login screen
2. **If logged in:** Shows Home screen with products

### Navigation Flow:
```
Login → Register (optional)
  ↓
Home (Products List)
  ↓
Product Detail
  ↓
Add to Cart
  ↓
Cart Screen
  ↓
Checkout (if implemented)
```

---

## ✅ Success Criteria

The app is working correctly if:
- ✅ Can register new user
- ✅ Can login
- ✅ Products load from backend
- ✅ Can view product details
- ✅ Can add items to cart
- ✅ Cart updates correctly
- ✅ Can navigate between screens
- ✅ No crashes or errors
- ✅ Backend API calls succeed

---

## 🚀 Next Steps After Testing

Once everything works:
1. Test all features thoroughly
2. Check for any UI/UX improvements
3. Test on different devices/screen sizes
4. Test with slow network (throttle in DevTools)
5. Test error handling (disconnect network, etc.)

---

## 📝 Notes

- **First build takes longer** (2-5 minutes)
- **Subsequent builds are faster** (hot reload)
- **Changes reflect immediately** with hot reload
- **Backend must be running** for API calls to work

---

**Happy Testing! 🎉**

If you encounter any issues, share the error message and I'll help fix it!

