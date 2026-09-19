'use client';
// app/cart/page.jsx — Shopping Cart
import { useState } from 'react';
import { useCart } from '@/components/forms/CartProvider';
import { useAuth } from '@/components/forms/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, LogIn, X } from 'lucide-react';
import BookCover from '@/components/ui/BookCover';

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  function handleCheckout() {
    if (!user) { setShowLoginPrompt(true); return; }
    router.push('/checkout');
  }

  const subtotal = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  if (cartItems.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h1 className="text-xl font-semibold text-white mb-2">Your cart is empty</h1>
      <p className="text-gray-500 mb-6">Add books to your cart to get started.</p>
      <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition">
        Browse Books
      </Link>
    </div>
  );

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                {/* Cover */}
                <Link href={`/products/${item.book_id || item.id}`} className="flex-shrink-0 w-14 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <BookCover book={item} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-indigo-400">{item.category_name}</p>
                  <Link href={`/products/${item.book_id || item.id}`}>
                    <p className="font-semibold text-white text-sm leading-snug hover:text-indigo-300 transition">{item.title}</p>
                  </Link>
                  <p className="text-xs text-gray-500">by {item.author}</p>
                  <p className="text-xs text-gray-600 capitalize mt-0.5">{item.format}</p>
                  <p className="font-bold text-white mt-2">₹{parseFloat(item.price).toFixed(0)}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-2 py-1">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 sticky top-20">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="text-white">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={subtotal >= 500 ? 'text-green-400' : 'text-white'}>
                    {subtotal >= 500 ? 'Free' : '₹50'}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#2a2a2a] mt-4 pt-4 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>₹{(subtotal + (subtotal >= 500 ? 0 : 50)).toFixed(0)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
              >
                Proceed to Checkout →
              </button>
              <Link href="/" className="block text-center mt-3 text-sm text-indigo-400 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Login required popup ── */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-5">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-indigo-500/15 flex items-center justify-center">
              <LogIn size={26} className="text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Login Required</h2>
              <p className="text-gray-400 text-sm">You need to be logged in to proceed to checkout and place your order.</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => { setShowLoginPrompt(false); router.push('/login?redirect=/checkout'); }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Login to Continue
              </button>
              <button
                onClick={() => { setShowLoginPrompt(false); router.push('/register'); }}
                className="w-full py-3 border border-[#2a2a2a] hover:border-indigo-600 text-gray-300 hover:text-white text-sm rounded-xl transition"
              >
                New here? Create an account
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-600 hover:text-gray-400 text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
