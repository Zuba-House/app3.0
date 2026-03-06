# Fix Google OAuth Error 400: invalid_request

## The Problem

You're getting "Error 400: invalid_request" because the redirect URI in your Google OAuth client doesn't match what Expo is using.

## ✅ Solution: Add These Redirect URIs to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
3. Click on it to edit

### Step 2: Add Authorized Redirect URIs

In the **"Authorized redirect URIs"** section, add **ALL** of these:

```
https://auth.expo.io/@olivierndev/zuba-mobile
exp://localhost:8081
zuba://auth/callback
```

**Important:** Add all three! Each one is used in different scenarios:
- `https://auth.expo.io/@olivierndev/zuba-mobile` - For Expo Go (development)
- `exp://localhost:8081` - For local development
- `zuba://auth/callback` - For production builds

### Step 3: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure **User Type** is set to **"External"**
3. Fill in required fields:
   - App name: **Zuba House**
   - User support email: Your email
   - Developer contact: Your email
4. Click **"Add or Remove Scopes"** and ensure these are added:
   - `email`
   - `profile`
   - `openid`
5. Click **"Save and Continue"**
6. On **"Test users"** section, click **"Add Users"**
7. Add your test email: **olivier.niyo250@gmail.com**
8. Click **"Save"**

### Step 4: Save Changes

1. Click **"Save"** in Google Cloud Console
2. Wait 1-2 minutes for changes to propagate

### Step 5: Restart Expo

```bash
cd mobile
npx expo start --clear
```

### Step 6: Test Again

Try Google login again. It should work now!

---

## 📋 Quick Checklist

- [ ] Added `https://auth.expo.io/@olivierndev/zuba-mobile` to redirect URIs
- [ ] Added `exp://localhost:8081` to redirect URIs  
- [ ] Added `zuba://auth/callback` to redirect URIs
- [ ] OAuth consent screen is set to "External"
- [ ] Added `olivier.niyo250@gmail.com` as test user
- [ ] Saved all changes in Google Cloud Console
- [ ] Restarted Expo with `--clear` flag

---

## 🔍 Verify Your Settings

Your Google OAuth Client should have:

**Client ID:** `473177050132-tbjv9abc8bt4fep3eq7grm0faqa3e5dt.apps.googleusercontent.com`

**Authorized redirect URIs:**
- ✅ `https://auth.expo.io/@olivierndev/zuba-mobile`
- ✅ `exp://localhost:8081`
- ✅ `zuba://auth/callback`

**OAuth Consent Screen:**
- ✅ User Type: External
- ✅ Test Users: olivier.niyo250@gmail.com

---

## ⚠️ Still Not Working?

1. **Wait 2-3 minutes** - Google changes can take time to propagate
2. **Clear Expo cache:** `npx expo start --clear`
3. **Check the exact error** in the browser console
4. **Verify** your Expo username: `npx expo whoami` (should be `olivierndev`)
5. **Verify** your app slug in `app.json` (should be `zuba-mobile`)

---

## 🚀 For Production

When you build for production, you'll also need:
- Android OAuth Client ID (for Android builds)
- iOS OAuth Client ID (for iOS builds)

But for now, the Web client with these redirect URIs will work for Expo Go development.
