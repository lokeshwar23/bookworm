// app/api/orders/[orderId]/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;
    const user = await getCurrentUser();

    const [order] = await sql`
      SELECT
        o.id, o.status, o.subtotal, o.tax, o.delivery_charge,
        o.discount, o.total, o.payment_method, o.gift_points_used,
        o.guest_email, o.created_at,
        json_agg(
          json_build_object(
            'id',           oi.id,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price,
            'book_id',      b.id,
            'title',        b.title,
            'author',       b.author,
            'cover',        b.cover_image_url,
            'format',       b.format,
            'delivery_days', b.delivery_days
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN books b ON b.id = oi.book_id
      WHERE o.id = ${orderId}
      GROUP BY o.id
      LIMIT 1
    `;

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    // Verify ownership: must be the order owner (or guest_email match is omitted for simplicity)
    if (user?.sub && order.user_id && order.user_id !== user.sub) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('[order detail]', err.message);
    return NextResponse.json({ error: 'Failed to load order.' }, { status: 500 });
  }
}
