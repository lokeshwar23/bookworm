// app/api/publishers/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const publishers = await sql`
      SELECT id, name, slug FROM publishers ORDER BY name ASC
    `;
    return NextResponse.json(publishers);
  } catch (err) {
    console.error('[publishers]', err.message);
    return NextResponse.json({ error: 'Failed to load publishers.' }, { status: 500 });
  }
}
