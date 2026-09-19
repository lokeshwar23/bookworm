# AGENTS.md — Agent/Coding Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Coding Rules

### Never self-fetch from Server Components
Query `lib/db.js` directly. `fetch('http://localhost:3000/api/...')` inside a Server Component causes an infinite hang — the server isn't ready when the page renders. This already burned us on `app/(store)/page.js`.

### SQL approach depends on query type
- **Static queries:** tagged template literal → `sql\`SELECT * FROM books WHERE id = ${id}\``
- **Dynamic queries (variable WHERE/ORDER BY):** `sql.unsafe(queryString, paramsArray)` — see `lib/bookQueries.js`
- **Never** interpolate user input directly into query strings

### Cookie helpers are not interchangeable
- Auth cookie → always use `getAuthCookieOptions()` from `lib/auth.js`
- Cart session → always use `getOrCreateSessionId(req, res)` or `getSessionId(req)` from `lib/cartSession.js`
- Cart GET handlers must pass the `NextResponse` object to `getOrCreateSessionId` so the cookie is set on the response, then copy cookies across with `response.cookies.getAll().forEach(c => res.cookies.set(...))`

### Checkout order lifecycle is strict
Order status flow: `pending` (create-order) → `confirmed` (verify-payment) or `cancelled` (cancel).
Gift points are **deducted** at `create-order` and **earned** at `verify-payment`. If payment fails, points must be restored via `reverseGiftPoints()` from `lib/orderUtils.js`.

### `useSearchParams()` always needs `<Suspense>`
Wrap the component that calls `useSearchParams()` in a named inner function, export a default outer function that wraps it in `<Suspense>`. Skipping this breaks `npm run build`.

### Test runner requires `--experimental-vm-modules`
The `npm test` script already includes it. For a single test file:
```bash
node --experimental-vm-modules node_modules/.bin/jest --testPathPattern="razorpay"
```
Test files must live under `tests/` — jest config `testMatch` only picks up `**/tests/**/*.test.{js,jsx}`.

### `params` in Route Handlers must be awaited
Next.js 16 makes `params` a Promise. Always: `const { id } = await params;` not `const { id } = params;`.
