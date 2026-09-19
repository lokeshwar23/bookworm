// app/api/writers/[authorName]/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// DELETE — unfollow an author
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const { authorName } = await params;
    const decoded = decodeURIComponent(authorName);

    await sql`
      DELETE FROM followed_authors
      WHERE user_id = ${user.sub} AND author_name = ${decoded}
    `;

    return NextResponse.json({ message: 'Unfollowed.' });
  } catch (err) {
    console.error('[writers DELETE]', err.message);
    return NextResponse.json({ error: 'Failed to unfollow author.' }, { status: 500 });
  }
}
