// app/api/checkout/verify-payment/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getSessionId } from '@/lib/cartSession';
import { awardGiftPoints } from '@/lib/orderUtils';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const sessionId = getSessionId(request);
    const { orderId } = await request.json();

    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });

    // --- Confirm the order ---
    const [order] = await sql`
      UPDATE orders
      SET status = 'confirmed'
      WHERE id = ${orderId} AND status = 'pending'
      RETURNING id, user_id, total, gift_points_used
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found or already processed.' }, { status: 404 });
    }

    // --- Clear the cart ---
    if (user?.sub) {
      await sql`DELETE FROM cart_items WHERE user_id = ${user.sub}`;
    } else if (sessionId) {
      await sql`DELETE FROM cart_items WHERE session_id = ${sessionId} AND user_id IS NULL`;
    }

    // --- Award gift points to registered user ---
    if (order.user_id) {
      await awardGiftPoints(order.user_id, order.id, parseFloat(order.total));
    }

    return NextResponse.json({ orderId: order.id, status: 'confirmed' });
  } catch (err) {
    console.error('[verify-payment]', err.message);
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 500 });
  }
}
