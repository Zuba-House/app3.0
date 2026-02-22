# 🔧 Fix Windows "node:sea" Directory Error

## ❌ The Problem

Expo is trying to create a directory named `node:sea` which contains a colon (`:`). 
**Windows doesn't allow colons in directory names**, causing this error:

```
Error: ENOENT: no such file or directory, mkdir 
'C:\Users\User\Desktop\zuba-app3.0\web\mobile\.expo\metro\externals\node:sea'
```

## ✅ Solution Options

### **Option 1: Use React Native CLI (Recommended for Windows)**

Since you already have the `android/` folder from `expo prebuild`, you can use React Native CLI directly:

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Start Metro bundler
npx react-native start --reset-cache
```

Then in **another terminal**:

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Run on Android emulator
npx react-native run-android
```

### **Option 2: Use Expo Run (Bypasses Metro Issue)**

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# This uses a different code path that might avoid the issue
npx expo run:android
```

### **Option 3: Update Expo (May Have Fix)**

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Update to latest Expo
npm install expo@latest

# Try starting again
npx expo start
```

### **Option 4: Use Expo Go on Phone (Easiest Workaround)**

1. Install **Expo Go** app on your phone
2. Make sure phone and computer are on same WiFi
3. Try starting Expo with tunnel mode:

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile
npx expo start --tunnel
```

This uses a different network path that might avoid the file system issue.

## 🎯 Recommended Action

**Try Option 1 first** (React Native CLI) since you have the Android folder already generated.

If that doesn't work, try **Option 4** (Expo Go with tunnel) as it's the easiest workaround.

## 📝 Technical Details

This is a known issue with Expo SDK 50 on Windows where Metro tries to create directories with colons for Node.js externals. The issue is in `@expo/cli/src/start/server/metro/externals.ts`.

The workarounds above bypass this code path or use alternative methods.

