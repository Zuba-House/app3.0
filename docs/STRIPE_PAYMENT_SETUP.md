# Stripe real payments — Zuba mobile

The app uses **Stripe Hosted Checkout**: customers enter card details on Stripe’s secure page (not stored in your app). After payment, the order status becomes **Paid**.

## Where to put API keys

### Server only (required) — Render `zuba-api`

In [Render Dashboard](https://dashboard.render.com) → your API service → **Environment**:

| Variable | Example | Notes |
|----------|---------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | **Secret** — never in mobile or git |
| `STRIPE_CURRENCY` | `USD` or `CAD` | Charge currency |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe → Webhooks (recommended for production) |
| `STRIPE_TARGET_ACCOUNT` | `acct_...` | Only if using Stripe Connect / `sk_org_` keys |

Redeploy the API after saving.

**Test keys** start with `sk_test_` / `pk_test_`.  
**Live keys** start with `sk_live_` / `pk_live_` (real money).

### Mobile (optional)

File: `mobile/.env`

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Not required for the current flow (browser checkout). The publishable key is safe in the app; the **secret key must stay on the server**.

Restart Expo after changing `.env`:

```powershell
cd mobile
npx expo start --dev-client --clear
```

---

## Get keys from Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers** → **API keys**
2. Copy **Publishable key** → mobile `.env` (optional)
3. Copy **Secret key** → Render `STRIPE_SECRET_KEY`

### Test card (test mode only)

| Field | Value |
|-------|--------|
| Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any |

---

## Webhook (production)

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://zuba-api.onrender.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy **Signing secret** → Render `STRIPE_WEBHOOK_SECRET`

---

## Verify setup

```bash
curl https://zuba-api.onrender.com/api/stripe/health
```

Expect `"ok": true` and `"configured": true`.

---

## User flow in the app

1. Checkout → place order → **Order placed** (payment pending)
2. Tap **Complete payment**
3. Stripe opens in the browser — enter card
4. Return to app → status **Paid**

---

## API routes (implemented)

| Method | Path |
|--------|------|
| POST | `/api/stripe/create-checkout-session` |
| GET | `/api/stripe/checkout-status/:sessionId` |
| POST | `/api/order/confirm-payment/:orderId` |
| POST | `/api/stripe/webhook` |
