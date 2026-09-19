// app/api/books/route.js
import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/bookQueries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getBooks({
      category:  searchParams.get('category') || undefined,
      publisher: searchParams.get('publisher') || undefined,
      format:    searchParams.get('format') || undefined,
      language:  searchParams.get('language') || undefined,
      minPrice:  searchParams.get('minPrice') || undefined,
      maxPrice:  searchParams.get('maxPrice') || undefined,
      sort:      searchParams.get('sort') || 'relevance',
      q:         searchParams.get('q') || undefined,
      page:      parseInt(searchParams.get('page') || '1', 10),
      pageSize:  parseInt(searchParams.get('pageSize') || '16', 10),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[books]', err.message);
    return NextResponse.json({ error: 'Failed to load books.' }, { status: 500 });
  }
}
