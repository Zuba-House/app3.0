# 🚀 Complete Setup Guide - Run Everything

## ✅ **What's Fixed**

I've converted your mobile app to **Expo** (easier to run, no native folders needed).

---

## 📱 **1. RUN ADMIN PANEL**

```bash
cd admin
npm install
npm run dev
```

**Open:** http://localhost:5173

---

## 📱 **2. RUN MOBILE APP (Expo)**

### **Step 1: Install Dependencies**

```bash
cd mobile
npm install
```

### **Step 2: Install Expo CLI**

```bash
npm install -g expo-cli
```

### **Step 3: Start Expo**

```bash
npm start
```

**You'll see a QR code!**

### **Step 4: Run on Your Phone** ⭐ (EASIEST)

1. Install **Expo Go** app:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Make sure phone and computer are on **same WiFi**

3. Scan the QR code with Expo Go app

4. App will load on your phone!

### **Step 5: OR Run on Emulator**

**Android:**
- Open Android Studio
- Start emulator
- In Expo terminal, press **`a`**

**iOS (Mac only):**
- In Expo terminal, press **`i`**

---

## 🔧 **Quick Commands Reference**

### Admin Panel
```bash
cd admin
npm run dev
```

### Mobile App
```bash
cd mobile
npm start          # Start Expo
npm run android    # Start + Android
npm run ios        # Start + iOS
```

---

## ✅ **Verification**

### Backend
- ✅ Live at: https://zuba-api.onrender.com

### Admin Panel
- ✅ Runs at: http://localhost:5173
- ✅ Connected to backend

### Mobile App
- ✅ Expo server running
- ✅ QR code visible
- ✅ App opens on device/emulator
- ✅ Connected to backend

---

## 🐛 **If Something Doesn't Work**

### Mobile app won't start:
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Expo not found:
```bash
npm install -g expo-cli
```

### Can't connect to backend:
- Check: https://zuba-api.onrender.com
- Verify API URL in `mobile/src/constants/config.ts`

---

## 📋 **Complete Checklist**

- [ ] Node.js installed
- [ ] Admin dependencies installed
- [ ] Mobile dependencies installed
- [ ] Expo CLI installed globally
- [ ] Admin panel runs (`npm run dev`)
- [ ] Mobile app runs (`npm start`)
- [ ] Expo Go installed on phone (for physical device)
- [ ] Android emulator running (for emulator)
- [ ] Both apps connect to backend

---

## 🎯 **Test Everything**

1. **Admin Panel:**
   - Login
   - Create a product
   - View dashboard

2. **Mobile App:**
   - Register/Login
   - Browse products
   - Add to cart
   - View cart

3. **Integration:**
   - Create product in admin
   - See it in mobile app
   - Place order in mobile
   - See order in admin

---

**Everything is ready! Start with `npm start` in the mobile folder!** 🚀

