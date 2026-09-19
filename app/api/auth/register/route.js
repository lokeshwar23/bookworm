// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sql from '@/lib/db';
import { signToken, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const { fullName, email, password, confirmPassword } = await request.json();

    // --- Validate inputs ---
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // --- Check email not already taken ---
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- Hash password (cost 12) ---
    const passwordHash = await bcrypt.hash(password, 12);

    // --- Insert user (40 welcome gift points) ---
    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, role, gift_points)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName.trim()}, 'customer', 40)
      RETURNING id, email, full_name, gift_points
    `;

    // --- Sign JWT ---
    const token = await signToken({
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      giftPoints: user.gift_points,
      role: 'customer',
    });

    // --- Set HTTP-only cookie ---
    const cookieOpts = getAuthCookieOptions();
    const response = NextResponse.json(
      { id: user.id, email: user.email, fullName: user.full_name, giftPoints: user.gift_points },
      { status: 201 }
    );
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (err) {
    console.error('[register]', err.message);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
