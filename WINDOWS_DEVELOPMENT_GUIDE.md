# 🪟 Windows Development Guide - Complete Setup

## 📋 System Requirements

### **Minimum Requirements**
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8GB (16GB recommended for Android emulator)
- **Storage**: 20GB free space (for Android Studio + emulator)
- **Processor**: Intel/AMD 64-bit processor
- **Internet**: Required for downloading dependencies

### **Required Software**

1. **Node.js** (v18.x or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Git** (optional but recommended)
   - Download: https://git-scm.com/download/win

3. **Android Studio** (for Android development)
   - Download: https://developer.android.com/studio
   - Required for Android emulator

4. **VS Code** (recommended editor)
   - Download: https://code.visualstudio.com/
   - Extensions: ESLint, Prettier, React snippets

5. **Python 3.9+** (for Python backend proxy - optional)
   - Download: https://www.python.org/downloads/

---

## 🚀 Step-by-Step Installation

### **Step 1: Install Node.js**

1. Download Node.js 18.x LTS from https://nodejs.org/
2. Run installer, check "Add to PATH"
3. Verify installation:
   ```powershell
   node --version    # Should show v18.x.x or higher
   npm --version     # Should show 9.x.x or higher
   ```

### **Step 2: Install Android Studio (For Android Development)**

1. Download Android Studio from https://developer.android.com/studio
2. Run installer, follow setup wizard
3. **Important**: Install Android SDK during setup
4. Open Android Studio → **More Actions** → **SDK Manager**
5. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

6. Set environment variables (if not auto-set):
   ```powershell
   # Add to System Environment Variables:
   ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
   # Add to PATH:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\emulator
   ```

7. Verify installation:
   ```powershell
   adb version
   ```

### **Step 3: Install Expo CLI (For Mobile App)**

```powershell
npm install -g expo-cli
npm install -g @expo/cli
```

Verify:
```powershell
expo --version
```

### **Step 4: Install Project Dependencies**

Open PowerShell in project root:

```powershell
# Install Admin dependencies
cd admin
npm install
cd ..

# Install Client dependencies
cd client
npm install
cd ..

# Install Vendor dependencies
cd vendor
npm install
cd ..

# Install Mobile dependencies
cd mobile
npm install
cd ..

# Install Server dependencies (if running locally)
cd server
npm install
cd ..
```

---

## 🎯 Running the Applications

### **Option 1: Use Batch Files (Easiest for Windows)**

Double-click these files in Windows Explorer:
- `start-admin.bat` - Starts admin panel
- `start-mobile-android.bat` - Starts mobile app on Android

### **Option 2: Manual Commands**

#### **1. Admin Panel**
```powershell
cd admin
npm run dev
```
- Opens at: **http://localhost:5173**
- **Hot Reload**: ✅ Automatic (saves trigger refresh)

#### **2. Client Storefront**
```powershell
cd client
npm run dev
```
- Opens at: **http://localhost:5174** (or next available port)
- **Hot Reload**: ✅ Automatic

#### **3. Vendor Dashboard**
```powershell
cd vendor
npm run dev
```
- Opens at: **http://localhost:5175** (or next available port)
- **Hot Reload**: ✅ Automatic

#### **4. Mobile App - Method 1: Physical Device (EASIEST)**

**Prerequisites:**
- Install **Expo Go** app on your Android phone:
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

**Steps:**
```powershell
cd mobile
npm start
```

1. QR code appears in terminal
2. Open **Expo Go** app on phone
3. Scan QR code
4. App loads on phone!
5. **Hot Reload**: ✅ Shake phone → "Reload" or save file to auto-reload

**Important**: Phone and computer must be on **same WiFi network**

#### **5. Mobile App - Method 2: Android Emulator**

**Prerequisites:**
- Android Studio installed
- Android emulator created

**Steps:**

1. **Create Android Emulator** (first time only):
   - Open Android Studio
   - **More Actions** → **Virtual Device Manager**
   - Click **Create Device**
   - Choose device (e.g., Pixel 5)
   - Download system image (e.g., Android 13)
   - Finish setup

2. **Start Emulator**:
   - Open Android Studio
   - **More Actions** → **Virtual Device Manager**
   - Click ▶️ (Play) next to your emulator
   - Wait for emulator to boot

3. **Run Mobile App**:
   ```powershell
   cd mobile
   npm start
   ```
   - In terminal, press **`a`** to open on Android emulator
   - OR run: `npm run android`
   - **Hot Reload**: ✅ Automatic (save file to reload)

---

## 💻 Development Workflow - Developing While Viewing

### **Web Apps (Admin, Client, Vendor)**

**Hot Module Replacement (HMR) is enabled by default!**

1. **Start dev server**:
   ```powershell
   cd admin
   npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Edit code** in VS Code:
   - Save file (Ctrl+S)
   - Browser **automatically refreshes** with changes
   - No manual refresh needed!

4. **Best Practices**:
   - Keep browser DevTools open (F12)
   - Use React DevTools extension
   - Check console for errors
   - Network tab for API calls

### **Mobile App Development**

#### **Using Physical Device (Recommended)**

1. **Start Expo**:
   ```powershell
   cd mobile
   npm start
   ```

2. **Scan QR code** with Expo Go app

3. **Edit code**:
   - Save file (Ctrl+S)
   - App **automatically reloads** on phone
   - Or shake phone → "Reload"

4. **Debug**:
   - Shake phone → "Debug Remote JS"
   - Opens Chrome DevTools
   - Can set breakpoints, inspect state

#### **Using Android Emulator**

1. **Start emulator** (Android Studio)

2. **Start Expo**:
   ```powershell
   cd mobile
   npm start
   ```

3. **Press `a`** in terminal to open on emulator

4. **Edit code**:
   - Save file (Ctrl+S)
   - Emulator **automatically reloads**

5. **Debug**:
   - Press `Ctrl+M` in emulator → "Debug"
   - Or press `j` in terminal to open debugger

---

## 🔧 Android Development on Windows - Complete Setup

### **1. Install Android Studio**

1. Download: https://developer.android.com/studio
2. Run installer
3. Choose **Standard** installation
4. Let it download SDK components (takes 10-20 minutes)

### **2. Configure Android SDK**

1. Open Android Studio
2. **More Actions** → **SDK Manager**
3. **SDK Platforms** tab:
   - ✅ Android 13.0 (Tiramisu) - API 33
   - ✅ Android 12.0 (S) - API 31
4. **SDK Tools** tab:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM)

5. Click **Apply** → **OK**

### **3. Create Android Virtual Device (AVD)**

1. **More Actions** → **Virtual Device Manager**
2. Click **Create Device**
3. Choose device: **Pixel 5** (recommended)
4. Click **Next**
5. Download system image: **Android 13 (Tiramisu) - API 33**
6. Click **Next** → **Finish**

### **4. Enable Hardware Acceleration (For Better Performance)**

**For Intel Processors:**
1. Download Intel HAXM: https://github.com/intel/haxm/releases
2. Install it
3. Restart computer

**For AMD Processors:**
1. Enable Hyper-V in Windows Features
2. Or use Android Studio's built-in emulator (slower)

### **5. Test Emulator**

1. **Virtual Device Manager** → Click ▶️ next to your device
2. Wait for emulator to boot (first time takes 2-3 minutes)
3. You should see Android home screen

### **6. Enable USB Debugging (For Physical Device)**

**On Your Android Phone:**
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go back → **Developer Options**
4. Enable **USB Debugging**
5. Connect phone to computer via USB
6. Accept "Allow USB Debugging" prompt on phone

**Verify Connection:**
```powershell
adb devices
# Should show your device
```

---

## 🎨 Recommended Development Setup

### **VS Code Extensions**

Install these extensions in VS Code:

1. **ES7+ React/Redux/React-Native snippets**
2. **ESLint**
3. **Prettier - Code formatter**
4. **Tailwind CSS IntelliSense**
5. **React Native Tools** (for mobile)
6. **Thunder Client** (for API testing)

### **VS Code Settings**

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### **Terminal Setup**

**Use Windows Terminal** (better than PowerShell):
1. Install from Microsoft Store
2. Configure multiple tabs:
   - Tab 1: Admin (`cd admin && npm run dev`)
   - Tab 2: Client (`cd client && npm run dev`)
   - Tab 3: Mobile (`cd mobile && npm start`)
   - Tab 4: Server (if running locally)

---

## 🚀 Quick Start Commands

### **Start Everything (Multiple Terminals)**

**Terminal 1 - Admin:**
```powershell
cd admin
npm run dev
```

**Terminal 2 - Client:**
```powershell
cd client
npm run dev
```

**Terminal 3 - Mobile:**
```powershell
cd mobile
npm start
```

**Terminal 4 - Server (if running locally):**
```powershell
cd server
npm run dev
```

### **Or Use Batch Files**

- Double-click `start-admin.bat`
- Double-click `start-mobile-android.bat` (after starting emulator)

---

## 🔥 Hot Reload Features

### **Web Apps (Vite)**
- ✅ **Instant HMR**: Changes appear immediately
- ✅ **State Preservation**: React state maintained on reload
- ✅ **Error Overlay**: Errors shown in browser
- ✅ **Fast Refresh**: Only changed components reload

### **Mobile App (Expo)**
- ✅ **Fast Refresh**: Changes appear in 1-2 seconds
- ✅ **Live Reload**: Full app reload on save
- ✅ **Error Screen**: Red error screen with stack trace
- ✅ **Shake to Reload**: Shake device to reload

### **Tips for Faster Development**

1. **Keep DevTools Open**: See errors immediately
2. **Use React DevTools**: Inspect component state
3. **Network Tab**: Monitor API calls
4. **Console Logs**: Use `console.log()` for debugging
5. **Breakpoints**: Set breakpoints in Chrome DevTools

---

## 🐛 Common Issues & Solutions

### **Issue: Port Already in Use**

**Solution:**
```powershell
# Find process using port 5173
netstat -ano | findstr :5173
# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### **Issue: Android Emulator Won't Start**

**Solutions:**
1. Enable Virtualization in BIOS
2. Install Intel HAXM (for Intel CPUs)
3. Increase emulator RAM: AVD Manager → Edit → Show Advanced Settings → RAM: 2048MB
4. Use physical device instead

### **Issue: Expo QR Code Not Working**

**Solutions:**
1. Ensure phone and computer on same WiFi
2. Disable Windows Firewall temporarily
3. Use tunnel mode: `expo start --tunnel`
4. Or use emulator instead

### **Issue: npm install Fails**

**Solutions:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### **Issue: Metro Bundler Won't Start**

**Solutions:**
```powershell
cd mobile
npm start -- --reset-cache
```

### **Issue: "adb not found"**

**Solution:**
Add to PATH:
```powershell
# Add to System Environment Variables:
C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
```

---

## 📱 Testing on Physical Android Device

### **Method 1: Expo Go (Easiest)**

1. Install Expo Go from Play Store
2. Run `npm start` in mobile folder
3. Scan QR code
4. Done!

### **Method 2: USB Debugging**

1. Enable USB debugging on phone
2. Connect via USB
3. Run:
   ```powershell
   cd mobile
   npm run android
   ```
4. App installs and opens on phone

### **Method 3: Wireless Debugging (Android 11+)**

1. Enable Wireless debugging in Developer Options
2. Pair device (shows IP:port)
3. Connect:
   ```powershell
   adb connect <IP>:<PORT>
   ```
4. Run app normally

---

## 🎯 Development Tips

### **1. Use Multiple Monitors**
- Monitor 1: VS Code (code editor)
- Monitor 2: Browser/Emulator (see changes)
- Monitor 3: Terminal (logs)

### **2. Use Browser DevTools**
- **Elements**: Inspect HTML/CSS
- **Console**: See logs and errors
- **Network**: Monitor API calls
- **React DevTools**: Inspect component tree

### **3. Use React DevTools**
- Install Chrome extension: React Developer Tools
- Inspect component props and state
- See component hierarchy
- Debug performance

### **4. Use Expo DevTools**
- Open: http://localhost:19002
- See logs
- Reload app
- Open in simulator

### **5. Debugging Mobile App**

**Chrome DevTools:**
1. Shake device → "Debug Remote JS"
2. Opens Chrome DevTools
3. Set breakpoints
4. Inspect variables

**React Native Debugger:**
1. Install: https://github.com/jhen0409/react-native-debugger
2. Connect to Metro bundler
3. Full debugging experience

---

## ✅ Verification Checklist

### **Before Starting Development**

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Android Studio installed (for Android)
- [ ] Android emulator created and tested
- [ ] Expo CLI installed (`expo --version`)
- [ ] All dependencies installed (`npm install` in each folder)
- [ ] Backend API accessible (https://zuba-api.onrender.com)
- [ ] VS Code extensions installed

### **Test Each Component**

- [ ] Admin panel opens (http://localhost:5173)
- [ ] Client storefront opens
- [ ] Mobile app runs on emulator/device
- [ ] Hot reload works (save file → see changes)
- [ ] API calls work (check Network tab)
- [ ] No console errors

---

## 🎓 Next Steps

1. **Start Development**:
   - Run admin panel
   - Run mobile app
   - Start coding!

2. **Learn the Codebase**:
   - Read `ARCHITECTURE_OVERVIEW.md`
   - Check `API_ENDPOINTS_REFERENCE.md`
   - Explore component structure

3. **Make Changes**:
   - Edit files
   - Save (auto-reload)
   - See changes instantly!

4. **Test Features**:
   - Create products in admin
   - View in mobile app
   - Test checkout flow

---

## 📞 Need Help?

- Check error messages in terminal/console
- Verify all prerequisites installed
- Check network connectivity
- Review documentation files
- Clear caches and reinstall dependencies

**Happy Coding!** 🚀
