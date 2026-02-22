# 🚀 How to Start Vendor and Client Apps

## ⚠️ **If Batch File Doesn't Work**

The batch file might not work due to Windows security settings. Try these alternatives:

---

## ✅ **Option 1: Use PowerShell Script (Recommended)**

1. **Right-click** on `restart-vendor-client.ps1`
2. Select **"Run with PowerShell"**
3. If you get an error about execution policy, run this first:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
4. Then try again

---

## ✅ **Option 2: Manual Start (Most Reliable)**

### **Open Two Terminal Windows:**

#### **Terminal 1 - Vendor Dashboard:**
```bash
cd vendor
npm run dev
```

#### **Terminal 2 - Client App:**
```bash
cd client
npm run dev
```

---

## ✅ **Option 3: Use the Batch File (If It Works)**

1. **Double-click** `restart-vendor-client.bat`
2. If nothing happens, try **right-click** → **"Run as administrator"**

---

## 🔍 **Troubleshooting**

### **If Batch File Does Nothing:**

1. **Check if it's blocked:**
   - Right-click the file
   - Properties → Unblock (if available)

2. **Run from Command Prompt:**
   - Open Command Prompt
   - Navigate to project folder
   - Type: `restart-vendor-client.bat`
   - Press Enter

3. **Check Windows Defender:**
   - Windows might be blocking the script
   - Add exception if needed

---

## 📋 **What Should Happen**

When it works, you should see:
1. Two new terminal/command windows open
2. Each window shows npm installing/running
3. URLs like `http://localhost:5173` appear
4. You can open those URLs in your browser

---

## 🎯 **Quick Manual Start**

**Just run these commands in separate terminals:**

```bash
# Terminal 1
cd vendor
npm run dev

# Terminal 2 (new terminal)
cd client
npm run dev
```

Then open:
- Vendor: `http://localhost:5173`
- Client: `http://localhost:5174`

**Don't forget to hard refresh (Ctrl+Shift+R) to see the new UI!**
