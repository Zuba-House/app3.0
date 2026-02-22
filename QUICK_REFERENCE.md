# ⚡ Quick Reference - Windows Development

## 🚀 One-Command Start

### **Admin Panel**
```powershell
cd admin && npm run dev
# Opens: http://localhost:5173
```

### **Mobile App (Physical Device)**
```powershell
cd mobile && npm start
# Scan QR code with Expo Go app
```

### **Mobile App (Emulator)**
```powershell
# 1. Start Android emulator (Android Studio)
# 2. Then:
cd mobile && npm start
# Press 'a' in terminal
```

---

## 📋 Requirements Checklist

- ✅ Node.js 18+ (`node --version`)
- ✅ Android Studio (for Android dev)
- ✅ Expo CLI (`npm install -g expo-cli`)
- ✅ Dependencies installed (`npm install` in each folder)

---

## 🔥 Hot Reload

**Web Apps**: Save file → Auto-refresh in browser  
**Mobile App**: Save file → Auto-reload on device/emulator

---

## 🐛 Quick Fixes

**Port in use:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Clear cache:**
```powershell
cd mobile
npm start -- --reset-cache
```

**Reinstall:**
```powershell
rm -r node_modules
npm install
```

---

## 📱 Android Setup

1. Install Android Studio
2. Create emulator (Virtual Device Manager)
3. Start emulator
4. Run `npm start` in mobile folder
5. Press `a` for Android

---

## 🌐 URLs

- **Admin**: http://localhost:5173
- **Client**: http://localhost:5174
- **Backend**: https://zuba-api.onrender.com
- **Expo DevTools**: http://localhost:19002

---

**Full guide**: See `WINDOWS_DEVELOPMENT_GUIDE.md`
