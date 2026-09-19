// app/api/books/[id]/related/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get the book's category
    const [book] = await sql`SELECT category_id FROM books WHERE id = ${id} LIMIT 1`;
    if (!book) return NextResponse.json([], { status: 200 });

    const related = await sql`
      SELECT
        b.id, b.title, b.author, b.price, b.format,
        b.cover_image_url, b.rating, b.sales_count, b.delivery_days,
        c.name AS category_name, c.slug AS category_slug,
        p.name AS publisher_name
      FROM books b
      LEFT JOIN categories c ON c.id = b.category_id
      LEFT JOIN publishers p ON p.id = b.publisher_id
      WHERE b.category_id = ${book.category_id}
        AND b.id != ${id}
      ORDER BY b.sales_count DESC
      LIMIT 4
    `;
    return NextResponse.json(related);
  } catch (err) {
    console.error('[related books]', err.message);
    return NextResponse.json({ error: 'Failed to load related books.' }, { status: 500 });
  }
}
