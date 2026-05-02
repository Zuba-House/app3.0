# Zuba House Apps 3.0 - Current Tech Stack and Delivery Status

Last updated: 2026-04-21  
Scope: current repository state in `app3.0`

## 1) System Landscape (What exists right now)

This repository is a multi-app setup with shared backend API usage:

- `client`: customer web app (React + Vite)
- `frontend`: another customer web app variant (appears functionally similar to `client`)
- `admin`: admin dashboard (React + Vite)
- `mobile`: React Native app (Expo + TypeScript)
- `backend`: Python FastAPI proxy layer for mobile/web proxying
- `server`: Node backend code presence is partial in this repo snapshot (at least `controllers/user.controller.js` is present)

The core API base URL used by web/admin/mobile is consistently configured around:

- `https://zuba-api.onrender.com`

---

## 2) Current Tech Stack (By module)

## 2.1 Customer Web (`client`, and likely mirrored in `frontend`)

- Framework: React 18 + Vite
- Routing: `react-router-dom` (v7 series)
- UI: Material UI (`@mui/material`) + styled-components + custom CSS
- Data/API: `axios` + `fetch`
- Payments: Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- Search: Algolia (`algoliasearch`, `react-instantsearch`)
- Auth helpers/infra: Firebase SDK in project
- UX libs: Framer Motion, Swiper, react-hot-toast, image zoom/lazy load
- Build/tooling: ESLint + Tailwind + PostCSS

## 2.2 Admin Dashboard (`admin`)

- Framework: React 18 + Vite
- Routing: `react-router-dom`
- UI: Material UI + custom dashboard layout (header/sidebar/content pattern)
- Charts/analytics UI: `recharts`
- Editor/media flows: `react-simple-wysiwyg`, image upload helpers
- Data/API: shared utility wrapper around `axios/fetch`, token refresh interceptor
- Build/tooling: ESLint + Tailwind + PostCSS

## 2.3 Mobile App (`mobile`)

- Framework: React Native 0.81 + Expo SDK 54 + React 19
- Language: TypeScript
- Navigation: React Navigation (native stack + bottom tabs)
- State: Redux Toolkit + React Redux
- Storage: AsyncStorage
- Notifications: `expo-notifications` + Firebase project files included
- Device/platform: `expo-device`, `expo-location`, image-picker, web-browser
- API client: custom fetch-based client with token refresh queue/retry

## 2.4 Proxy API layer (`backend`)

- Framework: FastAPI + httpx
- Purpose: proxy `/api/*` calls to `ZUBA_API_URL`, CORS handling, health endpoint
- Additional capability: serve mobile web build (`/app/mobile/dist`) if available

## 2.5 Deployment signal

- `render.yaml` references a Node web service (`zubahouse-api`) with env keys for Google OAuth and Node runtime.
- This indicates intended production backend is Node-based, while this repo also contains a Python proxy layer.

---

## 3) What has already been implemented

## 3.1 Customer-facing web capabilities

Observed pages/features:

- Product listing/details, brand pages, sales pages
- Cart + guest cart + merge-on-login behavior
- Checkout flow and order success/failed pages
- User account, addresses, order history, wishlist
- Search and blog pages
- CMS-driven homepage sections (banners/blog/category/product blocks)

Notable implementation details:

- Guest cart is stored in local storage and merged to server cart after login.
- Auth handling includes token invalidation checks and session cleanup.
- Frontend analytics events are sent to `/api/analytics/track`.

## 3.2 Admin dashboard capabilities

Observed management domains:

- Dashboard overview
- Products (including enhanced add/edit and variations manager)
- Categories/subcategories
- Orders
- Users
- Vendors and vendor product approval/rejection
- Banners (`bannerV1`, `bannerList2`, responsive banners)
- Blog management
- Logo management
- Coupons and gift cards
- Profile/auth pages
- Analytics dashboard page

This is a substantial CRUD/control plane, not a skeleton.

## 3.3 Mobile capabilities

Implemented and wired:

- Auth endpoints configured (login/register/refresh/logout/forgot/reset/Google)
- Product browsing/search/image-search service wrappers
- Cart/order/address/wishlist API constants and service utilities
- Coupon and gift card endpoints configured
- Shipping and phone/address autocomplete endpoints configured
- Stripe checkout endpoint constants and payment screen integration paths
- Push notification service with Expo token registration endpoint call

## 3.4 Auth backend logic (visible portion)

In `server/controllers/user.controller.js`, implemented flows include:

- Register + OTP email verification
- Email/password login
- Google auth (profile-based and authorization-code exchange variant)
- Logout
- Token refresh with rotation
- Forgot-password OTP verification and reset
- User details retrieval
- Review workflows with admin moderation hooks

---

## 4) API Inventory (what exists from consumer side)

The app code calls many API families. Based on actual route usage/constants:

- `user`: login/register/logout/refresh, profile details, reset/forgot/verify, Google auth, avatar upload
- `product`: list/details/filter/sort/search/sale/featured/category-based lists
- `category`: list/create/update/delete, image upload/delete
- `cart`: add/get/update qty/delete/empty
- `order`: create/list/status/update/count/sales/user analytics
- `address`: add/get/update/delete
- `myList` (wishlist): list/add/remove
- `blog`: list/get/add/edit/delete/upload
- `bannerV1`, `bannerList2`, `banners` (responsive/public)
- `homeSlides`, `logo`
- `coupons`: all/create/edit/delete/validate/apply/usage hooks
- `gift-cards`: all/create/edit/delete/validate/apply/add-balance/my-cards
- `analytics`: track, dashboard, countries, devices, pages
- `shipping`: calculate/rates/validate-phone/parse-phone/address autocomplete/details
- `stripe`: payment intent/checkout session/status
- `notifications`: register-token (mobile), plus backend design references for send/broadcast/preferences

Important note: this document reflects API usage from clients and constants, not an OpenAPI-exported contract. There may be endpoints used by UI that are missing or partially implemented server-side in this repo snapshot.

---

## 5) Dashboard status

You currently have at least two dashboard-style surfaces:

- `admin` dashboard (fully featured operational dashboard)
- analytics pages in admin pulling analytics endpoints

Potentially implied but not fully represented in this snapshot:

- vendor-specific backend/admin management domain (`/api/admin/vendors*`)
- a node server entrypoint architecture (mentioned in product docs/memory and render config)

Overall dashboard maturity: medium-high on frontend/admin UX coverage, but backend code completeness in this repository appears fragmented.

---

## 6) API communication with existing web and cross-app integration

Yes, there is active communication via APIs between apps and the existing web backend.

- Web (`client`/`frontend`) communicates with `VITE_API_URL` (defaulting to Render API URL).
- Admin uses same base URL pattern and token-auth API utility.
- Mobile resolves `API_URL` from Expo/public env and talks to the same `/api/*` domains.
- The Python `backend/server.py` can proxy `/api/*` to `https://zuba-api.onrender.com`.

In practical terms, all app surfaces are built to consume one shared backend API namespace.

---

## 7) Current gaps and risks

## 7.1 Architecture/Repository consistency risk

- Node backend appears incomplete in this repo (only partial `server` tree visible), while clients call many Node-style endpoints.
- Presence of both FastAPI proxy and Node deployment config can confuse ownership of source-of-truth backend logic.

## 7.2 Duplicate web frontends

- `client` and `frontend` are extremely similar in dependencies and structure.
- Risk: duplicate maintenance, drift, and bug fixes applied in one but missed in the other.

## 7.3 Shipping feature gap

- Shipping rates component in web has TODO/stub behavior ("Shipping calculation will be available soon").
- User impact: checkout confidence and conversion can be affected.

## 7.4 Auth flow alignment concerns

- Internal docs in repo mention register/verification flow mismatches across mobile/backend.
- This should be revalidated against current live backend behavior to avoid onboarding failure.

## 7.5 Code quality signals

- Additional repository notes mention unresolved mobile issues (runtime variable references, mock ratings usage in parts, heavy logging).

---

## 8) What should be done next (deep, prioritized)

## P0 - Make architecture explicit and stable (highest priority)

1. Define source-of-truth backend:
   - Decide whether Node backend in-repo is canonical, or external service is canonical and this repo is mostly clients + proxy.
2. If canonical backend is external:
   - Add contract docs (OpenAPI/Postman) and versioning strategy.
   - Mark local backend folders as proxy/legacy/partial clearly.
3. If canonical backend should be in this repo:
   - Restore full server tree, route registration, models, middleware, env examples, and startup docs.

Deliverable: a single "Backend Architecture" document + runnable dev path.

## P1 - API contract hardening and discoverability

1. Publish endpoint inventory with:
   - path, method, auth requirement, request body schema, response schema, error codes.
2. Add environment matrix:
   - local/staging/prod API base URLs and required env vars for each app.
3. Add compatibility notes:
   - which endpoints are consumed by web/admin/mobile.

Deliverable: `docs/API_CONTRACT.md` + sample requests.

## P1 - Consolidate duplicate web app surfaces

1. Audit differences between `client` and `frontend`.
2. Choose one active customer web app as canonical.
3. Archive or remove the second, or convert it into shared package-based architecture.

Deliverable: one maintained customer web app with shared component strategy.

## P1 - Checkout reliability and revenue-critical gaps

1. Complete shipping calculation implementation (remove TODO placeholder).
2. Validate coupon/gift-card + shipping + Stripe end-to-end flow in all clients.
3. Add robust fallback/error UX during payment and order creation.

Deliverable: checkout E2E test checklist + successful integration evidence.

## P2 - Auth and session hardening

1. Confirm register -> verify-email -> login flow consistency across web/mobile/backend.
2. Standardize token field naming (`accessToken` vs `accesstoken`) in API responses.
3. Ensure refresh-token rotation behavior is consistent in all clients.

Deliverable: auth flow sequence diagrams and passing integration tests.

## P2 - Observability and operational readiness

1. Add central error logging/monitoring (web, admin, mobile, backend).
2. Reduce console-noise and convert to structured logs where needed.
3. Add API health dashboard with basic SLA metrics.

Deliverable: monitoring baseline and incident playbook.

## P3 - Quality engineering and maintainability

1. Add smoke tests for critical flows:
   - login, product browse, cart, checkout, order status.
2. Add lint/typecheck/test scripts for every app and CI pipeline gates.
3. Improve TypeScript strictness in mobile, and shared typed API interfaces.

Deliverable: CI pipeline that blocks regressions before deployment.

---

## 9) Suggested immediate action plan (next 7-10 days)

- Day 1-2: Finalize backend source-of-truth and documentation.
- Day 2-4: API contract freeze + env standardization.
- Day 4-6: Shipping + checkout E2E hardening.
- Day 6-8: Auth flow alignment pass across web/mobile.
- Day 8-10: Remove frontend duplication risk and set CI quality gates.

---

## 10) Executive summary

The app ecosystem is feature-rich on the frontend side (customer web, admin, mobile) and already integrated with a broad API surface (commerce, promotions, shipping, analytics, notifications, payments). The biggest current challenge is not lack of features; it is platform coherence: backend source-of-truth clarity, API contract formalization, and consistency across duplicated clients and mixed backend layers. Once these are stabilized, delivery speed and reliability will improve significantly.

