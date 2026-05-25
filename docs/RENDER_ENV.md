# Render environment variables (zubahouse-api)

Set these in **Render Dashboard → zubahouse-api → Environment** (copy values from local `server/.env`).

## Required (server will not start without these)

| Key | Description |
|-----|-------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string |
| `SECRET_KEY_ACCESS_TOKEN` | JWT access secret |
| `SECRET_KEY_REFRESH_TOKEN` | JWT refresh secret |
| `JSON_WEB_TOKEN_SECRET_KEY` | Legacy JWT secret |
| `SENDGRID_API_KEY` | SendGrid API key (`SG....`) |
| `EMAIL_FROM` | e.g. `orders@zubahouse.com` |
| `cloudinary_Config_Cloud_Name` | Cloudinary cloud name |
| `cloudinary_Config_api_key` | Cloudinary API key |
| `cloudinary_Config_api_secret` | Cloudinary API secret |

## Email sign-in / sign-up (required for OTP)

| Key | Where to copy from |
|-----|-------------------|
| `SENDGRID_API_KEY` | SendGrid → API Keys (starts with `SG.`) |
| `EMAIL_FROM` | e.g. `orders@zubahouse.com` (must be verified in SendGrid) |
| `EMAIL_SENDER_NAME` | `Zuba House` |

Without `SENDGRID_API_KEY`, register will fail when sending the verification OTP.

## Google sign-in (mobile app)

The mobile app uses **`POST /api/user/authWithGoogle`** (profile from Google → your API).  
You do **not** need `GOOGLE_CLIENT_SECRET` on Render for this flow.

Google OAuth client IDs go in **`mobile/.env`** only (rebuild app after changing):

| Mobile variable | Your value (from `mobile/.env`) |
|-----------------|----------------------------------|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `473177050132-1qblfnv4gap1gkpfq6mg4iu11lucp48u.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `473177050132-9rdnpnh57lnd3oi29tgujdnihgqfajo7.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | `473177050132-2s3gl7imtijd3h36bj9tjtjqktc25eja.apps.googleusercontent.com` |

Optional on Render (only if you add server-side Google code exchange later):

| Key | Value |
|-----|--------|
| `GOOGLE_CLIENT_ID` | Same as **Web** client ID above |
| `GOOGLE_CLIENT_SECRET` | Google Cloud → Credentials → Web client → secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | `zuba://redirect` |

## Recommended

| Key | Value |
|-----|--------|
| `NODE_VERSION` | `20.18.0` or `22` (18.x is EOL) |
| `API_URL` | `https://zuba-api.onrender.com` |
| `ADMIN_EMAIL` | `sales@zubahouse.com` |
| `ADMIN_EMAILS` | `olivier.niyo250@gmail.com` (comma-separated bootstrap admins) |

## MongoDB Atlas

In Atlas → **Network Access**, allow **0.0.0.0/0** (or Render outbound IPs) so the web service can connect.

## Custom domains (CORS)

Allowed web origins include `https://mobileapp.zubahouse.com`, `https://admin.zubahouse.com`, `https://www.admin.zubahouse.com`, and `https://appadmin-rho.vercel.app`, plus any `*.zubahouse.com` or `*.vercel.app` host. Native iOS/Android apps send no `Origin` header and are not blocked by CORS.

If the web app calls the API directly (`VITE_API_URL=https://zuba-api.onrender.com`), redeploy **zubahouse-api** after updating `server/index.js` so CORS changes take effect on the live API.

Alternatively, leave `VITE_API_URL` unset on Vercel so the app uses same-origin `/api` (proxied by `vercel.json`).

In **Firebase Console → Authentication → Settings → Authorized domains**, add `mobileapp.zubahouse.com` for Google sign-in on that domain.

## Verify after deploy

```bash
curl https://zuba-api.onrender.com/api/health
```

Expected: `"apiVersion": "3.0.0"` and `"status": "healthy"`.

If deploy fails, open **Logs** and search for `Missing required environment variables` or `Could not connect to MongoDB`.
