'use client';
// app/page.jsx — Home (= Products / Catalogue)
import { Suspense } from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookCard from '@/components/ui/BookCard';
import { Search, MoreHorizontal, X } from 'lucide-react';

const FORMATS = ['paperback', 'hardcover', 'ebook'];
const SORTS = [
  { value: 'relevance',    label: 'Relevance' },
  { value: 'price_asc',    label: 'Price: Low to High' },
  { value: 'price_desc',   label: 'Price: High to Low' },
  { value: 'bestselling',  label: 'Bestselling' },
  { value: 'new_arrivals', label: 'New Arrivals' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories]       = useState([]);
  const [books, setBooks]                 = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const category = searchParams.get('category') || '';
  const format   = searchParams.get('format')   || '';
  const sort     = searchParams.get('sort')     || 'relevance';
  const q        = searchParams.get('q')        || '';
  const page     = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 16;

  const setParam = useCallback((key, value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/?${p.toString()}`);
  }, [searchParams, router]);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setCatDrawerOpen(false);
      }
    }
    if (catDrawerOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [catDrawerOpen]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (format)   params.set('format', format);
    if (sort)     params.set('sort', sort);
    if (q)        params.set('q', q);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    fetch(`/api/books?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setBooks(data.books || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, format, sort, q, page]);

  const totalPages = Math.ceil(total / pageSize);

  function pickCategory(slug) {
    setParam('category', slug);
    setCatDrawerOpen(false);
  }

  const activeLabel = category
    ? categories.find(c => c.slug === category)?.name || 'Category'
    : 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

      {/* ── Desktop layout: sidebar + main ── */}
      <div className="flex gap-6">

        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Categories</h3>
          <ul className="space-y-1">
            <li>
              <button onClick={() => setParam('category', '')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${!category ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}>
                All
              </button>
            </li>
            {categories.filter(c => c.slug !== 'all').map(cat => (
              <li key={cat.id}>
                <button onClick={() => setParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${category === cat.slug ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}>
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">

            {/* ⋯ Category button — mobile only */}
            <div className="relative md:hidden" ref={drawerRef}>
              <button
                onClick={() => setCatDrawerOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition
                  ${catDrawerOpen || category
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-indigo-500 hover:text-white'
                  }`}
                title="Browse categories"
              >
                <MoreHorizontal size={16} />
                <span className="max-w-[80px] truncate">{activeLabel}</span>
              </button>

              {/* Category dropdown — overlays the products */}
              {catDrawerOpen && (
                <div className="absolute left-0 top-full mt-2 z-40 w-56 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Categories</span>
                    <button onClick={() => setCatDrawerOpen(false)} className="text-gray-500 hover:text-white transition">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Category list */}
                  <ul className="py-1 max-h-72 overflow-y-auto">
                    <li>
                      <button
                        onClick={() => pickCategory('')}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${!category ? 'bg-indigo-600/20 text-indigo-400 font-medium' : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'}`}
                      >
                        All Books
                      </button>
                    </li>
                    {categories.filter(c => c.slug !== 'all').map(cat => (
                      <li key={cat.id}>
                        <button
                          onClick={() => pickCategory(cat.slug)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition ${category === cat.slug ? 'bg-indigo-600/20 text-indigo-400 font-medium' : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'}`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[140px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search books…" defaultValue={q}
                onKeyDown={e => { if (e.key === 'Enter') setParam('q', e.target.value); }}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>

            {/* Format */}
            <select value={format} onChange={e => setParam('format', e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
              <option value="">All Formats</option>
              {FORMATS.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-4">{total} {total === 1 ? 'book' : 'books'} found</p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-4xl mb-3">📚</p>
              <p>No books found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}
                className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 disabled:opacity-40 hover:border-indigo-500">
                ← Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setParam('page', String(page + 1))}
                className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 disabled:opacity-40 hover:border-indigo-500">
                Next →
              </button>
            </div>
          )}
        </div>

      </div>{/* end desktop flex */}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
