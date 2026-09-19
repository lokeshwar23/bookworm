# BookWorm — E-Bookstore Platform

A full-stack online bookstore built with **Next.js 15 (App Router)**, **Tailwind CSS** (dark theme), and **PostgreSQL**. Supports guest and registered user journeys — browse books, manage a cart, checkout with gift points, and track orders. Payment via **Razorpay** (with a built-in mock mode for local development).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, React, JSX |
| Backend | Next.js API Route Handlers (same project) |
| Styling | Tailwind CSS v4 — dark theme |
| Database | PostgreSQL (raw SQL via `postgres` npm package) |
| Auth | JWT (`jose`) + bcrypt password hashing |
| Payment | Razorpay (mock mode available) |

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ running locally (or a cloud instance)
- A `.env.local` file (copy from `.env.local.example`)

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd bookworm
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bookworm
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay (leave blank to use mock mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Payment mode: mock (default for local dev) or live
PAYMENT_MODE=mock
NEXT_PUBLIC_PAYMENT_MODE=mock
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE DATABASE bookworm;"
```

### 4. Run migrations and seed data

```bash
node lib/migrate.js
```

This creates all tables and inserts 35+ sample books, 20 categories, 5 publishers, and a test user:
- **Email:** `test@bookworm.com`
- **Password:** `Test@1234`

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | ✅ | App base URL (e.g. `http://localhost:3000`) |
| `RAZORPAY_KEY_ID` | Only in live mode | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Only in live mode | Razorpay API key secret (server-side only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Only in live mode | Razorpay publishable key (client-side) |
| `PAYMENT_MODE` | ✅ | `mock` or `live` |
| `NEXT_PUBLIC_PAYMENT_MODE` | ✅ | Same as above, but exposed to client |

### Razorpay Setup

**For local development:** Keep `PAYMENT_MODE=mock`. No Razorpay account needed.

**For real payments (staging/production):**
1. Create a free account at [razorpay.com](https://razorpay.com)
2. Get your test keys (`rzp_test_*`) from the dashboard → Settings → API Keys
3. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Set `PAYMENT_MODE=live` and `NEXT_PUBLIC_PAYMENT_MODE=live`

> ⚠️ Never commit live keys (`rzp_live_*`) to source control. Use production secrets management.

---

## Running Tests

```bash
npm test
```

Test files are in `/tests/`. Uses Jest + React Testing Library.

---

## Project Structure

```
bookworm/
├── app/
│   ├── (auth)/             # Login & Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (store)/            # All customer-facing pages
│   │   ├── page.js         # Home
│   │   ├── layout.js       # Navbar + Footer + CartProvider
│   │   ├── catalogue/      # Catalogue + Product detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── order-confirmation/[orderId]/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── profile/
│   └── api/                # All backend route handlers
│       ├── auth/           # register, login, logout, me
│       ├── books/          # list, detail, related, recommended
│       ├── cart/
│       ├── wishlist/
│       ├── orders/
│       ├── categories/
│       ├── publishers/
│       └── checkout/       # create-order, verify-payment, cancel
├── components/             # Shared React components
│   ├── AuthProvider.jsx
│   ├── CartProvider.jsx
│   ├── Navbar.jsx
│   ├── BookCard.jsx
│   ├── MockPaymentModal.jsx
│   └── RazorpayButton.jsx
├── lib/
│   ├── db.js               # PostgreSQL client
│   ├── auth.js             # JWT helpers
│   ├── razorpay.js         # Razorpay SDK + mock mode
│   ├── cartSession.js      # Guest cart session management
│   ├── bookQueries.js      # Reusable book filter SQL
│   ├── orderUtils.js       # Totals + gift point helpers
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Sample data
│   └── migrate.js          # Migration script
├── tests/                  # Jest test files
├── .env.local.example
├── jsconfig.json
├── tailwind.config.js
└── package.json
```

---

## Deployment Notes

### Docker (local container test)

```bash
docker build -t bookworm .
docker run -p 3000:3000 --env-file .env.local bookworm
```

### Cloud Deployment (AWS ROSA / IBM ROKS)

The included `Dockerfile` uses **Red Hat UBI 9** base image and runs as a non-root user (uid 1001), meeting enterprise container security requirements.

Environment variables must be injected via:
- Kubernetes `Secret` → `envFrom` (never baked into the image)
- For IBM ROKS: use IBM Secrets Manager or OpenShift Secrets
- For AWS ROSA: use AWS Secrets Manager or OpenShift Secrets

The app listens on port **3000** by default.
