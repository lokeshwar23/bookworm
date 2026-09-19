#  BookWorm

A full-stack e-bookstore web application built as a Capstone Project. Users can browse books, manage a cart, place orders, track deliveries, maintain a wishlist, and follow authors — all through a clean, dark-themed UI.

---

## ✨ Features

- **Catalogue** — Browse 36 books with filtering by category, format (paperback / hardcover / ebook), price range, language, and publisher. Sort by relevance, price, bestsellers, or new arrivals. Full-text search.
- **Authentication** — Register and login with JWT-based auth stored in HTTP-only cookies. New users receive 40 gift points on signup.
- **Cart** — Add/remove/update quantities. Guest carts are automatically merged into the user account on login.
- **Checkout** — Pre-fills saved delivery address. Applies 12% tax, free delivery above ₹500, and loyalty gift-point discounts.
- **Payment** — Stub payment modal with four methods: Card (16-digit, CVV, expiry validated), UPI (requires @ format), Wallet, and Cash on Delivery.
- **Orders** — Confirmed and cancelled orders displayed with book covers, totals, and a Buy Again button. Abandoned pending orders are auto-cleaned.
- **Wishlist** — Save books for later and move them to cart in one click.
- **Writers** — Follow / unfollow authors. Browse an author's books directly from their profile.
- **Gift Points** — Earn 1 point per ₹10 spent. Redeem at checkout (1 point = ₹1 off). Full audit trail in the database.
- **Login Wall** — Cart checkout button and `/checkout` page are fully blocked for guests with a clean login prompt.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.5 (App Router) |
| UI Library | React 19.2.8 |
| Styling | Tailwind CSS v4 (dark theme) |
| Icons | Lucide React |
| Database | PostgreSQL (raw SQL via `postgres` npm package) |
| Auth | JWT (`jose` 6.2.12) + bcrypt password hashing |
| IDs | UUID v4 |
| Testing | Jest 29 + babel-jest |
| Container | Docker (Red Hat UBI 9 Node.js 20 minimal) |

No ORM — all queries are written in raw SQL.

---

## 📁 Project Structure

```
bookworm/
├── app/                        # Next.js App Router
│   ├── page.jsx                # Home / catalogue
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── products/[id]/page.jsx  # Product detail
│   ├── cart/page.jsx
│   ├── checkout/page.jsx
│   ├── orders/
│   │   ├── page.jsx            # Order history
│   │   └── [orderId]/page.jsx  # Order detail
│   ├── wishlist/page.jsx
│   ├── writers/page.jsx
│   ├── profile/page.jsx
│   └── api/                    # 22 API route handlers
│       ├── auth/               # login, register, logout, me
│       ├── books/              # list, detail, related, recommended
│       ├── cart/               # CRUD cart items
│       ├── checkout/           # create-order, verify-payment, cancel
│       ├── orders/             # list + detail
│       ├── wishlist/           # add / remove
│       ├── writers/            # follow / unfollow
│       ├── user/addresses/     # saved addresses
│       ├── categories/
│       └── publishers/
├── components/
│   ├── forms/
│   │   ├── AuthProvider.jsx    # Auth context
│   │   ├── CartProvider.jsx    # Cart context
│   │   └── MockPaymentModal.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── ui/
│       ├── BookCard.jsx
│       ├── BookCover.jsx       # SVG generated covers + real image fallback
│       ├── RatingStars.jsx
│       └── Breadcrumb.jsx
├── lib/
│   ├── db.js                   # PostgreSQL connection
│   ├── auth.js                 # JWT helpers
│   ├── bookQueries.js          # Book filtering SQL
│   ├── cartSession.js          # Guest cart session cookie
│   ├── orderUtils.js           # computeTotals, awardGiftPoints, reverseGiftPoints
│   └── constants.js            # App-wide constants
├── db/
│   ├── schema.sql              # All 11 table definitions
│   ├── seed.sql                # 36 books, categories, publishers
│   └── migrate.js              # Runs schema + seed
├── tests/
│   └── unit/
│       └── orderUtils.test.js  # Jest unit tests for order calculations
├── public/
│   └── images/books/           # Book cover images
├── .env.local.example          # Environment variable template
├── Dockerfile
├── jest.config.js
├── tailwind.config.js
└── next.config.mjs
```

---

## 🗄 Database Schema

11 tables:

| Table | Purpose |
|---|---|
| `users` | Accounts, roles, gift points balance |
| `categories` | Book categories (Fiction, Non-Fiction, etc.) |
| `publishers` | Publishing houses |
| `books` | Product catalogue — price, format, stock, rating, cover |
| `addresses` | Saved delivery addresses per user |
| `cart_items` | Shopping cart — supports both guest (session) and logged-in users |
| `wishlists` | Saved books per user |
| `followed_authors` | Author follow relationships |
| `orders` | Purchase records with status (pending / confirmed / cancelled) |
| `order_items` | Line items for each order |
| `gift_point_transactions` | Full audit trail for loyalty points (earn / redeem / refund) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd bookworm
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/bookworm
JWT_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up the Database

Create the database in PostgreSQL:

```sql
CREATE DATABASE bookworm;
```

Then run the migration (creates tables + seeds 36 books):

```bash
npm run migrate
```

### 4. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Tests

```bash
npm test
```

Unit tests cover the core order calculation logic (`computeTotals`) — subtotal, 12% tax, delivery charge threshold (₹500), and gift point capping.

---

## 🐳 Docker

Build and run with Docker:

```bash
docker build -t bookworm .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/bookworm \
  -e JWT_SECRET=your-secret \
  bookworm
```

- Base image: `registry.redhat.io/ubi9/nodejs-20-minimal` (Red Hat UBI 9)
- Runs as non-root user (UID 1001)
- Production-only dependencies
- Exposes port 3000

---

## 🔐 Security

- Passwords hashed with **bcrypt** before storage
- JWT tokens stored in **HTTP-only cookies** (not localStorage)
- All SQL queries use **parameterised statements** — no string interpolation
- Secrets stored in **environment variables** — never hardcoded
- Checkout page has a **hard login wall** — guests cannot reach payment
- Stale **pending orders** (abandoned payments) are automatically cleaned up

---

## 📦 Order Calculation

```
Subtotal  = sum(price × quantity)
Tax       = 12% of subtotal
Delivery  = ₹0 if subtotal ≥ ₹500, else ₹50
Total     = subtotal + tax + delivery − gift point discount
```

Gift points: earn 1 point per ₹10 spent. 1 point = ₹1 discount.

---

## 🌐 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run migrate` | Create DB tables and seed data |
| `npm test` | Run Jest unit tests |

---

## 📄 License

This project was built as a Capstone submission. All rights reserved.
