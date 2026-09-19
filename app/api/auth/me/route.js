// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Refresh gift_points from DB (may have changed since token was issued)
    const [fresh] = await sql`
      SELECT id, email, full_name, gift_points, role
      FROM users
      WHERE id = ${user.sub}
      LIMIT 1
    `;

    if (!fresh) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: fresh.id,
        email: fresh.email,
        fullName: fresh.full_name,
        giftPoints: fresh.gift_points,
        role: fresh.role,
      },
    });
  } catch (err) {
    console.error('[me]', err.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
