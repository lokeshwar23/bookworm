// app/api/checkout/cancel/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { reverseGiftPoints } from '@/lib/orderUtils';

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });

    const user = await getCurrentUser();

    const [order] = await sql`
      SELECT id, user_id, status, gift_points_used, created_at
      FROM orders WHERE id = ${orderId} LIMIT 1
    `;

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    // Ownership check
    if (user?.sub && order.user_id && order.user_id !== user.sub) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled.' }, { status: 400 });
    }

    // 48-hour window
    const hoursSince = (Date.now() - new Date(order.created_at).getTime()) / 36e5;
    if (hoursSince > 48) {
      return NextResponse.json({ error: 'Cancellation window has passed (48 hours).' }, { status: 400 });
    }

    // Cancel the order
    await sql`UPDATE orders SET status = 'cancelled' WHERE id = ${orderId}`;

    // Reverse gift points if the user redeemed any
    if (order.user_id && order.gift_points_used > 0) {
      await reverseGiftPoints(order.user_id, orderId, order.gift_points_used);
    }

    return NextResponse.json({ message: 'Order cancelled successfully.', orderId });
  } catch (err) {
    console.error('[cancel order]', err.message);
    return NextResponse.json({ error: 'Failed to cancel order.' }, { status: 500 });
  }
}
