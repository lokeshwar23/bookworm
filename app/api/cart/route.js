// app/api/cart/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateSessionId } from '@/lib/cartSession';

export async function GET(request) {
  const response = NextResponse.next();
  const user = await getCurrentUser();
  const sessionId = getOrCreateSessionId(request, response);

  try {
    let items;
    if (user?.sub) {
      items = await sql`
        SELECT ci.id, ci.quantity, ci.added_at,
          b.id AS book_id, b.title, b.author, b.price, b.format,
          b.cover_image_url, b.delivery_days, b.stock,
          c.name AS category_name
        FROM cart_items ci
        JOIN books b ON b.id = ci.book_id
        LEFT JOIN categories c ON c.id = b.category_id
        WHERE ci.user_id = ${user.sub}
        ORDER BY ci.added_at DESC
      `;
    } else {
      items = await sql`
        SELECT ci.id, ci.quantity, ci.added_at,
          b.id AS book_id, b.title, b.author, b.price, b.format,
          b.cover_image_url, b.delivery_days, b.stock,
          c.name AS category_name
        FROM cart_items ci
        JOIN books b ON b.id = ci.book_id
        LEFT JOIN categories c ON c.id = b.category_id
        WHERE ci.session_id = ${sessionId} AND ci.user_id IS NULL
        ORDER BY ci.added_at DESC
      `;
    }
    const res = NextResponse.json(items);
    // Copy session cookie if newly created
    response.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value, c));
    return res;
  } catch (err) {
    console.error('[cart GET]', err.message);
    return NextResponse.json({ error: 'Failed to load cart.' }, { status: 500 });
  }
}

export async function POST(request) {
  const response = NextResponse.next();
  const user = await getCurrentUser();
  const sessionId = getOrCreateSessionId(request, response);

  try {
    const { bookId, quantity = 1 } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'bookId is required.' }, { status: 400 });

    // Verify book exists and has stock
    const [book] = await sql`SELECT id, stock FROM books WHERE id = ${bookId} LIMIT 1`;
    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });

    if (user?.sub) {
      await sql`
        INSERT INTO cart_items (user_id, book_id, quantity)
        VALUES (${user.sub}, ${bookId}, ${quantity})
        ON CONFLICT (user_id, book_id)
        DO UPDATE SET quantity = cart_items.quantity + ${quantity}
      `;
    } else {
      await sql`
        INSERT INTO cart_items (session_id, book_id, quantity)
        VALUES (${sessionId}, ${bookId}, ${quantity})
        ON CONFLICT (session_id, book_id)
        DO UPDATE SET quantity = cart_items.quantity + ${quantity}
      `;
    }

    const res = NextResponse.json({ message: 'Added to cart.' }, { status: 201 });
    response.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value, c));
    return res;
  } catch (err) {
    console.error('[cart POST]', err.message);
    return NextResponse.json({ error: 'Failed to add to cart.' }, { status: 500 });
  }
}
