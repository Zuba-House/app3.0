# 📱 Expo iPhone Connection - FIXED!

## ✅ **WHAT I FIXED**

1. ✅ Created startup scripts for iPhone
2. ✅ Added npm commands for easy startup
3. ✅ Configured Metro bundler
4. ✅ Your computer IP: **192.168.2.20**

---

## 🚀 **HOW TO START (CHOOSE ONE METHOD)**

### **Method 1: Double-click batch file (EASIEST)**
1. Go to `mobile` folder
2. Double-click `start-iphone.bat`
3. Wait for QR code
4. Scan with Expo Go app

### **Method 2: Use npm command**
```bash
cd mobile
npm run start:lan
```

### **Method 3: Use tunnel mode (if LAN doesn't work)**
```bash
cd mobile
npm run start:tunnel
```
OR double-click `start-tunnel.bat`

---

## 🔧 **IF YOU GET "REQUEST TIMED OUT" ERROR**

### **Fix 1: Allow Expo through Windows Firewall**

Run this in PowerShell (as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

Or manually:
1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find "Node.js" and check "Private"
4. If not there, click "Allow another app" and add Node.js

### **Fix 2: Verify Same WiFi**
- iPhone: Settings → WiFi → Check network name
- Computer: Check WiFi network name
- **They must be the same!**

### **Fix 3: Use Tunnel Mode**
If same WiFi doesn't work:
```bash
cd mobile
npm run start:tunnel
```
This works on ANY network (takes 30-60 seconds)

### **Fix 4: Manual Connection**
1. In Expo Go app, tap "Enter URL manually"
2. Type: `exp://192.168.2.20:8081`
3. Make sure IP matches your computer

---

## 📋 **STEP-BY-STEP**

1. **Open terminal:**
   ```bash
   cd mobile
   ```

2. **Start Expo:**
   ```bash
   npm run start:lan
   ```
   OR double-click `start-iphone.bat`

3. **Wait 10-30 seconds** for QR code

4. **On iPhone:**
   - Open Expo Go app
   - Tap "Scan QR code"
   - Scan the QR code in terminal

5. **If it times out:**
   - Try tunnel mode: `npm run start:tunnel`
   - Check firewall
   - Restart both devices

---

## ✅ **SUCCESS = You see:**
- QR code in terminal
- "Metro waiting on..." message
- App loads on iPhone
- No timeout errors

---

## 🎯 **QUICK COMMANDS**

```bash
# Start for iPhone (same WiFi)
cd mobile
npm run start:lan

# Start with tunnel (any network)
cd mobile
npm run start:tunnel

# Clear cache and restart
cd mobile
npx expo start --lan --clear
```

---

**Your IP: 192.168.2.20**  
**Port: 8081**  
**URL: exp://192.168.2.20:8081**

**Now try running the app again!** 🚀
