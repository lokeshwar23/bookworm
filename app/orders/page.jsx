'use client';
// app/orders/page.jsx — My Orders
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/forms/AuthProvider';
import { useCart } from '@/components/forms/CartProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BookCover from '@/components/ui/BookCover';

const STATUS_COLORS = {
  confirmed: 'text-green-400 bg-green-900/20 border-green-800',
  pending:   'text-yellow-400 bg-yellow-900/20 border-yellow-800',
  cancelled: 'text-red-400 bg-red-900/20 border-red-800',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/orders').then(r => r.ok ? r.json() : []).then(setOrders).finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleBuyAgain(items) {
    for (const item of items) {
      try { await addToCart(item.book_id, 1); } catch {}
    }
    router.push('/cart');
  }

  if (loading || authLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p>You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-400 hover:underline">Start browsing</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-xs text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[order.status] || 'text-gray-400'}`}>
                    {order.status}
                  </span>
                  <span className="text-white font-bold">₹{parseFloat(order.total).toFixed(0)}</span>
                </div>
              </div>

              {/* Order items with generated covers */}
              <div className="flex flex-wrap gap-3 mb-4">
                {order.items?.map(item => (
                  <Link key={item.id} href={item.book_id ? `/products/${item.book_id}` : '#'}
                    className="flex items-center gap-2 group">
                    <div className="w-10 rounded overflow-hidden flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                      <BookCover
                        book={{ cover_image_url: item.cover, title: item.title, author: item.author, category_name: item.category_name }}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium line-clamp-1 max-w-[120px] group-hover:text-indigo-300 transition">{item.title}</p>
                      <p className="text-xs text-gray-500">×{item.quantity} · ₹{parseFloat(item.unit_price).toFixed(0)}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                {order.status === 'confirmed' && (
                  <button onClick={() => handleBuyAgain(order.items)}
                    className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium transition">
                    Buy Again
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={async () => {
                      const r = await fetch('/api/checkout/cancel', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ orderId: order.id }) });
                      const d = await r.json();
                      if (r.ok) setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: 'cancelled'} : o));
                      else alert(d.error);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/20 text-sm transition">
                    Cancel Order
                  </button>
                )}
                <Link href={`/orders/${order.id}`}
                  className="px-4 py-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-indigo-700 text-sm transition">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
