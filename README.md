**Zuba Web 2.0**

- **Repo:** `zuba-web2.0`
- **Owner:** Zuba-House
- **Workspaces:** `admin/`, `client/`, `server/`

**Overview**:
- Zuba Web 2.0 is a full-stack e-commerce platform (Admin + Client + Server) built with React (Vite) frontends and a Node.js + Express + MongoDB backend. It supports both Simple and Variable products via an attribute/variation system (WooCommerce/Shopify-style).

**High-level features**:
- Product types: `simple` and `variable` (attribute-driven variations)
- Admin UI: product creation (AddProductV2), Attributes Manager, Variations Manager
- Upload images for products and banner images (admin)
- Cart, orders, payments (Stripe / PayPal hooks prepared)
- Auth, user management, reviews

**Repository structure (top-level)**
- `admin/` — Admin dashboard app (React + Vite + Tailwind + MUI)
- `client/` — Storefront app (React + Vite + Tailwind)
- `server/` — API server (Node.js + Express + Mongoose)

Inside each folder you'll find the usual `package.json`, `src/` and build configs. Key server areas:
- `server/controllers/` — route handlers
- `server/models/` — Mongoose models (Product, Attribute, Variation, User, Order, etc.)
- `server/route/` or `server/routes/` — Express routes
- `server/config/connectDb.js` — DB connection logic

**Quick start (local development)**
Pre-reqs:
- Node.js 18+ (or compatible)
- npm or pnpm
- Docker (recommended) for running a local MongoDB if you don't want to use Atlas

1) Install dependencies for each subproject
- Admin:
  ```powershell
  cd admin
  npm install
  ```
- Client:
  ```powershell
  cd client
  npm install
  ```
- Server:
  ```powershell
  cd server
  npm install
  ```

2) Local MongoDB (recommended for quick dev)
- Using Docker (recommended):
  ```powershell
  docker run -d -p 27017:27017 --name zuba-mongo -e MONGO_INITDB_DATABASE=zuba mongo:6
  ```
- Add local DB string to your `server/.env` (or use `.env.sample`):
  ```text
  MONGODB_LOCAL_URI=mongodb://localhost:27017/zuba
  ```

3) Environment variables
- Copy `server/.env.sample` (or create `server/.env`) and fill in secrets. Example keys used:
  - `PORT` — server port
  - `MONGODB_URI` — Atlas connection string (optional)
  - `MONGODB_LOCAL_URI` — local fallback (recommended for dev)
  - `EMAIL`, `EMAIL_PASS` — email sending account
  - `JSON_WEB_TOKEN_SECRET_KEY` — JWT secret
  - `cloudinary_Config_Cloud_Name`, `cloudinary_Config_api_key`, `cloudinary_Config_api_secret` — Cloudinary for media uploads
  - `STRIPE_SECRET_KEY`, `PAYPAL_*` — payment provider keys

Notes:
- The updated `server/config/connectDb.js` will try `MONGODB_URI` first, then `MONGODB_LOCAL_URI` (if present). Keep your production credentials secure and do not commit them.

4) Start the server
```powershell
cd server
# run Node directly
node index.js
# or if you have a script
npm run dev
```

5) Start frontend apps
- Admin
  ```powershell
  cd admin
  npm run dev
  # Open http://localhost:5173 (or the port printed by Vite)
  ```
- Client
  ```powershell
  cd client
  npm run dev
  # Open http://localhost:5174 (or the port printed by Vite)
  ```

**Common troubleshooting**
- Mongoose connection errors (Atlas): If you change networks (Wi‑Fi/location), Atlas may block your IP until you whitelist it. Either:
  - Add your current public IP to Atlas Network Access (recommended for Atlas use), or
  - Use `MONGODB_LOCAL_URI` and run a local MongoDB for development.
- If you see React warnings about unique keys — ensure mapped lists include a `key` prop (done in several places).
- If the dev server shows a syntax/JSX parse error after a code edit, check for unclosed tags or mismatched fragment tags; run the admin/client builds again after the fix.

**Admin-specific notes**
- The admin app includes new Phase-3 components:
  - `admin/src/Pages/Products/addProductV2.jsx` — improved product form supporting `productType` (`simple`/`variable`) and `salePrice`
  - `admin/src/Pages/Products/VariationsManager.jsx` — manage generated variations for variable products
  - `admin/src/Pages/Attributes/index.jsx` — attributes CRUD UI
- Image uploads use `admin/src/Components/UploadBox/index.jsx`, which posts to server upload endpoints. Upload handlers now ensure the preview array is always an array and update Admin state immutably.

**Client-specific notes**
- Product page components updated to use `salePrice` when available. Legacy fields `productRam`, `size`, `productWeight` have been removed from the primary selection flow and replaced by the attribute/variant mechanism.
- Key client files:
  - `client/src/components/ProductDetails/index.jsx`
  - `client/src/Pages/ProductDetails/index.jsx`

**API endpoints (overview)**
- Product endpoints (server):
  - `POST /api/product/create` — create product
  - `GET /api/product/:id` — get product detail
  - `GET /api/product/getAllProducts` — listing
  - `POST /api/product/:id/variations/generate` — auto-generate variations
  - Variations CRUD: `/api/products/:id/variations` and related endpoints
- Attributes endpoints:
  - `GET /api/attributes` — list attributes
  - CRUD endpoints under `/api/attributes` for creating/updating/removing attributes
- Cart endpoints:
  - `POST /api/cart/add` — add to cart
- Order endpoints, user auth, and payment endpoints are available (search `server/controllers` and `server/route` to see exact routes)

**Testing & recommended next steps**
- Admin: Create a product with `productType=simple`, set `price` and optional `salePrice`, upload images, and publish.
- Admin: Create attributes and then create a `variable` product; open `VariationsManager` and auto-generate combinations, set per-variation price and stock.
- Client: View a product, verify pricing display (`salePrice || oldPrice || price`) and add to cart.
- Implement variation selectors on the client (next planned task) to choose variation and reflect variation-specific price/stock.

**Contributing & code style**
- Follow existing code conventions: React functional components, Tailwind classes, and MUI controls where used.
- Run linters and formatters if present before commits.

**Contact / Maintainers**
- Reach out to the project owner and maintainers in the repository for access to production credentials and Atlas configuration.

---
