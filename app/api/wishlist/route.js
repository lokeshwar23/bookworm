// app/api/wishlist/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const items = await sql`
      SELECT w.id, w.added_at,
        b.id AS book_id, b.title, b.author, b.price, b.format,
        b.cover_image_url, b.rating, b.delivery_days,
        c.name AS category_name, c.slug AS category_slug
      FROM wishlists w
      JOIN books b ON b.id = w.book_id
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE w.user_id = ${user.sub}
      ORDER BY w.added_at DESC
    `;
    return NextResponse.json(items);
  } catch (err) {
    console.error('[wishlist GET]', err.message);
    return NextResponse.json({ error: 'Failed to load wishlist.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'bookId is required.' }, { status: 400 });

    await sql`
      INSERT INTO wishlists (user_id, book_id)
      VALUES (${user.sub}, ${bookId})
      ON CONFLICT (user_id, book_id) DO NOTHING
    `;
    return NextResponse.json({ message: 'Added to wishlist.' }, { status: 201 });
  } catch (err) {
    console.error('[wishlist POST]', err.message);
    return NextResponse.json({ error: 'Failed to add to wishlist.' }, { status: 500 });
  }
}
