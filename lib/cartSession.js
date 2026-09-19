// lib/cartSession.js
// Manages cart session cookies for guest users.
// Returns the session ID from the cookie, generating a new one if absent.

import { v4 as uuidv4 } from 'uuid';

const CART_COOKIE = 'cart_session_id';

/**
 * Get or create a cart session ID from/in the response cookies.
 * Call this in every cart route handler.
 * @param {Request} request - incoming Next.js request
 * @param {Response} response - NextResponse to set cookie on
 * @returns {string} sessionId
 */
export function getOrCreateSessionId(request, response) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE}=([^;]+)`));
  if (match) return match[1];

  const newId = uuidv4();
  response.cookies.set(CART_COOKIE, newId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return newId;
}

/**
 * Get session ID from request only (no new cookie).
 */
export function getSessionId(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export { CART_COOKIE };
