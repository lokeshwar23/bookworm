// app/api/orders/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const orders = await sql`
      SELECT
        o.id, o.status, o.subtotal, o.tax, o.delivery_charge,
        o.discount, o.total, o.payment_method, o.gift_points_used, o.created_at,
        json_agg(
          json_build_object(
            'id',         oi.id,
            'quantity',   oi.quantity,
            'unit_price', oi.unit_price,
            'book_id',    b.id,
            'title',      b.title,
            'author',     b.author,
            'cover',      b.cover_image_url,
            'format',     b.format
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN books b ON b.id = oi.book_id
      WHERE o.user_id = ${user.sub}
        AND o.status IN ('confirmed', 'cancelled')
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    return NextResponse.json(orders);
  } catch (err) {
    console.error('[orders GET]', err.message);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 500 });
  }
}
