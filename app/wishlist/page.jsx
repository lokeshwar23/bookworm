'use client';
// app/wishlist/page.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/forms/AuthProvider';
import { useCart } from '@/components/forms/CartProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, ShoppingCart } from 'lucide-react';
import BookCover from '@/components/ui/BookCover';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/wishlist').then(r => r.ok ? r.json() : []).then(setItems).finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleRemove(bookId) {
    await fetch(`/api/wishlist/${bookId}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.book_id !== bookId));
  }

  if (loading || authLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p className="text-4xl mb-3">💛</p>
          <p>Your wishlist is empty.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-400 hover:underline">Discover books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex gap-4 hover:border-indigo-700 transition">
              {/* Cover */}
              <Link href={`/products/${item.book_id}`} className="flex-shrink-0 w-16 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <BookCover
                  book={{ cover_image_url: item.cover_image_url, title: item.title, author: item.author, category_name: item.category_name }}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-400">{item.category_name}</p>
                <Link href={`/products/${item.book_id}`}>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 hover:text-indigo-300 transition">{item.title}</p>
                </Link>
                <p className="text-xs text-gray-500">by {item.author}</p>
                <p className="font-bold text-white mt-2">₹{parseFloat(item.price).toFixed(0)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => addToCart(item.book_id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                    <ShoppingCart size={12} /> Add to Cart
                  </button>
                  <button onClick={() => handleRemove(item.book_id)}
                    className="p-1.5 rounded-lg border border-[#2a2a2a] text-gray-500 hover:text-red-400 hover:border-red-800 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
