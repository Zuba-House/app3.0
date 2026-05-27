# Zuba House Release Readiness Checklist

Last updated: 2026-05-26

## Scope of latest release

- Checkout payment flow stabilized for iOS TestFlight builds.
- Stripe card errors now surface user-friendly decline reasons.
- Saved card support added (Stripe customer + saved methods).
- Home feed image loading and category loading stability improved.
- Order confirmation and order details screens corrected to avoid false "pending" display after successful charge.

## Rejection-risk checklist (App Store)

- Payments are processed by Stripe, not simulated.
- App does not claim unsupported payment methods.
- No test credentials shown in production UI.
- No placeholder payment banners that imply pay-again after successful charge.
- No debug-only payment copy shown to users.
- Order details screen displays real order id, totals, and line items when API returns order document.

## Git hygiene

- Local Cursor metadata is ignored via `.gitignore` (`.cursor/`).
- Local release artifact folders are ignored via `.gitignore` (`Release Build 1/`).
- Temporary screenshots and local-only build notes should not be committed.

## Backend source of truth

For backend/API changes, use:

`zuba2.0 web/zuba clone/zuba-web2.0` on branch `master`.

## Mobile release flow

1. Merge/push approved mobile changes to `app3.0` `main`.
2. Build:
   - `cd mobile`
   - `npx eas-cli build --platform ios --profile production --non-interactive`
3. Submit:
   - `npx eas-cli submit --platform ios --profile production --latest --non-interactive`
4. Verify in App Store Connect TestFlight before external rollout.

## Smoke tests before release

- Sign in / sign out
- Add to cart / remove from cart
- Checkout steps (Address -> Shipping -> Payment -> Review)
- Successful payment with live Stripe card
- Declined payment path (insufficient funds / incorrect CVC)
- Order confirmation status immediately after payment
- Orders list and Order details render correctly

