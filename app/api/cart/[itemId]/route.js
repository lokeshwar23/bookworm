// app/api/cart/[itemId]/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getSessionId } from '@/lib/cartSession';

export async function PATCH(request, { params }) {
  try {
    const { itemId } = await params;
    const { quantity } = await request.json();
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1.' }, { status: 400 });
    }

    const user = await getCurrentUser();
    const sessionId = getSessionId(request);

    // Only allow updating items belonging to this user/session
    if (user?.sub) {
      await sql`
        UPDATE cart_items SET quantity = ${quantity}
        WHERE id = ${itemId} AND user_id = ${user.sub}
      `;
    } else if (sessionId) {
      await sql`
        UPDATE cart_items SET quantity = ${quantity}
        WHERE id = ${itemId} AND session_id = ${sessionId} AND user_id IS NULL
      `;
    }
    return NextResponse.json({ message: 'Cart updated.' });
  } catch (err) {
    console.error('[cart PATCH]', err.message);
    return NextResponse.json({ error: 'Failed to update cart.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser();
    const sessionId = getSessionId(request);

    if (user?.sub) {
      await sql`DELETE FROM cart_items WHERE id = ${itemId} AND user_id = ${user.sub}`;
    } else if (sessionId) {
      await sql`DELETE FROM cart_items WHERE id = ${itemId} AND session_id = ${sessionId} AND user_id IS NULL`;
    }
    return NextResponse.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('[cart DELETE]', err.message);
    return NextResponse.json({ error: 'Failed to remove item.' }, { status: 500 });
  }
}
