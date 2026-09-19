'use client';
// components/ui/BookCard.jsx
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/forms/CartProvider';
import { useState } from 'react';
import BookCover from '@/components/ui/BookCover';

function deliveryLabel(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookCard({ book, showBuyAgain = false, onBuyAgain }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart(e) {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(book.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  const price = parseFloat(book.price);

  return (
    <Link
      href={`/products/${book.id}`}
      className="group block bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-900/20"
    >
      {/* Cover */}
      <div className="relative overflow-hidden bg-[#111]" style={{ aspectRatio: '3/4' }}>
        <BookCover
          book={book}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-gray-300 capitalize backdrop-blur-sm">
            {book.format}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-indigo-400 truncate">{book.category_name}</p>
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-500 truncate">by {book.author}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-white">₹{price.toFixed(0)}</span>
          <span className="text-[10px] text-gray-600">⭐ {book.rating}</span>
        </div>

        <p className="text-[10px] text-gray-600">
          Delivery by {deliveryLabel(book.delivery_days)}
        </p>

        <div className="flex gap-2 mt-2">
          {showBuyAgain ? (
            <button
              onClick={e => { e.preventDefault(); onBuyAgain?.(book); }}
              className="flex-1 py-1.5 rounded-lg text-xs bg-purple-700 hover:bg-purple-600 text-white font-medium transition"
            >
              Buy Again
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium transition flex items-center justify-center gap-1"
            >
              <ShoppingCart size={12} />
              {added ? 'Added!' : adding ? '…' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
