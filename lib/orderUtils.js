// lib/orderUtils.js
// Shared helpers for order total computation and gift point management.

import sql from '@/lib/db';

/**
 * Compute order totals from cart items.
 * All monetary values in INR (₹).
 *
 * Rules:
 *  - tax           = 12% of subtotal
 *  - delivery      = free if subtotal >= 500, else ₹50
 *  - gift discount = min(giftPointsToRedeem, total before gift reduction)
 *  - 1 gift point  = ₹1 discount
 */
export function computeTotals(cartItems, giftPointsToRedeem = 0) {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const tax = parseFloat((subtotal * 0.12).toFixed(2));
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const totalBeforeGift = subtotal + tax + deliveryCharge;

  const pointsDiscount = Math.min(giftPointsToRedeem, Math.floor(totalBeforeGift));
  const total = parseFloat((totalBeforeGift - pointsDiscount).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax,
    deliveryCharge,
    discount: pointsDiscount,
    total,
    giftPointsUsed: pointsDiscount,
  };
}

/**
 * Award gift points to a registered user after a confirmed order.
 * Rule: floor(total / 10) points earned.
 */
export async function awardGiftPoints(userId, orderId, total) {
  const points = Math.floor(total / 10);
  if (points <= 0) return;

  await sql`
    UPDATE users SET gift_points = gift_points + ${points} WHERE id = ${userId}
  `;
  await sql`
    INSERT INTO gift_point_transactions (user_id, order_id, delta, reason)
    VALUES (${userId}, ${orderId}, ${points}, 'Order reward')
  `;
}

/**
 * Reverse gift points that were redeemed for a cancelled order.
 */
export async function reverseGiftPoints(userId, orderId, pointsUsed) {
  if (pointsUsed <= 0) return;

  await sql`
    UPDATE users SET gift_points = gift_points + ${pointsUsed} WHERE id = ${userId}
  `;
  await sql`
    INSERT INTO gift_point_transactions (user_id, order_id, delta, reason)
    VALUES (${userId}, ${orderId}, ${pointsUsed}, 'Order cancellation refund')
  `;

  // Also reverse earned points from this order (delta positive rows for this order)
  const [earned] = await sql`
    SELECT SUM(delta) AS total
    FROM gift_point_transactions
    WHERE order_id = ${orderId} AND delta > 0 AND user_id = ${userId}
  `;
  const earnedPoints = parseInt(earned?.total || 0, 10);
  if (earnedPoints > 0) {
    await sql`
      UPDATE users SET gift_points = GREATEST(gift_points - ${earnedPoints}, 0) WHERE id = ${userId}
    `;
    await sql`
      INSERT INTO gift_point_transactions (user_id, order_id, delta, reason)
      VALUES (${userId}, ${orderId}, ${-earnedPoints}, 'Order cancellation clawback')
    `;
  }
}
