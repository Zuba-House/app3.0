# Delete account on Render (`zuba-api.onrender.com`)

## Investigation (repo code)

| Check | Result |
|-------|--------|
| `DELETE /delete-account` in `server/route/user.route.js` | **YES** (line 27, `auth`, `deleteOwnAccount`) |
| Registered in `server/index.js` | **YES** — `app.use('/api/user', userRoutes)` |
| Controller | `deleteOwnAccount` in `user.controller.js` |
| User model | `user.model.js` — uses `findByIdAndDelete` |
| Cart cleanup | `cartProduct.modal.js` (`CartProductModel.deleteMany`) |
| Push tokens | `pushToken.model.js` |

## Why mobile still shows 404

Production currently returns a **different API** (root message `"Server is running on port 8000"`, not `"Zuba House API Server"` v3.0.0). That means Render is **not** running this repo’s `server/` app yet.

## Fix on Render Dashboard

1. Open https://dashboard.render.com → service **zubahouse-api** (or `zuba-api`).
2. **Settings → Build & Deploy**
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Manual Deploy** → Deploy latest commit.
4. Wait until status is **Live**.

## Verify deployment

```bash
curl https://zuba-api.onrender.com/api/health
```

Expected when correct server is live:

```json
{
  "status": "healthy",
  "apiVersion": "3.0.0",
  "routes": { "deleteAccount": "DELETE /api/user/delete-account" }
}
```

```bash
curl -X DELETE https://zuba-api.onrender.com/api/user/delete-account
```

Expected: **401** with `"Authentication token required"` (not 404).

## Mobile test

Settings → Delete Account → type `DELETE` → confirm → success toast → Login screen.
