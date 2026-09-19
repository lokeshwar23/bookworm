'use client';
// app/products/[id]/page.jsx — Product Detail Page
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import RatingStars from '@/components/ui/RatingStars';
import BookCard from '@/components/ui/BookCard';
import BookCover from '@/components/ui/BookCover';
import { useCart } from '@/components/forms/CartProvider';
import { useAuth } from '@/components/forms/AuthProvider';
import { ShoppingCart, Heart, Package } from 'lucide-react';

function deliveryLabel(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [book, setBook]               = useState(null);
  const [related, setRelated]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [added, setAdded]             = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/books/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/books/${id}/related`).then(r => r.ok ? r.json() : []),
    ]).then(([b, rel]) => {
      setBook(b);
      setRelated(rel || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart(id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!user) { router.push('/login'); return; }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: id }),
    });
    if (res.ok) setWishlistAdded(true);
  }

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      <div className="h-4 w-48 bg-[#1a1a1a] rounded mb-6" />
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div className="w-48 h-72 rounded-2xl bg-[#1a1a1a] flex-shrink-0" />
        <div className="flex-1 space-y-4 max-w-md">
          <div className="h-4 bg-[#1a1a1a] rounded w-1/3" />
          <div className="h-8 bg-[#1a1a1a] rounded w-3/4" />
          <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
          <div className="h-10 bg-[#1a1a1a] rounded w-1/4 mt-4" />
          <div className="flex gap-3 mt-6">
            <div className="h-10 bg-[#1a1a1a] rounded-xl w-36" />
            <div className="h-10 bg-[#1a1a1a] rounded-xl w-36" />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!book) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">
      <p className="text-5xl mb-4">📖</p>
      <p className="text-lg mb-4">Book not found.</p>
      <Link href="/" className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
        Back to Books
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: book.category_name, href: `/?category=${book.category_slug}` },
          { label: book.title },
        ]} />
      </div>

      {/* ── Hero card: cover + info, centred ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-center mb-6">

        {/* Cover */}
        <div className="flex-shrink-0 mx-auto md:mx-0 w-44 md:w-52 rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <BookCover book={book} className="w-full h-full" imgClassName="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center md:text-left">

          {/* Category + publisher */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-800/50 text-indigo-400 text-xs font-medium">
              {book.category_name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#222] border border-[#333] text-gray-400 text-xs">
              {book.publisher_name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#222] border border-[#333] text-gray-400 text-xs capitalize">
              {book.format}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">
            {book.title}
          </h1>

          {/* Author */}
          <p className="text-gray-400 mb-4">
            by <span className="text-gray-200 font-medium">{book.author}</span>
            <span className="text-gray-600 mx-2">·</span>
            <span className="text-gray-500 text-sm">{book.language}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <RatingStars rating={book.rating} />
            <span className="text-xs text-gray-500">{book.sales_count?.toLocaleString()} copies sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-center md:justify-start gap-3 mb-4">
            <span className="text-4xl font-bold text-white">₹{parseFloat(book.price).toFixed(0)}</span>
          </div>

          {/* Delivery */}
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-6">
            <Package size={14} className="text-green-400" />
            <span>Free delivery by <span className="text-green-400 font-medium">{deliveryLabel(book.delivery_days)}</span></span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold transition text-sm shadow-lg shadow-indigo-900/30"
            >
              <ShoppingCart size={16} />
              {added ? '✓ Added to Cart!' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition font-medium text-sm
                ${wishlistAdded
                  ? 'border-pink-600 text-pink-400 bg-pink-900/20'
                  : 'border-[#2a2a2a] text-gray-400 hover:border-pink-600 hover:text-pink-400 hover:bg-pink-900/10'
                }`}
            >
              <Heart size={15} fill={wishlistAdded ? 'currentColor' : 'none'} />
              {wishlistAdded ? 'Wishlisted ♥' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Description + Author + Related ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left column: description + author bio */}
        <div className="flex-1 min-w-0 space-y-4">
          {book.description && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-3">About this Book</h2>
              <p className="text-gray-300 leading-relaxed text-sm">{book.description}</p>
            </div>
          )}

          {book.author_bio && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-3">About the Author</h2>
              <p className="text-gray-300 leading-relaxed text-sm">{book.author_bio}</p>
            </div>
          )}
        </div>

        {/* Right column: related reads */}
        {related.length > 0 && (
          <aside className="w-full lg:w-60 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white mb-3">You may also like</h3>
            <div className="flex flex-col gap-3">
              {related.map(rel => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="flex gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 hover:border-indigo-700 transition group"
                >
                  <div className="w-12 flex-shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <BookCover book={rel} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-indigo-400 mb-0.5">{rel.category_name}</p>
                    <p className="text-xs font-medium text-white leading-tight line-clamp-2 group-hover:text-indigo-300 transition">{rel.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">by {rel.author}</p>
                    <p className="text-sm font-bold text-white mt-1">₹{parseFloat(rel.price).toFixed(0)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>

    </div>
  );
}
