// app/api/checkout/create-order/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getSessionId } from '@/lib/cartSession';
import { computeTotals } from '@/lib/orderUtils';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const sessionId = getSessionId(request);
    const body = await request.json();
    const {
      addressData,       // { firstName, lastName, addressLine, city, state, pin, phone }
      guestEmail,        // required if not logged in
      giftPointsToRedeem = 0,
      paymentMethod = 'card',
    } = body;

    // --- Load cart ---
    let cartItems = [];
    if (user?.sub) {
      cartItems = await sql`
        SELECT ci.quantity, b.price, b.id AS book_id, b.title, b.delivery_days
        FROM cart_items ci JOIN books b ON b.id = ci.book_id
        WHERE ci.user_id = ${user.sub}
      `;
    } else if (sessionId) {
      cartItems = await sql`
        SELECT ci.quantity, b.price, b.id AS book_id, b.title, b.delivery_days
        FROM cart_items ci JOIN books b ON b.id = ci.book_id
        WHERE ci.session_id = ${sessionId} AND ci.user_id IS NULL
      `;
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // --- Validate gift points ---
    let validGiftPoints = 0;
    if (user?.sub && giftPointsToRedeem > 0) {
      const [u] = await sql`SELECT gift_points FROM users WHERE id = ${user.sub}`;
      validGiftPoints = Math.min(giftPointsToRedeem, u?.gift_points || 0);
    }

    // --- Compute totals ---
    const totals = computeTotals(cartItems, validGiftPoints);

    // --- Save address (use existing or inline) ---
    let savedAddressId = body.addressId || null;
    if (!savedAddressId && user?.sub && addressData) {
      const [addr] = await sql`
        INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, pin, phone)
        VALUES (${user.sub}, ${addressData.firstName}, ${addressData.lastName},
                ${addressData.addressLine}, ${addressData.city}, ${addressData.state},
                ${addressData.pin}, ${addressData.phone})
        RETURNING id
      `;
      savedAddressId = addr.id;
    }

    // --- Drop any stale pending orders for this user (abandoned payment sessions) ---
    if (user?.sub) {
      await sql`
        DELETE FROM order_items
        WHERE order_id IN (
          SELECT id FROM orders
          WHERE user_id = ${user.sub} AND status = 'pending'
        )
      `;
      await sql`
        DELETE FROM orders
        WHERE user_id = ${user.sub} AND status = 'pending'
      `;
    }

    // --- Create internal order record (status = pending) ---
    const [order] = await sql`
      INSERT INTO orders (user_id, guest_email, status, subtotal, tax, delivery_charge,
                          discount, total, payment_method, gift_points_used)
      VALUES (
        ${user?.sub || null},
        ${user ? null : (guestEmail || null)},
        'pending',
        ${totals.subtotal}, ${totals.tax}, ${totals.deliveryCharge},
        ${totals.discount}, ${totals.total}, ${paymentMethod}, ${totals.giftPointsUsed}
      )
      RETURNING id
    `;
    const orderId = order.id;

    // --- Insert order items ---
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, book_id, quantity, unit_price)
        VALUES (${orderId}, ${item.book_id}, ${item.quantity}, ${item.price})
      `;
    }

    // --- Deduct gift points immediately (held pending payment) ---
    if (user?.sub && totals.giftPointsUsed > 0) {
      await sql`
        UPDATE users SET gift_points = GREATEST(gift_points - ${totals.giftPointsUsed}, 0)
        WHERE id = ${user.sub}
      `;
      await sql`
        INSERT INTO gift_point_transactions (user_id, order_id, delta, reason)
        VALUES (${user.sub}, ${orderId}, ${-totals.giftPointsUsed}, 'Redeemed at checkout')
      `;
    }

    // --- Return stub payment response ---
    return NextResponse.json({
      orderId,
      stubOrderId: `stub_${uuidv4()}`,
      amount: totals.total,
      currency: 'INR',
    });
  } catch (err) {
    console.error('[create-order]', err.message);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}
