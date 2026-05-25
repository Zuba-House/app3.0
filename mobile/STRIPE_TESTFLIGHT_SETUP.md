# Stripe + TestFlight (real card payments)

Backend: **https://zuba-api.onrender.com** (`zuba-web2.0` on Render).

## 1. Add your publishable key (required before rebuild)

Get **Publishable key** from Stripe Dashboard → Developers → API keys (**Live** mode).  
It starts with `pk_live_` (safe in the app — never put `sk_live_` in the app).

Replace `pk_live_REPLACE_ME` in **both** places:

1. `mobile/eas.json` → `build.production.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. `mobile/.env` (for local dev):
   ```
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_REAL_KEY
   ```

## 2. Build & submit

From `mobile/`:

```powershell
eas build --platform ios --profile production --non-interactive
eas submit --platform ios --profile production --latest --non-interactive
```

Version is **11.0.2** (bump if Apple rejects duplicate version).

## 3. Checkout flow (after this update)

1. User taps **Pay $X** on Review  
2. Order is created on `zuba-api`  
3. Stripe Payment Sheet opens **in the app** (add card / pay)  
4. On success → order marked **Paid** on server → **Order placed!** (paid)  
5. If user cancels → **Payment** screen (not “Order placed” first)

## 4. Test with real money

Live keys = real charges. Use a small order and refund in Stripe Dashboard after testing.

## Google sign-in

Not in this build yet — email sign-in only. Add Google after card payments work.
