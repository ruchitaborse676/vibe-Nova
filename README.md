# Vibe-Nova — Full-Stack E-Commerce Web Application

> **Tagline:** "Your Style. Your Vibe. Your Universe."

**Vibe-Nova** is a modern, production-grade full-stack e-commerce marketplace built for high-performance shopping experiences across fashion, audio & electronics, minimalist home living, and urban accessories. Built as a college engineering project, it adheres to commercial architectural standards with reusable components, atomic stock reservation, role-based access control, Razorpay test mode payment verification, and MongoDB Atlas database persistence.

---

## 1. Technologies & Architecture

- **Frontend:**
  - React 19 with TypeScript
  - Tailwind CSS 4 with custom typography and responsive design system
  - Lucide React iconography
  - Context API state management (`AuthContext`, `CartContext`, `WishlistContext`)
  - Zero-pill anti-slop design discipline and clean layout hierarchy

- **Backend:**
  - Node.js & Express REST API (`/api/*`)
  - JWT session token and HTTP-only cookie support
  - Bcrypt password hashing
  - Server-side recalculation of discounts, shipping rates, and stock verification
  - Dual-mode data persistence: Live MongoDB Atlas with resilient zero-setup in-memory fallback

- **Payments:**
  - Razorpay Test Mode integration (server order creation + SHA256 HMAC signature verification)
  - Seamless simulated card/UPI demo mode when external gateway credentials are unset
  - Cash on Delivery (COD) support

---

## 2. Default Demo Accounts

For effortless evaluation, the following pre-seeded test accounts are available:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@vibenova.com` | `AdminPassword@123` | Product CRUD, Order Status Transitions, Sales Analytics, Customer List, Seed Reset |
| **Customer** | `customer@example.com` | `Customer@123` | Browsing, Cart, Wishlist, Address Book, Checkout, Order Tracking & Cancellation |

> Both accounts can also be filled in a single click using the **Quick Evaluation Credentials** banner on the `/login` page.

---

## 3. Pre-Seeded Coupon Codes

- `VIBE20`: **20% Off** on orders above ₹1,999 (Max ₹1,000 discount)
- `WELCOME10`: **10% Off** on orders above ₹999 (Max ₹500 discount)
- `FREESHIP`: **Free Shipping** on orders above ₹499 (₹99 value)
- Standard Free Shipping automatically applies on all orders exceeding **₹999**.

---

## 4. Local Installation & Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Steps
```bash
# 1. Clone repository
git clone https://github.com/your-username/vibe-nova.git
cd vibe-nova

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local run)
cp .env.example .env

# 4. Start full-stack development server (Express + Vite on Port 3000)
npm run dev

# 5. Open browser
http://localhost:3000
```

---

## 5. MongoDB Atlas Setup

Vibe-Nova works **immediately out-of-the-box** using an active in-memory database pre-loaded with 18 products and categories. To connect to your real MongoDB Atlas cluster:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with Read/Write privileges.
3. Under **Network Access**, whitelist IP address `0.0.0.0/0` (allow access from anywhere) or your specific hosting IP.
4. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/vibe-nova?retryWrites=true&w=majority"
   ```
5. Paste this connection string into your `.env` file (or Vercel Environment Variables).
6. Restart the server or run `npm run seed`. Vibe-Nova will detect the cluster and seed the initial catalog.

---

## 6. Razorpay Test Mode Setup

1. Sign up for a [Razorpay](https://razorpay.com) account.
2. Switch to **Test Mode** from the top-right toggle in the Razorpay Dashboard.
3. Navigate to **Settings** → **API Keys** and click **Generate Key**.
4. Add the generated keys to your `.env` file:
   ```env
   RAZORPAY_KEY_ID="rzp_test_YourKeyIdHere"
   RAZORPAY_KEY_SECRET="YourKeySecretHere"
   ```
5. When configured, checkout automatically triggers the official Razorpay test checkout window.

---

## 7. Project Folder Structure

```text
├── api/
│   └── index.ts                 # Vercel serverless function entry point
├── public/                      # Static assets & icons
├── src/
│   ├── components/
│   │   ├── cart/                # Slide-over cart drawer & order summaries
│   │   ├── common/              # Anti-slop ProductCard, banners, badges
│   │   └── layout/              # Responsive Navbar & comprehensive Footer
│   ├── contexts/                # AuthContext, CartContext, WishlistContext
│   ├── pages/                   # HomePage, ProductsPage, ProductDetailPage, CartPage,
│   │                            # CheckoutPage, OrderSuccessPage, AccountPage,
│   │                            # AdminDashboardPage, PolicyPages, NotFoundPage
│   ├── server/
│   │   ├── db.ts                # MongoDB connection manager & fallback indicator
│   │   ├── models.ts            # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes.ts            # Express REST API endpoints with RBAC
│   │   ├── seed.ts              # Standalone DB seeding runner
│   │   ├── seedData.ts          # 18 realistic seeded products & categories
│   │   └── store.ts             # Reactive store abstraction layer
│   ├── services/
│   │   └── api.ts               # Typed frontend HTTP client
│   ├── types/
│   │   └── index.ts             # TypeScript domain interfaces
│   ├── App.tsx                  # Client router and provider hierarchy
│   ├── index.css                # Base styling & font definitions
│   └── main.tsx                 # React DOM mount point
├── .env.example                 # Environment variables specification
├── package.json                 # Scripts and dependencies
├── server.ts                    # Full-stack dev & production server
└── vercel.json                  # Vercel serverless API & SPA rewrites
```

---

## 8. GitHub and Vercel Deployment

### Deploying to Vercel in 4 Steps:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Vibe-Nova e-commerce marketplace"
   git remote add origin https://github.com/<your-username>/vibe-nova.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
   - Select your `vibe-nova` repository.

3. **Set Environment Variables on Vercel**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
   - `RAZORPAY_KEY_ID`: Optional Razorpay test key ID.
   - `RAZORPAY_KEY_SECRET`: Optional Razorpay test key secret.

4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend using Vite and host serverless API endpoints using `vercel.json` rewrites without 404 errors on browser page reloads.

---

## 9. Troubleshooting & QA Checklist

- **Refresh 404 Errors**: Handled by `vercel.json` rewrites pointing non-API requests to `/index.html`.
- **Database Connection Failure**: If MongoDB Atlas network permissions or credentials are misconfigured, Vibe-Nova automatically runs on the high-speed in-memory store so the app never crashes.
- **Port Conflicts**: Dev server binds to `process.env.PORT` (defaults to port `3000`).
