# Ornac - MERN Saree Ecommerce Platform

Production-ready ecommerce platform for an offline saree store with realtime stock updates, admin inventory control, payments, and role-based auth.

## Architecture

- Frontend: React (Vite), Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB Atlas (Mongoose)
- Media: Cloudinary
- Payments: Pluggable provider layer (MOCK active, Razorpay/Stripe placeholders)
- Deploy: Frontend on Vercel, Backend on Render

## Project Structure

```txt
frontend/
  src/
    components/
    pages/
    hooks/
    context/
    services/
    utils/

backend/
  controllers/
  routes/
  models/
  middleware/
  services/
    payment/
  config/
  sockets/
  utils/
  scripts/
```

## Step-by-Step Setup (Local)

## 1) Prerequisites

Install:
- Node.js 20+
- npm 10+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Stripe account

## 2) Clone and install

```bash
git clone <your-repo-url>
cd Ornac

cd backend
npm install

cd ../frontend
npm install
```

## 3) Configure environment variables

Create `backend/.env` from `backend/.env.example` and fill all values:

```env
PORT=5000
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

ADMIN_NAME=Ornac Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123
ADMIN_PHONE=9999999999
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## 4) Create admin user (recommended best setup)

Run this once from `backend`:

```bash
npm run seed:admin
```

This script is idempotent:
- creates admin if not present
- promotes existing user to admin if needed

## 5) Start backend

From `backend`:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## 6) Start frontend

From `frontend`:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 7) Verify full local flow

- Register/Login
- Login as admin (from seeded email/password)
- Add product from admin dashboard with image upload
- Browse products on storefront
- Place COD and Online Demo (MOCK) orders
- Confirm realtime stock changes in another browser tab

---

## Deployment (Production) - Step by Step

## A) MongoDB Atlas

1. Create a cluster
2. Create database user
3. Whitelist IPs (start with `0.0.0.0/0`, tighten later)
4. Copy connection string into `MONGO_URI` on Render

## B) Deploy backend on Render

1. Push project to GitHub
2. In Render, create **Web Service**
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add backend env vars (same as local, but production values)
7. Set `CLIENT_URL` to your Vercel domain (example: `https://your-app.vercel.app`)
8. Deploy and test `https://<render-url>/health`

## C) Payment provider mode (current + future)

Current mode:
- Online checkout uses `MOCK` provider through `backend/services/payment/paymentService.js`
- Simulates 2-3s delay, then random success/failure
- Returns `transactionId` and `paymentStatus`

Future mode:
- Add real integration inside:
  - `backend/services/payment/razorpayProvider.js`
  - `backend/services/payment/stripeProvider.js`
- No controller or frontend contract change needed, just provider implementation and env setup

## D) Deploy frontend on Vercel

1. In Vercel, import GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars:
   - `VITE_API_URL=https://<render-url>/api`
   - `VITE_SOCKET_URL=https://<render-url>`
   - `VITE_RAZORPAY_KEY_ID=<your-live-or-test-key>`
6. Deploy

## E) Post-deploy checklist

- Login/Register works
- Admin page protected by role
- Product image upload works (Cloudinary)
- CSV bulk product upload works from admin dashboard
- Quick stock +/- controls work from admin dashboard
- Stock updates broadcast in realtime
- `orderCreated` and `paymentStatusUpdated` socket events are received on client
- MOCK online payment flow shows both success and failure paths

---

## Docker Run (Optional)

From project root:

```bash
docker compose up --build
```

---

## CI

GitHub Actions workflow is available at:

- `.github/workflows/ci.yml`

It installs apps and builds frontend on each push/PR.
