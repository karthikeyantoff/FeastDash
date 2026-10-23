# 🍔 FeastDash — Full-Stack Food Ordering & Delivery Management Platform

A high-performance, industry-ready food delivery platform built with the **MERN** stack (MongoDB, Express 5, React 19, Node.js 24). FeastDash features a customer ordering application with live search and order progress tracking, a restaurant admin management dashboard with inventory control and payment visibility, and a secured REST API backend with Stripe checkout, cryptographic webhooks, JWT authentication, and Cloudinary cloud image hosting.

---

## 📐 Architecture

```
FeastDash/
├── frontend/               # Customer-facing React 19 SPA (Vite 7)
│   ├── src/
│   │   ├── Components/     # Navbar, FoodDisplay (live search), LoginPopup, etc.
│   │   ├── Context/        # StoreContext (state & cart synchronization)
│   │   └── Pages/          # Home, Cart, PlaceOrder, Verify, MyOrders
├── admin/                  # Restaurant Admin React 19 SPA (Vite 7)
│   ├── src/
│   │   ├── components/     # Admin Navbar, Sidebar
│   │   └── pages/          # Add (dish upload), List (inventory), Orders (pipeline)
├── backend/                # Express 5 REST API
│   ├── config/             # MongoDB Atlas connection & Cloudinary v2 setup
│   ├── controllers/        # Order, Food, Cart, User, Admin handlers
│   ├── middlewares/        # Standard Bearer auth & Admin auth guards
│   ├── models/             # Schema-first models (User, Food, Order)
│   ├── routes/             # REST endpoints & OpenAPI / Swagger docs
│   ├── test/               # Automated integration test suite (node:test)
│   └── server.js           # Server entrypoint, CORS, webhook stream, health check
└── README.md
```

---

## ⚡ Engineering Highlights & Security Upgrades

- 🛡️ **Server-Side Price Integrity**: All order totals, item prices, and delivery charges are computed strictly using trusted database records from `foodModel`. Client-tampered prices in HTTP payloads are completely ignored.
- 💳 **Cryptographic Stripe Webhooks**: Secure `POST /api/order/webhook` endpoint with HMAC SHA-256 signature verification (`stripe.webhooks.constructEvent`). Customer carts are preserved until payments are confirmed.
- 🔒 **Role-Based Admin Protection**: Endpoints for adding, editing, and deleting menu dishes (`/api/food/add`, `/api/food/:id`) are strictly protected with JWT admin authorization middleware.
- ☁️ **Cloudinary Media Pipeline**: Custom stream upload buffering directly into `mern_stack_project_storage/FeastDash`, with tracking of `cloudinaryPublicId` for clean cloud asset deletion.
- 🔍 **Interactive Live Search**: Instant client-side search across dishes, ingredients, and categories on the customer storefront.
- 📊 **Order Pipeline Stepper**: Real-time visual tracking (`Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) on customer order history.
- 💼 **Admin Payment Badging**: Clear **✓ PAID** and **⏳ UNPAID** status badges, order timestamps, and filter tabs on the admin dashboard.
- 🩺 **Health Check Diagnostics**: `GET /api/health` providing real-time database connection status and server uptime metrics.
- 🧪 **Automated API Test Suite**: Zero-dependency automated integration test suite (`backend/test/api.test.js`) verifying registration, login, auth guards, catalog retrieval, and price calculation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Customer Frontend** | React 19, React Router 7, Vite 7, Axios, CSS Modules |
| **Admin Frontend** | React 19, React Router 7, Vite 7, Axios, react-toastify |
| **Backend API** | Node.js 24+, Express 5, Mongoose 8, JWT, bcryptjs |
| **Database** | MongoDB Atlas Cloud Cluster |
| **Payments** | Stripe Checkout (Test & Live modes) & Webhooks |
| **Media Hosting** | Cloudinary v2 SDK with in-memory streaming |
| **API Documentation**| Swagger UI (`swagger-ui-express`, `swagger-jsdoc`) |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) |
| **Deployment** | Vercel (Frontends) & Render / Railway (Backend) |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/feastdash?retryWrites=true&w=majority
JWT_SECRET=your_long_random_jwt_secret
ADMIN_SECRET_KEY=your_long_random_admin_secret
ADMIN_PASSWORD=your_admin_login_password
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
MAX_UPLOAD_SIZE_BYTES=2097152
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=mern_stack_project_storage/FeastDash
```

### Customer Frontend (`frontend/.env`) & Admin (`admin/.env`)

```env
VITE_API_URL=http://localhost:4000
```

---

## 🧪 Running Automated Tests

Run the backend integration test suite:

```bash
cd backend
npm test
```

Expected output:
```
▶ FeastDash API Automated Verification Suite
  ✔ Health check endpoint returns status 200 and connected DB
  ✔ User registration succeeds and returns valid JWT token
  ✔ User login succeeds with correct credentials
  ✔ Authenticated user profile retrieval works via Bearer header
  ✔ Unauthenticated menu addition is strictly rejected with HTTP 401
  ✔ Server-side price verification and order creation
  ✔ Catalog listing returns dishes array
✔ FeastDash API Automated Verification Suite (7 passed, 0 failed)
```

---

## 🚀 Local Development Setup

### 1. Clone & Configure

```bash
git clone https://github.com/karthikeyantoff/FeastDash.git
cd FeastDash
```

### 2. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 3. Start Development Servers

Open three terminals:

```bash
# Terminal 1 - Backend API (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 - Customer App (http://localhost:5173)
cd frontend && npm run dev

# Terminal 3 - Admin Dashboard (http://localhost:5174)
cd admin && npm run dev
```

---

## 🌐 Production Deployment Guide

### Step 1: Deploy Backend (Render / Railway)
1. Create a new **Web Service** on [Render](https://render.com) connecting your `FeastDash` repository.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all Environment Variables from `backend/.env`.
6. Copy your production API URL (e.g., `https://feastdash-api.onrender.com`).

### Step 2: Deploy Customer Frontend (Vercel)
1. Import your `FeastDash` repository into [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`
3. Set **Framework Preset**: `Vite`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://feastdash-api.onrender.com`
5. Deploy and copy your customer URL (e.g., `https://feastdash.vercel.app`).

### Step 3: Deploy Admin Dashboard (Vercel)
1. Import your `FeastDash` repository as a second project in [Vercel](https://vercel.com).
2. Set **Root Directory**: `admin`
3. Set **Framework Preset**: `Vite`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://feastdash-api.onrender.com`
5. Deploy and copy your admin URL (e.g., `https://feastdash-admin.vercel.app`).

### Step 4: Finalize Production Backend CORS & Stripe Webhook
1. Update `FRONTEND_URL` and `ADMIN_URL` on Render with your live Vercel domains.
2. In your [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks), create a webhook endpoint pointing to:
   `https://feastdash-api.onrender.com/api/order/webhook`
   Listening for: `checkout.session.completed` and `payment_intent.payment_failed`.
3. Add the generated `whsec_...` signing secret to your backend `STRIPE_WEBHOOK_SECRET`.

---

## 👤 Author & Attribution

- **Developer:** [Karthikeyan](https://github.com/karthikeyantoff) (`karthikeyantoff`)
- **Original Starter Codebase Attribution:** Based on an open-source project by Maulik Gupta, customized, security-hardened, and extended into FeastDash.
- **License:** ISC
