# 📱 How to See New UI on Mobile App

## ✅ **I've Updated the Mobile App Colors!**

The mobile app now uses the same color scheme as the web apps:
- **Dark Teal** (`#0b2735`) - Headers, text
- **Peach** (`#efb291`) - Prices, buttons, accents  
- **Cream** (`#e5e2db`) - Background

---

## 🚀 **Quick Start to See Changes**

### **Option 1: Use the Batch File**
1. **Double-click:** `mobile/restart-mobile.bat`
2. Wait for QR code
3. Scan with Expo Go (or press 'a' for Android)
4. **Shake device** → Tap "Reload"

### **Option 2: Manual Restart**
```bash
cd mobile
npm start -- --clear
# Press 'a' for Android emulator
# Or scan QR code with Expo Go
```

---

## 📱 **On Your Device**

### **To See the New UI:**

1. **Shake your device** (or press `Ctrl+M` on emulator)
2. **Tap "Reload"** in the menu
3. **Or:** Press `R` in the terminal

### **If Using Expo Go:**
- Shake device → Reload
- Or close and reopen Expo Go

---

## 🎨 **What You'll See**

### **New Design:**
- ✅ **Cream background** instead of white/gray
- ✅ **Dark teal text** instead of black
- ✅ **Peach prices** instead of green
- ✅ **More rounded corners** (16-24px)
- ✅ **Better shadows** on cards

### **Updated Screens:**
- ✅ Home screen with new colors
- ✅ Product cards with peach prices
- ✅ Login screen with cream background
- ✅ All buttons use dark teal

---

## 🔄 **If Changes Don't Show**

### **1. Hard Reload:**
- Shake device → Reload
- Or: Press `R` in terminal

### **2. Clear Cache:**
```bash
cd mobile
npx expo start --clear
```

### **3. Restart Everything:**
```bash
cd mobile
# Stop server (Ctrl+C)
# Delete .expo folder
rmdir /s /q .expo
npm start
```

---

## ✅ **Quick Checklist**

- [ ] Mobile app server is running
- [ ] App is open on device/emulator
- [ ] Shake device and reload
- [ ] See cream background
- [ ] See dark teal text
- [ ] See peach prices

---

## 🎯 **The Changes Are Ready!**

All the code is updated. Just:
1. **Restart the mobile app** (use batch file or manual)
2. **Reload on device** (shake → reload)
3. **See the new UI!** 🎨

**The new colors are now in the mobile app code!** 📱✨
