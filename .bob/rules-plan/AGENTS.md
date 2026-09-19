# AGENTS.md — Plan Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Architectural Constraints

### Server Component → DB direct; Client Component → API route
This is enforced by a discovered bug (infinite hang). Any new page that needs data at render time and is a Server Component MUST import `lib/db.js` directly, not call its own API routes.

### Checkout is intentionally split across two API calls
`create-order` and `verify-payment` are separate by design to support both Razorpay's async webhook pattern and the mock flow. Do not merge them into a single "place order" endpoint.

### Cart has dual identity (session + user)
`cart_items` rows have BOTH `session_id` and `user_id` columns with separate UNIQUE constraints. A row belongs to either a guest (`session_id` set, `user_id` null) or a user (`user_id` set). On login, guest rows are migrated to user rows in `/api/auth/login`. Any new cart logic must handle both cases.

### `lib/bookQueries.js` uses `sql.unsafe()` for dynamic filtering
Dynamic WHERE clause construction cannot use the safe tagged template. This is intentional — ORDER BY and column names cannot be parameterised. If adding new filter types, follow the existing `params.push()` + `$${params.length}` pattern.

### Gift points have a debit-before-earn lifecycle
Points are debited from the user's balance at `create-order` (before payment is confirmed). They are only earned (new points awarded) at `verify-payment`. Cancelled orders call `reverseGiftPoints()` which reverses both the debit AND the earned points. Any change to checkout flow must preserve this order.

### `useSearchParams()` isolation pattern is required by build
Every page using `useSearchParams()` must follow the inner-function + `<Suspense>` wrapper pattern. This is a Next.js 16 build requirement — not a style choice. See `catalogue/page.jsx`.

### `params` in Route Handlers is async in Next.js 16
`const { id } = await params` — not destructured directly. Forgetting `await` throws a runtime error.

### DB migrations are forward-only
`lib/migrate.js` runs `schema.sql` then `seed.sql` using `sql.unsafe()`. There is no rollback. Schema changes must use `ALTER TABLE` or `IF NOT EXISTS` guards to be re-runnable safely.

### Tailwind v4 uses `@theme` in CSS, not `tailwind.config.js` for tokens
Custom colour tokens are defined in `app/globals.css` via `@theme {}` block (Tailwind v4 syntax). The `tailwind.config.js` `theme.extend.colors` entries are secondary — use the CSS variables in components for consistency.
