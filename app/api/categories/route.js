// app/api/categories/route.js
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, slug FROM categories ORDER BY name ASC
    `;
    return NextResponse.json(categories);
  } catch (err) {
    console.error('[categories]', err.message);
    return NextResponse.json({ error: 'Failed to load categories.' }, { status: 500 });
  }
}
