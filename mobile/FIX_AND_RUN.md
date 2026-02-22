# 🔧 Fix Metro Error & Run App

## ❌ **The Problem**

You manually installed Metro packages which conflict with Expo's built-in Metro.

## ✅ **The Fix**

### **Step 1: Remove Manual Metro Packages**

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile
npm uninstall metro metro-cache metro-config metro-resolver metro-runtime
```

### **Step 2: Clean Everything**

```powershell
# Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear npm cache
npm cache clean --force
```

### **Step 3: Reinstall (Expo will handle Metro)**

```powershell
npm install
```

### **Step 4: Start Expo**

```powershell
npm start
```

---

## 🎯 **Alternative: Use Bare React Native (If Expo Still Fails)**

Since you have Android Studio, we can use **bare React Native** instead:

### **Option A: Generate Native Folders**

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Install React Native CLI
npm install -g react-native-cli

# Generate Android/iOS folders (if missing)
npx react-native init TempProject --skip-install
# Copy android/ and ios/ folders to mobile/
# Then delete TempProject
```

### **Option B: Use React Native CLI Directly**

```powershell
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

---

## 🚀 **Quick Fix Commands (Copy & Paste)**

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Remove problematic packages
npm uninstall metro metro-cache metro-config metro-resolver metro-runtime

# Clean
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force

# Reinstall
npm install

# Start
npm start
```

---

## 📱 **Run on Android Studio**

Once Expo starts:

1. **Open Android Studio**
2. **Start an emulator** (AVD Manager → Start)
3. **In Expo terminal, press `a`**
4. **App will open in emulator!**

---

## 🔄 **If Still Not Working: Switch to Bare React Native**

I can convert the app to bare React Native which works directly with Android Studio. Just let me know!

