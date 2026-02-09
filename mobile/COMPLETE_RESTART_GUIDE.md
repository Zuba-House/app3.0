# 🔄 Complete App Restart Guide

## ⚠️ **If Changes Are Not Showing**

Follow these steps **in order** to force a complete reload:

---

## 🚀 **Method 1: Use the Restart Script (Easiest)**

### **Windows:**
1. Double-click `FORCE_RELOAD.bat` in the `mobile` folder
2. Wait for Metro to start
3. In your app: **Shake device** → **Reload**

### **PowerShell:**
1. Run: `.\FORCE_RELOAD.ps1` in the `mobile` folder
2. Wait for Metro to start
3. In your app: **Shake device** → **Reload**

---

## 🚀 **Method 2: Manual Restart (Step by Step)**

### **Step 1: Stop Everything**
```powershell
# Stop Metro bundler
# Press Ctrl+C in the Metro terminal
# Or kill all Node processes:
Get-Process -Name node | Stop-Process -Force
```

### **Step 2: Clear All Caches**
```powershell
cd mobile

# Remove Expo cache
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Remove Metro cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# Clear watchman (if installed)
watchman watch-del-all 2>$null
```

### **Step 3: Restart Metro with Clear Cache**
```powershell
npm start -- --clear
```

### **Step 4: Reload App**
- **On Device/Emulator:** Shake device → Select "Reload"
- **Or:** Press `r` in the Metro terminal
- **Or:** Press `Ctrl+R` (Windows) / `Cmd+R` (Mac)

---

## 🚀 **Method 3: Nuclear Option (Complete Reset)**

If nothing works:

```powershell
cd mobile

# Stop everything
Get-Process -Name node | Stop-Process -Force

# Delete all caches
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# Reinstall dependencies (optional, only if needed)
# npm install

# Start fresh
npm start -- --clear --reset-cache
```

Then in app: **Shake device** → **Reload**

---

## ✅ **Verify Changes Are Applied**

After reloading, check:
1. ✅ Search bar has camera, microphone, and search buttons
2. ✅ "Shop by Category" text is smaller and responsive
3. ✅ Category cards show images/icons (if available from backend)
4. ✅ No errors in Metro terminal

---

## 🔍 **Troubleshooting**

### **Still not working?**
1. **Close the app completely** (swipe away from recent apps)
2. **Restart the emulator/device**
3. **Run the restart script again**
4. **Check Metro terminal for errors**

### **Metro shows errors?**
- Check the error message
- Make sure all files are saved
- Verify imports are correct

---

## 📝 **Quick Reference**

**Reload app:**
- Shake device → Reload
- Or press `r` in Metro terminal

**Clear cache:**
- `npm start -- --clear`
- Or use `FORCE_RELOAD.bat`

**Stop Metro:**
- Press `Ctrl+C` in Metro terminal

---

**Follow these steps and your changes should appear!** 🎉
