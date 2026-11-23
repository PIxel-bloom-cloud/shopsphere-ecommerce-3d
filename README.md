# ShopSphere — Full-stack E-Commerce Application

A full-stack online store built with React, Express, Node.js and MongoDB, featuring an animated interactive 3D-style storefront experience. It includes a responsive storefront, product catalogue, search and category filters, product detail pages, persistent shopping cart, account registration/login, customer order history, order tracking, administrator product management and administrator order fulfilment.

## Included functionality

- Customer registration and login with bcrypt password hashing and JWT sessions.
- Admin and customer roles. Public registration can only create customer accounts; administrator creation is a separate environment-protected command.
- Product catalogue with search, category filtering, product details, inventory counts and out-of-stock handling.
- Interactive 3D-style hero scene using CSS 3D transforms, pointer-responsive parallax, floating product panels, animated orbit rings and reduced-motion accessibility support.
- Depth and motion hover interactions on product cards.
- Shopping cart saved in the browser between visits.
- Checkout with validated delivery details and Cash on Delivery (COD).
- MongoDB order persistence, stock validation/decrement and order status workflow.
- Customer order history and tracking; administrators can update order status.
- Admin product create, edit and delete; order list and revenue summary.
- API security headers, CORS restriction, JSON size limit and authentication rate limiting.

## Requirements

- Node.js 20 LTS or newer
- MongoDB Atlas, or local MongoDB configured as a replica set (MongoDB transactions are used for consistent checkout and cancellation inventory updates)
- npm

## 1. Configure MongoDB and environment

Create a MongoDB database, then configure the connection string. For MongoDB Atlas, use the connection string supplied by Atlas. For local MongoDB, enable a replica set and use a connection string such as `mongodb://127.0.0.1:27017/shopsphere?replicaSet=rs0`.

Copy `backend/.env.example` to `backend/.env` and set:

- `MONGO_URI` — your database connection string
- `JWT_SECRET` — a unique random secret of at least 32 characters
- `CLIENT_URL` — frontend origin, normally `http://localhost:5173`
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — your own administrator credentials; use a unique password of at least 12 characters

Never commit `.env` or share its values.

## 2. Install and start the backend

```bash
cd backend
npm install
npm run seed
npm run create-admin
npm run dev
```

`npm run seed` adds the starter product catalogue without deleting or overwriting existing products. `npm run create-admin` creates or updates the administrator using the values in `.env`. No sample customer accounts are created.

API: `http://localhost:5000/api`
Health check: `http://localhost:5000/api/health`

## 3. Install and start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The storefront hero responds to pointer movement; move your mouse over the 3D product display (or drag across it on a touch screen).

Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.

## 4. Build the frontend for production

```bash
cd frontend
npm run build
npm run preview
```

Deploy the frontend and backend separately, configure the production `CLIENT_URL`, `MONGO_URI` and `JWT_SECRET`, and use HTTPS. The backend must be reachable at the URL configured by `VITE_API_URL` when building the frontend.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/products` | Public | Catalogue, search and category filter |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | Customer | Place COD order |
| GET | `/api/orders/my` | Customer | Own orders and tracking |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update fulfilment status |

## Payment and deployment notes

Cash on Delivery is implemented as the order's payment method. Online card/UPI processing is intentionally not represented as complete: a real payment provider account, merchant credentials, webhook endpoint and deployment configuration are required before online payments can be accepted. The source is fully provided, but a live public store also requires your own MongoDB connection, administrator credentials, hosting account and domain.


## 3D storefront notes

The homepage includes a live, pointer-responsive 3D product composition built with CSS perspective and transforms. It does not require a paid 3D service or API key. Product images are loaded from Unsplash URLs; replace these with your own product photography before production. This is a locally runnable website source package; it is not yet published to a public domain.
