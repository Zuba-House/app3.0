# 🚀 QUICK FIX - Run These Commands

## ❌ **ERRORS FOUND:**
1. Missing `expo-device` package
2. Package version incompatibilities

---

## ✅ **FIX - Run This:**

### **Option 1: Double-click batch file (EASIEST)**
1. Go to `mobile` folder
2. Double-click `install-fix.bat`
3. Wait for installation to complete
4. Then run: `npm run start:lan`

### **Option 2: Manual commands**
```bash
cd mobile

# Install missing package
npm install expo-device

# Fix package versions  
npm install expo-notifications@~0.32.16 react-native-worklets@0.5.1

# Start Expo
npm run start:lan
```

---

## 🔧 **IF STILL TIMING OUT:**

### **Use Tunnel Mode:**
```bash
cd mobile
npm run start:tunnel
```

This works even on different networks (takes 30-60 seconds to setup).

---

## ✅ **After Installation:**

1. **Start Expo:**
   ```bash
   npm run start:lan
   ```

2. **Scan QR code** with Expo Go app on iPhone

3. **If timeout, use tunnel:**
   ```bash
   npm run start:tunnel
   ```

---

**The missing packages will be installed and the app should work!** 🎉
