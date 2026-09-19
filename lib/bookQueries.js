// lib/bookQueries.js
// Reusable parameterised SQL helpers for book filtering.

import sql from '@/lib/db';

/**
 * Build and execute a filtered, paginated book list query.
 * All parameters are optional and safely parameterised.
 */
export async function getBooks({
  category,      // category slug
  publisher,     // publisher slug
  format,        // 'paperback' | 'hardcover' | 'ebook'
  language,      // e.g. 'English'
  minPrice,
  maxPrice,
  sort,          // 'relevance' | 'price_asc' | 'price_desc' | 'bestselling' | 'new_arrivals'
  q,             // search query
  page = 1,
  pageSize = 16,
} = {}) {
  const offset = (page - 1) * pageSize;

  // Build WHERE fragments as arrays then join
  const conditions = ['1=1'];
  const params = [];

  if (category && category !== 'all') {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (publisher) {
    params.push(publisher);
    conditions.push(`p.slug = $${params.length}`);
  }
  if (format) {
    params.push(format);
    conditions.push(`b.format = $${params.length}::book_format`);
  }
  if (language) {
    params.push(language);
    conditions.push(`b.language = $${params.length}`);
  }
  if (minPrice !== undefined && minPrice !== '') {
    params.push(Number(minPrice));
    conditions.push(`b.price >= $${params.length}`);
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    params.push(Number(maxPrice));
    conditions.push(`b.price <= $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`);
  }

  const whereClause = conditions.join(' AND ');

  const sortMap = {
    relevance:    'b.sales_count DESC',
    price_asc:    'b.price ASC',
    price_desc:   'b.price DESC',
    bestselling:  'b.sales_count DESC',
    new_arrivals: 'b.created_at DESC',
  };
  const orderBy = sortMap[sort] || 'b.sales_count DESC';

  params.push(pageSize);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const query = `
    SELECT
      b.id, b.title, b.author, b.price, b.format, b.language,
      b.cover_image_url, b.rating, b.sales_count, b.delivery_days,
      b.stock, b.is_featured, b.created_at,
      c.name  AS category_name,  c.slug  AS category_slug,
      p.name  AS publisher_name, p.slug  AS publisher_slug
    FROM books b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN publishers p ON p.id = b.publisher_id
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM books b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN publishers p ON p.id = b.publisher_id
    WHERE ${whereClause}
  `;

  const [books, countResult] = await Promise.all([
    sql.unsafe(query, params),
    sql.unsafe(countQuery, params.slice(0, -2)), // remove limit/offset params
  ]);

  return {
    books,
    total: parseInt(countResult[0]?.total || 0, 10),
    page,
    pageSize,
  };
}
