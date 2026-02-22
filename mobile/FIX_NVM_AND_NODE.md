# 🔧 Fix nvm-windows and Switch to Node 20

## ❌ Current Issue

nvm-windows is installed but has a path configuration issue:
- Error: `ERROR open \settings.txt: The system cannot find the file specified`
- nvm is looking for settings.txt in the wrong location

## ✅ Solution: Fix nvm-windows Manually

### Step 1: Open a NEW PowerShell or CMD window (as Administrator)

**Important:** Close all terminals and VS Code, then open a fresh PowerShell window.

### Step 2: Verify nvm is accessible

```powershell
nvm version
```

Should show: `1.2.2` or similar

### Step 3: If nvm still doesn't work, check environment variables

```powershell
$env:NVM_HOME
$env:NVM_SYMLINK
```

If these are empty, you may need to:
1. Open System Properties → Environment Variables
2. Add:
   - `NVM_HOME` = `C:\Users\User\AppData\Local\nvm`
   - `NVM_SYMLINK` = `C:\nvm4w\nodejs` (or check your settings.txt)

### Step 4: Install and use Node 20

```powershell
nvm install 20.11.1
nvm use 20.11.1
node -v
```

Expected: `v20.11.1`

### Step 5: Verify Node location

```powershell
where node
```

Should point to: `C:\nvm4w\nodejs\node.exe` (or similar nvm-managed path)

---

## 🚀 Alternative: Manual Node 20 Installation

If nvm continues to fail, you can install Node 20 directly:

1. **Download Node 20 LTS:**
   - Go to: https://nodejs.org/
   - Download Windows Installer (.msi) for Node 20.x LTS

2. **Install Node 20:**
   - Run the installer
   - Make sure to check "Add to PATH" during installation

3. **Verify:**
   ```powershell
   node -v
   npm -v
   ```

4. **Then proceed with cleaning and starting Expo** (see next section)

---

## 🧹 After Switching to Node 20: Clean Project

Once Node 20 is active, run these in your mobile directory:

```powershell
cd C:\Users\User\Desktop\zuba-app3.0\web\mobile

# Remove old dependencies
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

---

## 🚀 Start Expo

```powershell
npx expo start --clear
```

Then:
- Press `a` for Android emulator
- OR scan QR code with Expo Go on your phone

---

## 📋 Quick Checklist

After fixing nvm/Node:

- [ ] `node -v` shows `v20.x.x` (not v24.x.x)
- [ ] `where node` points to nvm-managed path (or Program Files if manual install)
- [ ] Project cleaned (`node_modules`, `.expo` removed)
- [ ] Dependencies reinstalled (`npm install`)
- [ ] Expo starts without `node:sea` error

---

## 💡 Why This Fixes the Issue

The `node:sea` directory error occurs because:
- Node 24.x introduced new features that Expo's Metro bundler tries to use
- On Windows, creating directories with colons (`:`) in names is not allowed
- Node 20.x LTS doesn't have this issue and is fully compatible with Expo SDK 50

