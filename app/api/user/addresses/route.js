// app/api/user/addresses/route.js
// GET /api/user/addresses — return saved addresses for the logged-in user, newest first
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await sql`
      SELECT id, first_name, last_name, address_line, city, state, pin, phone
      FROM addresses
      WHERE user_id = ${user.sub}
      ORDER BY id DESC
    `;

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[user/addresses]', err.message);
    return NextResponse.json({ addresses: [] });
  }
}
