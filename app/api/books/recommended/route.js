// app/api/books/recommended/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (user?.sub) {
      // Registered user: get categories from past orders, return books from those categories
      const orderedCategories = await sql`
        SELECT DISTINCT b.category_id
        FROM order_items oi
        JOIN books b ON b.id = oi.book_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = ${user.sub}
          AND o.status = 'confirmed'
        LIMIT 5
      `;

      if (orderedCategories.length > 0) {
        const categoryIds = orderedCategories.map(r => r.category_id);
        const books = await sql`
          SELECT
            b.id, b.title, b.author, b.price, b.format, b.language,
            b.cover_image_url, b.rating, b.sales_count, b.delivery_days,
            c.name AS category_name, c.slug AS category_slug,
            p.name AS publisher_name, p.slug AS publisher_slug
          FROM books b
          LEFT JOIN categories c ON c.id = b.category_id
          LEFT JOIN publishers p ON p.id = b.publisher_id
          WHERE b.category_id = ANY(${categoryIds})
          ORDER BY b.rating DESC, b.sales_count DESC
          LIMIT 8
        `;
        return NextResponse.json(books);
      }
    }

    // Guest or user with no orders: return top 8 bestsellers
    const books = await sql`
      SELECT
        b.id, b.title, b.author, b.price, b.format, b.language,
        b.cover_image_url, b.rating, b.sales_count, b.delivery_days,
        c.name AS category_name, c.slug AS category_slug,
        p.name AS publisher_name, p.slug AS publisher_slug
      FROM books b
      LEFT JOIN categories c ON c.id = b.category_id
      LEFT JOIN publishers p ON p.id = b.publisher_id
      ORDER BY b.sales_count DESC
      LIMIT 8
    `;
    return NextResponse.json(books);
  } catch (err) {
    console.error('[recommended]', err.message);
    return NextResponse.json({ error: 'Failed to load recommendations.' }, { status: 500 });
  }
}
