# Auth Analysis — Login, Signup, Google Auth

## 0. Latest Stabilization (Applied)

- **Register:** Backend returns `{ success, message: "Verification OTP sent to email", requiresVerification: true }` only (no tokens). Duplicate email → `409` "Account already exists".
- **Verify email:** Strict OTP + expiry check; OTP cleared after use. Response: `{ success, message: "Email verified successfully" }` (no tokens).
- **OTP:** 6-digit OTP; rate limit 5 attempts per email per minute (in-memory; use Redis for scale).
- **Refresh token:** `userId` from `decoded.id || decoded.userId`; **rotation:** new access + new refresh returned, old refresh invalidated (DB check). Mobile saves new refresh token.
- **Reset password (forgot flow):** After verify OTP, backend sets `forgotPasswordVerifiedAt`; reset endpoint accepts email + newPassword + confirmPassword and allows reset only if OTP was verified within 15 min.
- **Logout:** Backend **POST only** `/api/user/logout`; invalidates refresh. Mobile clears AsyncStorage (accessToken, refreshToken, user) and Redux.
- **Google OAuth:** Backend `POST /api/user/auth/google` accepts `{ code, redirect_uri }`, exchanges with Google (client_secret on server), returns app tokens + user. Mobile sends only code; no client_secret in app.
- **401 retry:** Mobile marks retry with `X-Retry` and `_retry` to avoid infinite refresh loop; stores rotated refresh token.
- **Auth rehydration:** On launch, if access token exists but user is missing, app fetches user details and restores session.

---

## 1. What’s Implemented

### Backend (server)

| Feature | Endpoint | Status |
|--------|----------|--------|
| **Register** | `POST /api/user/register` | ✅ Creates user, sends OTP; returns `{ success, message, requiresVerification: true }` (no tokens). 409 if account exists. |
| **Verify email (OTP)** | `POST /api/user/verifyEmail` | ✅ Strict OTP + expiry; sets `verify_email: true`, clears OTP; returns `{ success, message }` (no tokens). |
| **Login** | `POST /api/user/login` | ✅ Checks email, status, `verify_email`, password; returns `{ data: { accesstoken, refreshToken } }`. Sets cookies. |
| **Google auth (profile)** | `POST /api/user/authWithGoogle` | ✅ Legacy: body has name/email/avatar; creates or finds user; returns tokens. |
| **Google auth (code)** | `POST /api/user/auth/google` | ✅ Body: `{ code, redirect_uri }`; server exchanges with Google; returns tokens + user. |
| **Logout** | `POST /api/user/logout` | ✅ Auth required; clears cookies and user’s `refresh_token`. POST only. |
| **Refresh token** | `POST /api/user/refresh-token` | ✅ Cookie or `Authorization: Bearer <refreshToken>`; rotation: returns new access + new refresh; old refresh invalidated. |
| **User details** | `GET /api/user/user-details` (auth) | ✅ Returns current user (no password). |
| **Forgot password** | `POST /api/user/forgot-password` | ✅ Sends OTP email, sets `otp` and `otpExpires`. |
| **Verify forgot OTP** | `POST /api/user/verify-forgot-password-otp` | ✅ Validates OTP and expiry; sets `forgotPasswordVerifiedAt`; clears OTP. |
| **Reset password** | `POST /api/user/reset-password` | ✅ Forgot flow: email + newPassword + confirmPassword (OTP must be verified within 15 min). Change flow: + oldPassword. |

### Mobile (app)

| Feature | Status |
|--------|--------|
| **Login screen** | ✅ Email/password → `authService.login` → stores tokens + fetches user → `setCredentials` → navigates to main. |
| **Google login** | ✅ `signInWithGoogle()` (expo-web-browser OAuth) → gets user info → `authService.loginWithGoogle` → same as login. |
| **Register screen** | ⚠️ Expects `accessToken` + `user` from register API; backend does **not** return them (requires email verify first). |
| **Forgot password** | ✅ Email → OTP → VerifyOtp → ResetPassword → Login. |
| **Verify OTP screen** | ✅ Used only for **forgot password** (verifyForgotPasswordOtp). |
| **Reset password** | ✅ Calls `authService.resetPassword`. |
| **Logout** | ✅ Calls `authService.logout` (POST), then clears AsyncStorage; Redux cleared in Profile/AppNavigator. |
| **Auth state** | ✅ Redux `authSlice` (user, tokens, isAuthenticated); persisted via AsyncStorage. |
| **Token refresh** | ✅ On 401, api.ts uses stored refresh token and calls `POST /api/user/refresh-token` with `Authorization: Bearer <refreshToken>`, then retries. |
| **Google OAuth helper** | ✅ `utils/googleAuth.ts`: opens Google OAuth in browser, gets code, exchanges code for token **in the app** (no client_secret → will fail unless using a backend proxy). |

---

## 2. What’s Left / Gaps

1. **Register → Verify email flow**  
   - Backend: Register does not return access/refresh tokens; it sends OTP and expects email verification first.  
   - Mobile: Register screen expects tokens and user and dispatches `setCredentials`; no “Verify your email (OTP)” step after signup.  
   - **Result:** New users see “Invalid response from server” and are not logged in.  
   - **Needed:** Either:  
     - **Option A:** After register, navigate to a “Verify email” screen (same OTP UX as Forgot), call `POST /api/user/verifyEmail` with email + OTP, then either auto-login (backend would need an endpoint that returns tokens after verify) or redirect to Login.  
     - **Option B:** Backend returns tokens after register and treats user as “verified” (no OTP); then mobile can keep current behavior (not recommended if you want email verification).

2. **Google OAuth code exchange**  
   - Mobile exchanges the Google auth **code** for tokens by calling `https://oauth2.googleapis.com/token` **from the app** without `client_secret`.  
   - Google’s OAuth requires `client_secret` for confidential clients, so this exchange will fail in production.  
   - **Needed:** Backend endpoint that accepts the **code** (and optional redirect_uri), exchanges it with Google using `client_secret` on the server, then creates/updates user and returns your app’s access/refresh tokens. Mobile would then only: open Google OAuth → get code → send code to your backend → receive tokens.

3. **Logout API method**  
   - **Fixed:** Backend now supports both `GET` and `POST` for `/api/user/logout`. Mobile uses POST.

---

## 3. Errors Fixed in This Pass

1. **Refresh token payload**  
   - Backend was using `verifyToken?._id`; JWT payload from `generatedRefreshToken` uses `id`.  
   - **Fix:** Use `verifyToken?.id || verifyToken?._id` when getting `userId` in the refresh controller.

2. **Logout method**  
   - Mobile called `POST /api/user/logout` while backend only had `GET`.  
   - **Fix:** Added `POST /api/user/logout` in user routes.

3. **OTP expiry check**  
   - `verifyForgotPasswordOtp` compared `user.otpExpires` (number) with `new Date().toISOString()` (string).  
   - **Fix:** Compare with `Date.now()` so expiry is a numeric comparison.

---

## 4. Improvements Recommended

1. **Register + email verification (mobile)**  
   - After successful `authService.register`, navigate to a “Verify email” screen (e.g. pass `email`), user enters OTP.  
   - Call `POST /api/user/verifyEmail` with `{ email, otp }`.  
   - Then either:  
     - Call login with email + a temporary/one-time password if backend supports it, or  
     - Redirect to Login and show “Email verified. You can sign in.”  
   - Add a dedicated VerifyEmail screen or reuse the same OTP screen with a different API (verifyEmail vs verifyForgotPasswordOtp).

2. **Google: backend code exchange**  
   - Add e.g. `POST /api/user/authWithGoogleCode` body `{ code, redirect_uri }`.  
   - Server exchanges `code` with Google (using server-side `client_id` + `client_secret`), gets profile, creates/updates user, returns your JWT tokens.  
   - Mobile: after getting the code from the browser, send only the code (and redirect_uri if needed) to this endpoint; remove client-side token exchange.

3. **Auth service register**  
   - Today `auth.service.ts` expects `response.data` to contain `accessToken` and `user` for register.  
   - Align with backend: either treat register as “success + message” and navigate to verify-email flow, or add a separate “login after verify” step and don’t expect tokens from register.

4. **Redux vs AsyncStorage on startup**  
   - Ensure on app load you restore `user` and `accessToken` from AsyncStorage into Redux (e.g. in AppNavigator or a root component) so the user stays logged in and the correct stack (Auth vs Main) is shown.

5. **Security**  
   - Ensure `SECRET_KEY_ACCESS_TOKEN`, `SECRET_KEY_REFRESH_TOKEN`, and (for Google) `client_secret` are only in server env, never in the app.  
   - Keep refresh token in httpOnly cookie for web if you have a web app; for mobile, storing refresh token in AsyncStorage and sending in header is acceptable.

6. **Error messages**  
   - Backend: “User not register” → “No account found for this email” (or similar).  
   - “Check your password” → “Invalid email or password” (avoid revealing that the email exists).

---

## 5. Quick Reference

| Flow | Backend | Mobile |
|------|---------|--------|
| **Login** | POST /api/user/login → tokens + cookies | authService.login → setCredentials + get user |
| **Register** | POST /api/user/register → OTP email, no tokens | Expects tokens → **mismatch** |
| **Verify email** | POST /api/user/verifyEmail | Only used for forgot-password OTP today |
| **Google** | POST /api/user/authWithGoogle (body: name, email, avatar…) | OAuth in app → code exchange fails without secret → loginWithGoogle with profile |
| **Forgot password** | forgot-password → verify-forgot-password-otp → reset-password | ForgotPassword → VerifyOtp → ResetPassword |
| **Logout** | GET or POST /api/user/logout (auth) | authService.logout (POST) + clear storage |
| **Refresh** | POST /api/user/refresh-token (Bearer refreshToken) | api.ts 401 handler → refresh → retry |

---

## 6. Summary

- **Working:** Login (email/password), forgot password (OTP + reset), logout (with POST), refresh token (and the bugs above fixed).  
- **Partially working:** Google auth works only if the app can get user profile (e.g. you use a backend code exchange or another method that doesn’t rely on client-side code exchange without secret).  
- **Broken:** Register flow: backend requires email verification and doesn’t return tokens; mobile expects tokens and tries to log the user in immediately.  
- **Next steps:** Implement register → verify email (OTP) → then login or redirect to login; and move Google code exchange to the backend.
