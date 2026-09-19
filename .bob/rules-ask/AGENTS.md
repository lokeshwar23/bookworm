# AGENTS.md — Ask Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Context for Answering Questions

### Two route group layouts exist — store vs auth
- `app/(store)/layout.js` — wraps all shopping pages with `Navbar`, `Footer`, `CartProvider`
- `app/(auth)/` — has no layout file; login/register pages render standalone (full-screen dark forms)
- Root `app/layout.js` only wraps with `AuthProvider` — no Navbar at root level

### `BookCard` is client-only even when used in Server Component pages
`BookCard.jsx` has `'use client'` and uses `useCart()`. Server Component pages (like `app/(store)/page.js`) can import it — React handles the boundary automatically.

### The home page (`app/(store)/page.js`) is a Server Component
It queries the DB directly. All other store pages (`catalogue/page.jsx`, `cart/page.jsx` etc.) are Client Components with `'use client'`. The distinction matters for data fetching patterns.

### Guest cart is identified by `cart_session_id` cookie, not user session
When a guest logs in, their cart items are merged into the user's cart in `/api/auth/login/route.js` by matching `session_id` on `cart_items` rows.

### `api-spec.yaml` is the OpenAPI 3.1 spec for all 21 API routes
Use it as the canonical reference for request/response shapes. Located at project root.

### Payment mode is controlled by two env vars
- `PAYMENT_MODE` (server) — read by `lib/razorpay.js`
- `NEXT_PUBLIC_PAYMENT_MODE` (client) — read by `app/(store)/checkout/page.jsx` to decide `MockPaymentModal` vs `RazorpayButton`
Both must be set to the same value in `.env.local`.

### Test user credentials
Email: `test@bookworm.com` | Password: `Test@1234` (inserted by `lib/seed.sql`)
