// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // --- Find user ---
    const [user] = await sql`
      SELECT id, email, full_name, password_hash, gift_points, role
      FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // --- Compare password ---
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // --- Sign JWT ---
    const token = await signToken({
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      giftPoints: user.gift_points,
      role: user.role,
    });

    // --- Merge guest cart into user cart (if session cookie present) ---
    // This is done server-side: find cart_items by session_id cookie, reassign to user_id
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/cart_session_id=([^;]+)/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      // Merge guest cart into user cart:
      // - session_id must be NULL on the new user-owned row (avoids unique constraint on session_id+book_id)
      // - if the user already has that book, just add the quantities
      await sql`
        INSERT INTO cart_items (session_id, user_id, book_id, quantity, added_at)
        SELECT NULL, ${user.id}, book_id, quantity, added_at
        FROM cart_items
        WHERE session_id = ${sessionId} AND user_id IS NULL
        ON CONFLICT (user_id, book_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `;
      // Clear the guest cart rows now that they've been merged
      await sql`
        DELETE FROM cart_items
        WHERE session_id = ${sessionId} AND user_id IS NULL
      `;
    }

    const cookieOpts = getAuthCookieOptions();
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      giftPoints: user.gift_points,
      role: user.role,
    });
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (err) {
    console.error('[login]', err.message);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
