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

## Recommended

| Key | Value |
|-----|--------|
| `NODE_VERSION` | `20.18.0` or `22` (18.x is EOL) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `API_URL` | `https://zuba-api.onrender.com` |
| `ADMIN_EMAIL` | `sales@zubahouse.com` |

## MongoDB Atlas

In Atlas → **Network Access**, allow **0.0.0.0/0** (or Render outbound IPs) so the web service can connect.

## Verify after deploy

```bash
curl https://zuba-api.onrender.com/api/health
```

Expected: `"apiVersion": "3.0.0"` and `"status": "healthy"`.

If deploy fails, open **Logs** and search for `Missing required environment variables` or `Could not connect to MongoDB`.
