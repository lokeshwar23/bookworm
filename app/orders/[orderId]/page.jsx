'use client';
// app/orders/[orderId]/page.jsx — Order Confirmation
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import BookCover from '@/components/ui/BookCover';

function deliveryLabel(days) {
  const d = new Date();
  d.setDate(d.getDate() + (days || 5));
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then(r => r.ok ? r.json() : null)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-4">
          <CheckCircle size={56} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Your purchase is successful!</h1>
        <p className="text-gray-400 text-sm mb-6">Your books are on their way 🚀</p>

        {order?.items && (
          <div className="space-y-3 mb-6 text-left">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-[#111] rounded-xl p-3 border border-[#2a2a2a]">
                {/* Book cover — generated SVG if no image */}
                <div className="w-12 flex-shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <BookCover
                    book={{ cover_image_url: item.cover, title: item.title, author: item.author, category_name: item.category_name }}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">by {item.author}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.format}</p>
                  <p className="text-xs text-indigo-400 mt-1">
                    ₹{parseFloat(item.unit_price).toFixed(0)} · Delivery by {deliveryLabel(item.delivery_days)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {order && (
          <p className="text-sm text-gray-500 mb-6">
            Order Total: <span className="text-white font-semibold">₹{parseFloat(order.total).toFixed(0)}</span>
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
