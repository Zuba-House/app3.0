# Zuba Mobile — Pre-Production Report

Generated: 2026-05-21  
Scope: `mobile/` (Expo SDK 54, EAS dev client)

---

## Section A — What has been completed

### Authentication
- Email/password login, register, forgot password, OTP reset
- Token refresh + session restore on app launch
- Google sign-in via `expo-auth-session` → `POST /api/user/authWithGoogle` (same contract as web)
- Branded “Continue with Google” button (official G logo styling)
- EAS dev client build with iOS URL schemes + Google OAuth env on Expo
- Guest cart / wishlist merge on login

### Commerce core
- Product browse, search, product detail, cart (guest + authenticated)
- Multi-step checkout (address, shipping, payment, review)
- Order creation against production API (`POST /api/order/create`)
- Stripe checkout session + payment status polling
- Order confirmation screen with success state

### Orders
- Orders list maps backend fields: `totalAmt`, `products`, `order_status` / `status`
- Order numbers formatted from `orderNumber` or last 6 chars of `_id`
- Dates formatted as `Nov 26, 2025` style
- Order detail: friendly error + **Retry**; fallback when `GET /api/order/:id` is missing on production
- **Order detail UI redesign (completed)** — cards, status badge, line items, summary, delivery, payment

### Navigation UX (completed)
- Stack back button no longer shows internal **MainTabs** label on Order Details (`headerBackTitle: Orders`)
- Global stack headers use warm palette; `headerBackTitleVisible: false` by default
- Tab bar labels: Home, Search, Wishlist, Orders, Account (with matching icons)

### Account deletion — mobile (completed)
- **Danger Zone** on Account screen with two-step confirmation (alert + type `DELETE`)
- Calls `DELETE /api/user/delete-account` via `userService.deleteAccount()`
- On success: purges local storage, clears cart state, shows welcome/guest Account screen
- **Backend outstanding:** `DELETE /api/user/delete-account` is **not** in `server/route/user.route.js` yet (only admin `DELETE /api/user/deleteUser/:id`). Deploy self-service endpoint before store submission.

### Push notifications — in-app (completed)
- `usePushNotifications` hook registers token on login and listens for pushes
- Foreground: system banner + sound + in-app toast with friendly order-update copy
- Tap notification: navigates to Order Detail, Cart, Product, or Home as appropriate
- Android channels: orders (max priority), promotions, cart, general

### Checkout / payment UX
- After order is placed (`Received`), user goes to **Order Confirmation** immediately
- Optional “Complete payment with Stripe” from confirmation when payment still pending
- Payment screen auto-exits if order already paid / no online payment required
- Cart cleared on successful checkout
- Dev-only Stripe test card hint on payment screen

### Infrastructure
- `app.config.js` injects iOS Google reversed URL scheme from `.env`
- `expo-dev-client` for development builds
- EAS project linked (`@olivierndev/zuba-mobile`)
- Non-blocking toasts via `react-native-toast-message`

---

## Section B — What still needs to be done

| Area | Status |
|------|--------|
| **Backend `DELETE /api/user/delete-account`** | Mobile ready; route must be added and deployed to production |
| **Email verify after register** | Backend sends OTP; mobile may not show full verify-email flow before login |
| **Push notifications E2E on device** | Wired in app; validate delivery on physical device with production API |
| **Profile edit / avatar upload** | Partial API wiring; needs QA |
| **Production `GET /api/order/:id`** | Deploy route to production API (mobile uses list fallback if 404) |
| **Google native config files** | Regenerate `GoogleService-Info.plist` / `google-services.json` for `com.zubahouse.customer` |
| **Deep linking** | Universal links / payment return URLs not fully tested |
| **Offline mode** | Limited handling |
| **i18n / accessibility** | Not implemented |
| **Automated E2E tests** | Minimal |

---

## Section C — Issues that WILL cause problems in production

1. **Missing self-service delete API on production** — Account deletion UI will error until `DELETE /api/user/delete-account` is deployed.
2. **Production API route gap** — `GET /api/order/:id` may 404 until backend is deployed; fallback works but detail may be limited.
3. **Order-before-pay flow** — Orders created with `payment_status: pending` before Stripe; users complete payment separately.
4. **Payment return from Stripe** — Success/cancel URLs point to web host; mobile relies on app resume + polling.
5. **`authWithGoogle` trusts client profile** — Server should verify Google ID token for high-security deployments.
6. **npm audit vulnerabilities** — Review before store submission.

---

## Section D — Security & config gaps before App Store submission

### Secrets / keys
- Mobile `.env` holds public Google client IDs only (OK in client).
- Regenerate Firebase plist + `google-services.json` for **`com.zubahouse.customer`**.

### App Store review risks
- Account deletion must work end-to-end once backend endpoint is live (mobile UI is in place).
- Privacy policy + data deletion disclosure required.
- Publish Google OAuth consent screen before public launch.

---

## Section E — Recommended priority order

1. **Deploy `DELETE /api/user/delete-account`** — Unblock account deletion for store review.
2. **Deploy `GET /api/order/:id` to production** — Full order detail from API.
3. **Physical-device push QA** — Order status change → notification → tap → Order Details.
4. **Regenerate Firebase / Google native files** — Match bundle ID and OAuth project.
5. **Stripe return deep link** — Return user into app after web checkout.
6. **Register → verify email flow** — Align with backend OTP.
7. **Publish Google OAuth consent** — Move out of Testing mode.

---

## Files changed in latest pass

- `src/navigation/AppNavigator.tsx` — back titles, stack header styling
- `src/screens/Orders/OrderDetailScreen.tsx` — full UI redesign
- `src/screens/Profile/ProfileScreen.tsx` — Danger Zone + delete account flow
- `src/services/user.service.ts` (new)
- `src/services/notification.service.ts` — in-app messages, navigation, channels
- `src/hooks/usePushNotifications.ts` (new)
- `src/navigation/RootNavigator.tsx` — push hook
- `src/core/auth/authManager.ts` — `purgeLocalAccountData`
- `src/constants/config.ts` — `DELETE_ACCOUNT`, `REGISTER_PUSH_TOKEN`
- `src/utils/order.mappers.ts` — status badge colors, payment method

---

## Quick test checklist

- [ ] Orders list shows correct **$** totals and item counts
- [ ] Order detail shows cards, badges, line items (not plain text)
- [ ] Back button on Order Details reads **Orders** (not MainTabs)
- [ ] Account screen shows **Delete Account** in Danger Zone
- [ ] Type DELETE confirmation works; API errors gracefully if endpoint missing
- [ ] Push notification shows in-app toast when app is open (device + permissions)
- [ ] Tap order notification opens Order Details
- [ ] Metro reload after changes (no rebuild needed for JS fixes)
