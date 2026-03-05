# 📱 Expo iPhone Connection Guide

## ✅ **FIXES APPLIED**

1. ✅ Created startup scripts for iPhone connection
2. ✅ Added npm scripts for easy startup
3. ✅ Configured Metro bundler
4. ✅ Your computer IP: **192.168.2.20**

---

## 🚀 **HOW TO START EXPO FOR IPHONE**

### **Method 1: Using npm script (RECOMMENDED)**
```bash
cd mobile
npm run start:lan
```

### **Method 2: Using PowerShell script**
```bash
cd mobile
powershell -ExecutionPolicy Bypass -File ./start-expo-iphone.ps1
```

### **Method 3: Manual command**
```bash
cd mobile
npx expo start --lan --clear
```

### **Method 4: Tunnel mode (if LAN doesn't work)**
```bash
cd mobile
npm run start:tunnel
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: "Request timed out" or "Unable to connect"**

#### **Solution 1: Check Windows Firewall**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Make sure Node.js is allowed for Private networks
4. Or run this in PowerShell (as Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
   ```

#### **Solution 2: Verify Same WiFi**
1. On iPhone: Settings → WiFi → Check network name
2. On Computer: Check WiFi network name
3. They must match exactly

#### **Solution 3: Use Tunnel Mode**
If same WiFi doesn't work, use tunnel mode:
```bash
cd mobile
npm run start:tunnel
```
This works even on different networks (takes 30-60 seconds to setup)

#### **Solution 4: Manual Connection**
1. In Expo Go app, tap "Enter URL manually"
2. Enter: `exp://192.168.2.20:8081`
3. Make sure your computer's IP matches (check with `ipconfig`)

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

1. **Open terminal in mobile folder:**
   ```bash
   cd mobile
   ```

2. **Start Expo with LAN mode:**
   ```bash
   npm run start:lan
   ```

3. **Wait for QR code to appear** (10-30 seconds)

4. **On your iPhone:**
   - Open Expo Go app
   - Tap "Scan QR code"
   - Scan the QR code in terminal
   - OR tap "Enter URL manually" and enter: `exp://192.168.2.20:8081`

5. **If it still doesn't work:**
   - Try tunnel mode: `npm run start:tunnel`
   - Check firewall settings
   - Restart both devices
   - Check WiFi connection

---

## ✅ **VERIFICATION**

After starting Expo, you should see:
- ✅ Metro bundler running
- ✅ QR code displayed
- ✅ Options: Press `a` for Android, `i` for iOS, `w` for web
- ✅ Connection URL: `exp://192.168.2.20:8081`

---

## 🎯 **QUICK FIX COMMANDS**

```bash
# Stop any running Expo processes
taskkill /F /IM node.exe

# Clear Expo cache and restart
cd mobile
npx expo start --lan --clear

# Or use tunnel mode
npx expo start --tunnel --clear
```

---

## 📞 **STILL NOT WORKING?**

1. **Check if port 8081 is in use:**
   ```powershell
   netstat -an | Select-String "8081"
   ```

2. **Kill any processes on port 8081:**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force
   ```

3. **Try a different port:**
   ```bash
   npx expo start --lan --port 8082
   ```

4. **Check your computer's actual IP:**
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

---

## ✅ **SUCCESS INDICATORS**

When it's working, you'll see:
- ✅ QR code in terminal
- ✅ "Metro waiting on..." message
- ✅ App loads on iPhone
- ✅ No timeout errors

---

**Your computer IP: 192.168.2.20**  
**Port: 8081**  
**Connection URL: exp://192.168.2.20:8081**
