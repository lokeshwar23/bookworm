// app/api/writers/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — list all followed authors for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const authors = await sql`
      SELECT id, author_name, created_at
      FROM followed_authors
      WHERE user_id = ${user.sub}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(authors);
  } catch (err) {
    console.error('[writers GET]', err.message);
    return NextResponse.json({ error: 'Failed to fetch followed authors.' }, { status: 500 });
  }
}

// POST — follow an author by name
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user?.sub) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });

    const { authorName } = await request.json();
    if (!authorName?.trim()) return NextResponse.json({ error: 'authorName is required.' }, { status: 400 });

    const [row] = await sql`
      INSERT INTO followed_authors (user_id, author_name)
      VALUES (${user.sub}, ${authorName.trim()})
      ON CONFLICT (user_id, author_name) DO NOTHING
      RETURNING id, author_name, created_at
    `;

    return NextResponse.json(row || { author_name: authorName.trim() }, { status: 201 });
  } catch (err) {
    console.error('[writers POST]', err.message);
    return NextResponse.json({ error: 'Failed to follow author.' }, { status: 500 });
  }
}
