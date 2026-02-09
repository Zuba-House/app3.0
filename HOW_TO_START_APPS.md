# 🚀 How to Start the Apps

## ⚠️ **The Main Batch File Might Not Work**

If `restart-vendor-client.bat` doesn't work, use these simpler files instead:

---

## ✅ **Easiest Method: Use Separate Batch Files**

I've created two simple batch files:

### **1. Start Vendor Dashboard:**
- **Double-click:** `start-vendor.bat`
- Wait for it to start
- Look for: `Local: http://localhost:5173` (or similar)

### **2. Start Client App:**
- **Double-click:** `start-client.bat` (in a new window)
- Wait for it to start
- Look for: `Local: http://localhost:5174` (or similar)

---

## ✅ **Manual Method (Most Reliable)**

### **Open Two Separate Terminal Windows:**

#### **Terminal 1 - Vendor:**
```bash
cd vendor
npm run dev
```

#### **Terminal 2 - Client:**
```bash
cd client
npm run dev
```

---

## 🌐 **Then Open in Browser**

Once both are running:

1. **Vendor Dashboard:** `http://localhost:5173` (or port shown)
2. **Client App:** `http://localhost:5174` (or port shown)

3. **IMPORTANT:** Press `Ctrl+Shift+R` to hard refresh and see the new UI!

---

## 🔍 **If Batch Files Still Don't Work**

### **Try Right-Click → Run as Administrator**

Or run from Command Prompt:
```cmd
cd "C:\Users\ZeroX\OneDrive - Algonquin College\Desktop\0x\First Real Pj i\Zuba House Apps_Web3.0\app3.0"
start-vendor.bat
```

---

## ✅ **What You Should See**

When servers start successfully:
- Terminal shows: `VITE v... ready in ... ms`
- Shows: `➜  Local:   http://localhost:XXXX`
- No error messages

Then open those URLs in your browser and **hard refresh (Ctrl+Shift+R)**!

---

## 🎯 **Quick Start Commands**

Just copy and paste these in separate terminals:

**Terminal 1:**
```bash
cd "C:\Users\ZeroX\OneDrive - Algonquin College\Desktop\0x\First Real Pj i\Zuba House Apps_Web3.0\app3.0\vendor"
npm run dev
```

**Terminal 2:**
```bash
cd "C:\Users\ZeroX\OneDrive - Algonquin College\Desktop\0x\First Real Pj i\Zuba House Apps_Web3.0\app3.0\client"
npm run dev
```

**That's it!** Then open the URLs shown and hard refresh! 🚀
