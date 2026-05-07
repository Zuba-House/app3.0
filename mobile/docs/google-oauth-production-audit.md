# Google OAuth Production Audit

## Mobile App Identity

- iOS bundle id: `com.zubahouse.customer`
- Android package: `com.zubahouse.customer`
- App scheme: `zuba`
- Native OAuth redirect (default dev/prod native): `com.zubahouse.customer:/oauthredirect`
- Custom fallback redirect: `zuba://redirect`

## Required Google Cloud OAuth Clients

Create and configure all three:

1. **Web client**
   - Used for consent compatibility and backend allow-listing.
   - Add authorized redirect URI only if your web flow uses code exchange.
2. **iOS client**
   - Bundle id must be `com.zubahouse.customer`.
3. **Android client**
   - Package must be `com.zubahouse.customer`.
   - Add SHA-1 and SHA-256 for debug + release + Play signing.

## OAuth Consent Screen

- Publishing status must allow your test account.
- Add app name, support email, and developer contact.
- Add test users if app is in Testing mode.
- Scopes used: `openid`, `profile`, `email`.

## Mobile Config Variables

Set these for mobile builds:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` (optional override; default runtime URI is used if omitted)

## Backend Config Variables

Set these on backend:

- `GOOGLE_CLIENT_ID` (web)
- `GOOGLE_CLIENT_SECRET` (web secret)
- `GOOGLE_IOS_CLIENT_ID`
- `GOOGLE_ANDROID_CLIENT_ID`
- `GOOGLE_OAUTH_REDIRECT_URI` (fallback)
- `GOOGLE_OAUTH_REDIRECT_URIS` (comma-separated allow-list; include all runtime redirects)

Example:

`GOOGLE_OAUTH_REDIRECT_URIS=zuba://redirect,com.zubahouse.customer:/oauthredirect`

## Android Fingerprints

Use all three contexts:

- local debug keystore
- EAS build keystore
- Play App Signing certificate

Commands:

- `keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore`
- `eas credentials -p android`

## iOS URL Scheme Checks

- Ensure `GoogleService-Info.plist` is valid for bundle id.
- Ensure reversed client id is present as URL scheme (native config build output).
- Rebuild dev client/TestFlight after OAuth changes.

## Verification Matrix

1. Guest -> Login modal -> Google sign-in
2. Guest -> Checkout gate -> Google sign-in -> returns to checkout
3. Guest wishlist saved locally -> Google sign-in -> merged to cloud
4. Cancel Google flow -> proper cancel message
5. Offline Google flow -> offline message
6. Invalid client setup -> config error message (not cancel)
7. App restart -> session restored
8. Logout -> clean state reset

