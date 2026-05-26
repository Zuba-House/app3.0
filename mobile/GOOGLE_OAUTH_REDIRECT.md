# Google Sign-In — redirect URI (TestFlight / production)

The app uses **expo-auth-session** with your **iOS OAuth client ID** (not Firebase popup like the web).

## OAuth client ID (iOS)

`473177050132-9rdnpnh57lnd3oi29tgujdnihgqfajo7.apps.googleusercontent.com`

From `mobile/eas.json` → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Redirect URI the app sends

```
com.googleusercontent.apps.473177050132-9rdnpnh57lnd3oi29tgujdnihgqfajo7:/oauthredirect
```

Computed in `src/features/auth/hooks/useGoogleSignIn.ts` → `resolveGoogleOAuthRedirectUri()`.

This matches the URL scheme added in `app.config.js` (`CFBundleURLTypes`).

## What to add in Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Open the **Web application** OAuth client (same project as your iOS client):  
   `473177050132-1qblfnv4gap1gkpfq6mg4iu11lucp48u.apps.googleusercontent.com`
3. Under **Authorized redirect URIs**, add **exactly**:
   - `com.googleusercontent.apps.473177050132-9rdnpnh57lnd3oi29tgujdnihgqfajo7:/oauthredirect`
4. (Optional backup) also add:
   - `ninja.wpapp.appzubahousecom:/oauthredirect`
   - `zuba://redirect`
5. Save.

Also confirm the **iOS** OAuth client has bundle ID: `ninja.wpapp.appzubahousecom`.

## Web vs mobile

| Platform | Flow |
|----------|------|
| Web (`zuba-web2.0`) | Firebase `signInWithPopup` — no redirect URI in the app |
| Mobile | Browser OAuth → redirect back to app via custom scheme above |

After saving in Google Cloud, install a **new** TestFlight build (redirect URI is baked at build time; Console change applies immediately).
