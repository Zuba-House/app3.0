# Install Zuba House dev build (Stripe payments)

`npx expo start` only updates JavaScript. **Card payments need the native Stripe module**, which is only in a custom dev build.

## 1. Install on iPhone (required)

Open this link **on your iPhone** in Safari, then install:

https://expo.dev/artifacts/eas/vyE1cieFfkyMETGdM7NiSz.ipa

Delete the old **Zuba** / **EQUITY** dev app first if you still have it. Open **Zuba House** after install.

## 2. Stripe publishable key (required)

In `mobile/.env` add your live publishable key:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

Restart Metro:

```powershell
npx expo start --dev-client --tunnel --clear
```

## 3. Rebuild only if needed

From `mobile/` (do not `cd mobile` again):

```powershell
.\build-ios-dev.ps1
```
