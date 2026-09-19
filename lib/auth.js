// lib/auth.js
// Single source of truth for JWT sign/verify and current-user resolution.
// Uses `jose` (Edge-Runtime compatible) — NOT jsonwebtoken.

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth_token';
const EXPIRY = '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in environment');
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Sign a JWT and return the token string
// ---------------------------------------------------------------------------
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

// ---------------------------------------------------------------------------
// Verify a JWT string — returns payload or null
// ---------------------------------------------------------------------------
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Read the auth cookie and return the decoded user payload (server-side only)
// Returns null if not authenticated
// ---------------------------------------------------------------------------
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie config helpers
// ---------------------------------------------------------------------------
export function getAuthCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',   // 'strict' blocks the cookie on post-login redirects
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}

export { COOKIE_NAME };
