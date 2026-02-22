# 🚀 Setup and Run Zuba Mobile App

## ✅ **What You Have**

- ✅ Expo-based React Native app
- ✅ Connected to backend: `https://zuba-api.onrender.com`
- ✅ All code ready

## 📋 **Step-by-Step Setup**

### **Step 1: Install Dependencies**

```bash
cd mobile
npm install
```

### **Step 2: Install Expo CLI (Global)**

```bash
npm install -g expo-cli
```

Verify:
```bash
expo --version
```

### **Step 3: Start the App**

```bash
npm start
```

**OR**

```bash
npx expo start
```

### **Step 4: Run on Device**

#### **Option A: Physical Phone (EASIEST)** ⭐

1. Install **Expo Go** from Play Store (Android) or App Store (iOS)
2. Make sure phone and computer are on **same WiFi**
3. Scan the QR code shown in terminal with Expo Go app
4. App will load on your phone!

#### **Option B: Android Emulator**

1. Open Android Studio
2. Start an emulator (AVD Manager)
3. In Expo terminal, press **`a`**
4. App will open in emulator

#### **Option C: iOS Simulator (Mac only)**

1. Make sure Xcode is installed
2. In Expo terminal, press **`i`**
3. App will open in iOS Simulator

---

## 🔧 **Quick Commands**

```bash
# Start Expo
npm start

# Start and open Android
npm run android

# Start and open iOS
npm run ios

# Start and open web
npm run web
```

---

## ✅ **Verification Checklist**

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Expo CLI installed (`expo --version`)
- [ ] Backend is live at https://zuba-api.onrender.com
- [ ] Expo server running (`npm start`)
- [ ] App opens on device/emulator

---

## 🐛 **Troubleshooting**

### **"expo: command not found"**
```bash
npm install -g expo-cli
```

### **"Cannot connect to backend"**
- Check backend is running: https://zuba-api.onrender.com
- Check internet connection
- Check API URL in `src/constants/config.ts`

### **App shows blank screen**
- Check Expo terminal for errors
- Check device console (shake device → "Show Dev Menu")
- Verify backend is accessible

### **Module not found errors**
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

---

## 🎯 **What to Test**

1. ✅ App opens successfully
2. ✅ Login screen appears
3. ✅ Can register new account
4. ✅ Can login
5. ✅ Can browse products
6. ✅ Can view product details
7. ✅ Can add to cart
8. ✅ Can view cart

---

## 📱 **Admin Panel (Separate)**

To run admin panel:

```bash
cd admin
npm install
npm run dev
# Open http://localhost:5173
```

---

**Everything is ready! Just run `npm start` in the mobile folder!** 🚀

