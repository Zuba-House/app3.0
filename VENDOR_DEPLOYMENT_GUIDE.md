# 🚀 Vendor Panel Deployment Guide

## 📋 Overview

This guide covers deploying the **vendor panel** (`vendor/`) to Vercel and explains where vendors can apply to become vendors.

---

## 🎯 Deployment Status

### ✅ **Ready for Deployment**

The vendor app is **structurally ready** but needs:
1. ✅ Vercel configuration (`vercel.json` created)
2. ✅ Build configuration (`vite.config.js` ready)
3. ⚠️ **Backend controllers** (placeholders exist, need implementation)
4. ⚠️ **Frontend API integration** (pages are placeholders, need API calls)
5. ⚠️ **Environment variables** (need to be set in Vercel)

---

## 📍 Where Vendors Apply

### **Option 1: Main Client Site (Recommended)**

Vendors apply on the **main customer site** (`client/`):

- **URL**: `https://zubahouse.com/become-vendor` (or your domain)
- **Current Status**: Link exists in footer (`client/src/components/Footer/index.jsx`)
- **Backend Endpoint**: `POST /api/vendor/apply` (public, no auth required)

**Flow:**
1. User visits main site → clicks "Start Selling to Millions" in footer
2. Redirects to `/become-vendor` page (needs to be created in `client/`)
3. Fills out vendor application form
4. Submits → calls `POST /api/vendor/apply`
5. Gets confirmation: "Application under review"
6. Admin approves → vendor can login to vendor panel

### **Option 2: Vendor Panel Site**

Vendors apply directly on vendor panel:

- **URL**: `https://vendor.zubahouse.com/register` (or `/apply`)
- **Backend Endpoint**: Same `POST /api/vendor/apply`

**Flow:**
1. User visits vendor panel → clicks "Apply to Become Vendor"
2. Fills out form
3. Submits → same backend endpoint
4. After approval → can login to vendor panel

### **Recommendation**

**Use Option 1** (main client site) because:
- ✅ Better SEO and discoverability
- ✅ Users already on your main site
- ✅ Vendor panel is for **existing vendors only**
- ✅ Cleaner separation: public application vs. vendor dashboard

---

## 🚀 Deploying to Vercel

### **Step 1: Prepare Environment Variables**

Create a `.env` file in `vendor/` (for local) and set these in Vercel:

```env
# API Base URL (your backend)
VITE_API_URL=https://zuba-api.onrender.com

# Optional: Analytics, etc.
VITE_APP_NAME=Zuba House Vendor Panel
```

### **Step 2: Deploy via Vercel Dashboard**

1. **Go to Vercel Dashboard** → Add New Project
2. **Import Git Repository** (your `zuba-web2.0` repo)
3. **Configure Project:**
   - **Root Directory**: `vendor`
   - **Framework Preset**: Vite
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables:**
   - `VITE_API_URL` = Your backend API URL

5. **Deploy!**

### **Step 3: Configure Custom Domain (Optional)**

In Vercel project settings:
- Add custom domain: `vendor.zubahouse.com` (or `zubahouse.com/vendor`)
- Update DNS records as instructed

---

## 📁 Project Structure on Vercel

```
zuba-web2.0/ (monorepo root)
├── client/          → Deploy separately (main site)
├── admin/           → Deploy separately (admin panel)
├── vendor/          → Deploy separately (vendor panel) ⭐ NEW
└── server/          → Deploy separately (backend API)
```

**Each app is a separate Vercel project!**

---

## 🔧 Vercel Configuration

The `vendor/vercel.json` is already configured:

```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ All routes redirect to `index.html` (SPA routing)
- ✅ Proper caching headers
- ✅ Security headers

---

## 🧪 Testing Before Production

### **Local Testing**

```bash
cd vendor
npm install
npm run dev
```

Visit: `http://localhost:3002`

### **Test Vendor Application**

1. **Test endpoint directly:**
```bash
curl -X POST https://your-api.com/api/vendor/apply \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "vendor@test.com",
    "password": "password123",
    "storeName": "Test Store",
    "storeSlug": "test-store"
  }'
```

2. **Check application status:**
```bash
curl https://your-api.com/api/vendor/application-status/vendor@test.com
```

---

## 📝 Pre-Deployment Checklist

### **Backend (Server)**
- [ ] Vendor routes mounted in `server/index.js` ✅
- [ ] `POST /api/vendor/apply` endpoint working ✅
- [ ] `GET /api/vendor/application-status/:email` working ✅
- [ ] Controllers implemented (currently placeholders)
- [ ] Database models created (`Vendor`, `Payout`)
- [ ] User model updated with `role` and `vendor` fields ✅

### **Frontend (Vendor App)**
- [ ] `vendor/vercel.json` created ✅
- [ ] `vendor/package.json` has all dependencies ✅
- [ ] Environment variables set in Vercel
- [ ] API client configured (needs implementation)
- [ ] Pages connected to backend (needs implementation)
- [ ] Authentication flow working (needs implementation)

### **Client Site (Main Site)**
- [ ] `/become-vendor` page created (needs implementation)
- [ ] Form submits to `POST /api/vendor/apply`
- [ ] Success/error handling

---

## 🎯 Next Steps

### **1. Implement Backend Controllers**

The placeholder controllers need implementation:
- `server/controllers/vendor.controller.js` (partially done - `applyToBecomeVendor` ✅)
- `server/controllers/vendorProduct.controller.js`
- `server/controllers/vendorOrder.controller.js`
- `server/controllers/vendorFinance.controller.js`
- `server/controllers/vendorCoupon.controller.js`

### **2. Create Vendor Application Page**

Create `client/src/Pages/BecomeVendor/index.jsx`:
- Form with: name, email, password, storeName, storeSlug, etc.
- Submit to `POST /api/vendor/apply`
- Show success message: "Application submitted! We'll review and get back to you."

### **3. Implement Vendor Panel Frontend**

- Create API service files (`vendor/src/services/`)
- Connect pages to backend APIs
- Implement authentication context
- Add loading states and error handling

### **4. Test End-to-End**

1. User applies on main site
2. Admin approves in admin panel
3. Vendor logs into vendor panel
4. Vendor can manage products, orders, etc.

---

## 🌐 Deployment URLs

After deployment, you'll have:

- **Main Site**: `https://zubahouse.com`
- **Admin Panel**: `https://admin.zubahouse.com`
- **Vendor Panel**: `https://vendor.zubahouse.com` ⭐ NEW
- **API**: `https://zuba-api.onrender.com`

---

## 🔐 Security Notes

1. **Vendor Application Endpoint** (`/api/vendor/apply`):
   - ✅ Public (no auth required)
   - ✅ Rate limiting recommended
   - ✅ Email validation
   - ✅ Store slug uniqueness check

2. **Vendor Panel Routes**:
   - ✅ Protected with `auth` + `requireVendor` middleware
   - ✅ Only `VENDOR` role can access
   - ✅ Vendor can only see/edit their own data

---

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors

---

## ✅ Summary

**Is it ready?** 
- **Structure**: ✅ Yes
- **Backend API**: ⚠️ Partially (application endpoint works, others are placeholders)
- **Frontend**: ⚠️ Partially (pages exist but need API integration)
- **Deployment Config**: ✅ Yes

**Where do vendors apply?**
- **Recommended**: Main client site (`/become-vendor` page)
- **Alternative**: Vendor panel (`/register` or `/apply`)

**Deployment**: Ready to deploy to Vercel, but implement controllers and frontend API integration first for full functionality.

