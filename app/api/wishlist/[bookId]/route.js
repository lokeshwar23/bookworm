// app/api/wishlist/[bookId]/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
    const { bookId } = await params;
    await sql`DELETE FROM wishlists WHERE user_id = ${user.sub} AND book_id = ${bookId}`;
    return NextResponse.json({ message: 'Removed from wishlist.' });
  } catch (err) {
    console.error('[wishlist DELETE]', err.message);
    return NextResponse.json({ error: 'Failed to remove from wishlist.' }, { status: 500 });
  }
}
