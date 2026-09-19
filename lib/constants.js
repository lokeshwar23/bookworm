// lib/constants.js
// Application-wide constants. Import from '@/lib/constants' throughout the app.

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export const DEFAULT_PAGE_SIZE = 16;
export const HOME_SECTION_SIZE = 6;

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
/** Tax rate applied to all orders (12%) */
export const TAX_RATE = 0.12;

/** Flat delivery charge when subtotal is below the free-shipping threshold */
export const DELIVERY_CHARGE = 50;

/** Subtotal threshold (₹) at or above which delivery is free */
export const FREE_DELIVERY_THRESHOLD = 500;

/** Conversion rate: 1 gift point = ₹1 discount */
export const GIFT_POINT_VALUE = 1;

/** Gift points earned per ₹10 spent (floor division) */
export const GIFT_POINTS_PER_10 = 1;

// ---------------------------------------------------------------------------
// Auth / Session
// ---------------------------------------------------------------------------
/** JWT cookie expiry string (used by jose) */
export const JWT_EXPIRY = '7d';

/** Auth cookie name */
export const AUTH_COOKIE_NAME = 'auth_token';

/** Cart session cookie name */
export const CART_COOKIE_NAME = 'cart_session_id';

/** Cart session cookie max age (30 days in seconds) */
export const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

// ---------------------------------------------------------------------------
// Book formats
// ---------------------------------------------------------------------------
export const BOOK_FORMATS = ['paperback', 'hardcover', 'ebook'];

// ---------------------------------------------------------------------------
// Sort options (catalogue)
// ---------------------------------------------------------------------------
export const SORT_OPTIONS = [
  { value: 'relevance',    label: 'Relevance' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Bestsellers' },
  { value: 'new_arrivals',label: 'New Arrivals' },
];
