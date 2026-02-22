# 🔍 Mobile App Emulator Issues - Diagnostic & Fix Guide

## 📊 Current Status Check

### ✅ What's Working
- **Node Version**: v20.20.0 ✅ (Good - avoids `node:sea` error)
- **App Structure**: ✅ All files present and correct
- **Android Folder**: ✅ Native Android project exists
- **Dependencies**: ✅ Mostly installed
- **Backend API**: ✅ Configured to `https://zuba-api.onrender.com`

### ❌ Issues Found

#### **1. Expo Version Mismatch (CRITICAL)**
```
package.json specifies: "expo": "~50.0.0"
But installed version: expo@54.0.31
```

**Impact**: This can cause compatibility issues and prevent the app from running.

#### **2. Potential Issues**
- Version mismatch may cause dependency conflicts
- Metro bundler might not start correctly
- Android build might fail

---

## 🔧 Fix Steps

### **Step 1: Fix Expo Version Mismatch**

You have two options:

#### **Option A: Downgrade to Expo 50 (Recommended)**

```powershell
cd mobile

# Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall with correct version
npm install

# Verify Expo version
npm list expo --depth=0
# Should show: expo@~50.0.0
```

#### **Option B: Update to Expo 54 (If you want latest)**

```powershell
cd mobile

# Update package.json to use Expo 54
# Change: "expo": "~50.0.0" to "expo": "~54.0.0"

# Then:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
```

**Recommendation**: Use Option A (Expo 50) as it matches your package.json.

---

### **Step 2: Clean and Reinstall**

```powershell
cd mobile

# Remove all build artifacts
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\app\build

# Clear caches
npm cache clean --force

# Reinstall
npm install
```

---

### **Step 3: Verify Android Setup**

#### **Check Android Studio**
1. Open Android Studio
2. **More Actions** → **SDK Manager**
3. Verify installed:
   - ✅ Android SDK Platform 33 (or latest)
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator

#### **Check Environment Variables**
```powershell
# Check if ANDROID_HOME is set
$env:ANDROID_HOME
# Should show: C:\Users\YourName\AppData\Local\Android\Sdk

# If not set, add it:
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'User')
```

#### **Check ADB**
```powershell
adb version
# Should show version number
```

---

### **Step 4: Start Android Emulator**

1. **Open Android Studio**
2. **More Actions** → **Virtual Device Manager**
3. **Create Device** (if you don't have one):
   - Choose: **Pixel 5** (recommended)
   - System Image: **Android 13 (Tiramisu) - API 33**
   - Finish setup
4. **Start Emulator**: Click ▶️ next to your device
5. **Wait for emulator to boot** (first time takes 2-3 minutes)

---

### **Step 5: Run the App**

#### **Method 1: Using Expo (Recommended)**

```powershell
cd mobile

# Start Expo
npm start

# Wait for QR code to appear
# Then press 'a' in the terminal to open on Android emulator
```

#### **Method 2: Using React Native CLI (If Expo fails)**

```powershell
# Terminal 1: Start Metro
cd mobile
npx react-native start --reset-cache

# Terminal 2: Run Android
cd mobile
npx react-native run-android
```

#### **Method 3: Using Expo Run (Direct)**

```powershell
cd mobile
npx expo run:android
```

---

## 🐛 Troubleshooting Common Errors

### **Error: "expo: command not found"**

```powershell
npm install -g expo-cli
npm install -g @expo/cli
```

### **Error: "Unable to resolve module"**

```powershell
cd mobile
Remove-Item -Recurse -Force node_modules
npm install
npm start -- --reset-cache
```

### **Error: "Metro bundler failed to start"**

```powershell
cd mobile
npx expo start --clear
```

### **Error: "Android emulator not found"**

1. Make sure emulator is running in Android Studio
2. Check: `adb devices` should show your emulator
3. If not, restart emulator

### **Error: "Build failed"**

```powershell
cd mobile\android
.\gradlew clean
cd ..
npx expo run:android
```

### **Error: "Port 8081 already in use"**

```powershell
# Find process using port 8081
netstat -ano | findstr :8081

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### **Error: "SDK location not found"**

Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

---

## ✅ Verification Checklist

Before running, verify:

- [ ] Node version is 20.x (`node --version`)
- [ ] Expo version matches package.json (`npm list expo`)
- [ ] Android Studio installed
- [ ] Android emulator created and running
- [ ] ANDROID_HOME environment variable set
- [ ] ADB working (`adb devices` shows emulator)
- [ ] All dependencies installed (`npm install` completed)
- [ ] No version conflicts (`npm list` shows no errors)

---

## 🚀 Quick Start (After Fixes)

```powershell
# 1. Clean everything
cd mobile
Remove-Item -Recurse -Force node_modules, .expo -ErrorAction SilentlyContinue
npm cache clean --force

# 2. Reinstall
npm install

# 3. Start Android emulator (in Android Studio)

# 4. Start Expo
npm start

# 5. Press 'a' in terminal to open on Android
```

---

## 📱 Alternative: Use Physical Device (Easier!)

If emulator keeps having issues:

1. **Install Expo Go** on your Android phone:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Make sure phone and computer on same WiFi**

3. **Start Expo:**
   ```powershell
   cd mobile
   npm start
   ```

4. **Scan QR code** with Expo Go app

5. **App loads on phone!** 🎉

---

## 🎯 Expected Result

After fixes:
- ✅ Expo starts without errors
- ✅ Metro bundler runs on port 8081
- ✅ QR code appears in terminal
- ✅ Pressing 'a' opens app on Android emulator
- ✅ App builds and installs
- ✅ App opens and shows login screen

---

## 📝 Next Steps After App Runs

1. **Test Login/Register**
2. **Browse Products**
3. **Add to Cart**
4. **Check Profile**
5. **Test Navigation**

---

## 🔗 Useful Commands

```powershell
# Check Node version
node --version

# Check Expo version
npm list expo --depth=0

# Check Android devices
adb devices

# Start Expo with cache clear
npx expo start --clear

# Run on Android directly
npx expo run:android

# Check for issues
npx expo-doctor
```

---

**Start with Step 1 (Fix Expo Version) and work through each step!** 🚀
