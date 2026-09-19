// app/api/books/[id]/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [book] = await sql`
      SELECT
        b.id, b.title, b.author, b.price, b.format, b.language,
        b.cover_image_url, b.description, b.author_bio,
        b.rating, b.sales_count, b.delivery_days, b.stock, b.is_featured, b.created_at,
        c.name AS category_name, c.slug AS category_slug,
        p.name AS publisher_name, p.slug AS publisher_slug
      FROM books b
      LEFT JOIN categories c ON c.id = b.category_id
      LEFT JOIN publishers p ON p.id = b.publisher_id
      WHERE b.id = ${id}
      LIMIT 1
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }
    return NextResponse.json(book);
  } catch (err) {
    console.error('[book detail]', err.message);
    return NextResponse.json({ error: 'Failed to load book.' }, { status: 500 });
  }
}
