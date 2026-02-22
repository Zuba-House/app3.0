# 🔌 Backend Connection Guide - Mobile App

## ✅ **Good News: Already Configured!**

Your mobile app is **already connected** to your backend! Here's what you need to know:

---

## 📡 **Current Configuration**

### **Backend API URL**
- **Current**: `https://zuba-api.onrender.com`
- **Location**: `mobile/src/constants/config.ts`
- **Status**: ✅ Already set up

### **How It Works**
```
Mobile App → API Calls → Backend (https://zuba-api.onrender.com) → MongoDB Database
```

**You don't need to provide database credentials!** The mobile app only needs the backend API URL. The backend handles all database operations.

---

## 🔧 **What You Need to Provide (If Different Backend)**

### **Option 1: If Using Current Backend (Recommended)**
**Nothing needed!** The app is already configured to use:
- Backend: `https://zuba-api.onrender.com`
- This backend already has access to your MongoDB database
- Products should load automatically

### **Option 2: If Using Different Backend URL**

If your backend is at a different URL, update this file:

**File**: `mobile/src/constants/config.ts`

```typescript
// Change this line:
export const API_URL = process.env.API_URL || 'https://zuba-api.onrender.com';

// To your backend URL:
export const API_URL = process.env.API_URL || 'https://your-backend-url.com';
```

---

## ✅ **Verify Backend Connection**

### **Step 1: Check Backend is Running**

Open in browser: `https://zuba-api.onrender.com`

Should return:
```json
{
  "message": "Server is running...",
  "status": "healthy"
}
```

### **Step 2: Test Products Endpoint**

Open in browser: `https://zuba-api.onrender.com/api/product/getAllProducts`

Should return products JSON.

### **Step 3: Test in Mobile App**

1. Run mobile app: `npm start`
2. Open app on device/emulator
3. Home screen should load products automatically
4. If products don't load, check console for errors

---

## 🔍 **Troubleshooting**

### **Issue: No Products Loading**

**Check 1: Backend is Running**
```bash
curl https://zuba-api.onrender.com
```

**Check 2: Products Endpoint Works**
```bash
curl https://zuba-api.onrender.com/api/product/getAllProducts
```

**Check 3: CORS Configuration**
- Backend should allow requests from mobile app
- Check `server/index.js` CORS settings
- Should allow requests with no origin (mobile apps)

**Check 4: API Response Format**
- Backend should return: `{ success: true, data: [...] }`
- Check console logs in mobile app for API errors

### **Issue: Network Error**

**Solutions:**
1. Check internet connection
2. Verify backend URL is correct
3. Check if backend is accessible from your network
4. Check firewall settings

---

## 📋 **What the Mobile App Needs**

### **Required:**
- ✅ Backend API URL (already configured)
- ✅ Internet connection
- ✅ Backend must be running and accessible

### **NOT Required:**
- ❌ Database credentials (backend handles this)
- ❌ MongoDB connection string (backend handles this)
- ❌ Database access (backend handles this)

---

## 🔐 **Backend Requirements**

Your backend (`https://zuba-api.onrender.com`) should:

1. ✅ **Be Running**: Server should be live
2. ✅ **Have CORS Enabled**: Allow mobile app requests
3. ✅ **Have Products**: Database should have products
4. ✅ **Return Correct Format**: `{ success: true, data: [...] }`

---

## 🧪 **Test Connection**

### **Quick Test Script**

Create `mobile/test-backend.js`:

```javascript
const API_URL = 'https://zuba-api.onrender.com';

async function testBackend() {
  try {
    // Test 1: Health check
    const health = await fetch(API_URL);
    console.log('✅ Backend is running:', await health.json());

    // Test 2: Get products
    const products = await fetch(`${API_URL}/api/product/getAllProducts`);
    const data = await products.json();
    console.log('✅ Products endpoint works:', data.success ? 'Yes' : 'No');
    console.log('📦 Products count:', data.data?.length || 0);

    // Test 3: Get categories
    const categories = await fetch(`${API_URL}/api/category`);
    const catData = await categories.json();
    console.log('✅ Categories endpoint works:', catData.success ? 'Yes' : 'No');
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend();
```

Run: `node mobile/test-backend.js`

---

## 📝 **Configuration Files**

### **Current Setup:**
- ✅ `mobile/src/constants/config.ts` - API URL configured
- ✅ `mobile/app.json` - API URL in extra config
- ✅ All API endpoints defined correctly

### **To Change Backend URL:**

**Method 1: Update config.ts**
```typescript
export const API_URL = 'https://your-new-backend.com';
```

**Method 2: Use Environment Variable**
```typescript
export const API_URL = process.env.API_URL || 'https://zuba-api.onrender.com';
```

Then create `mobile/.env`:
```
API_URL=https://your-backend.com
```

---

## 🎯 **Summary**

**What You Need to Provide:**
- ✅ **Nothing!** (Already configured)

**What's Already Set:**
- ✅ Backend URL: `https://zuba-api.onrender.com`
- ✅ API endpoints configured
- ✅ All services ready

**What to Verify:**
- ✅ Backend is running
- ✅ Backend has products in database
- ✅ Backend CORS allows mobile requests

**The mobile app should automatically load products from your backend!** 🚀

---

## 🚀 **Quick Start**

1. **Verify Backend**: Check `https://zuba-api.onrender.com` is running
2. **Run Mobile App**: `npm start` in mobile folder
3. **Open App**: Press 'a' for Android or scan QR code
4. **Check Products**: Home screen should show products from backend

**That's it! No additional configuration needed!** 🎉
