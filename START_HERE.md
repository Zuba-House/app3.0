# 🚀 START HERE - Run Admin Panel & Mobile App

## ✅ **Everything is Fixed and Ready!**

Your mobile app is now **Expo-based** (easier to run, no native folders needed).

---

## 📱 **QUICK START**

### **1. Admin Panel** (Web Dashboard)

```bash
cd admin
npm install          # First time only
npm run dev
```

**Open:** http://localhost:5173

---

### **2. Mobile App** (Expo)

```bash
cd mobile
npm install          # First time only
npm install -g expo-cli   # Install Expo CLI globally
npm start            # Start Expo server
```

**Then:**
- **Option A:** Scan QR code with **Expo Go** app on your phone (easiest!)
- **Option B:** Press **`a`** if Android emulator is running
- **Option C:** Press **`i`** if iOS simulator is running (Mac only)

---

## 🎯 **What Changed**

✅ Converted to **Expo** (no android/ios folders needed)  
✅ Updated all image components to use `expo-image`  
✅ Fixed package.json scripts  
✅ Added `app.json` for Expo config  
✅ Updated `babel.config.js` for Expo  
✅ Updated `index.js` for Expo  

---

## 📋 **Complete Setup Steps**

### **Step 1: Install Node.js** (if not installed)
Download from: https://nodejs.org

### **Step 2: Install Dependencies**

**Admin:**
```bash
cd admin
npm install
```

**Mobile:**
```bash
cd mobile
npm install
npm install -g expo-cli
```

### **Step 3: Run Admin Panel**
```bash
cd admin
npm run dev
```

### **Step 4: Run Mobile App**
```bash
cd mobile
npm start
```

### **Step 5: Open on Device**
- Install **Expo Go** on your phone
- Scan QR code
- App loads!

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
- ✅ App opens on device
- ✅ Connected to backend

---

## 🐛 **Troubleshooting**

### "expo: command not found"
```bash
npm install -g expo-cli
```

### "Cannot connect to backend"
- Check: https://zuba-api.onrender.com
- Verify API URL in `mobile/src/constants/config.ts`

### App shows blank screen
- Check Expo terminal for errors
- Shake device → "Show Dev Menu" → "Reload"

### Module errors
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

---

## 📱 **Using Batch Files (Windows)**

- **`start-admin.bat`** - Run admin panel
- **`start-mobile.bat`** - Start Expo server
- **`start-mobile-android.bat`** - Start Expo + Android

---

## 🎯 **Test Checklist**

- [ ] Admin panel opens
- [ ] Can login to admin
- [ ] Mobile app opens on device
- [ ] Can register/login in mobile app
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Backend connection works

---

**Everything is ready! Just run the commands above!** 🚀

