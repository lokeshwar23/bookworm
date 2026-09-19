'use client';
// app/checkout/page.jsx — Checkout Page
import { useState, useEffect } from 'react';
import { useCart } from '@/components/forms/CartProvider';
import { useAuth } from '@/components/forms/AuthProvider';
import { useRouter } from 'next/navigation';
import MockPaymentModal from '@/components/forms/MockPaymentModal';

const EMPTY_ADDRESS = {
  firstName: '', lastName: '', addressLine: '', city: '', state: '', pin: '', phone: '',
};

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [giftPoints, setGiftPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // --- Load saved addresses for logged-in users ---
  useEffect(() => {
    if (!user) return;
    fetch('/api/user/addresses')
      .then(r => r.json())
      .then(data => {
        const list = data.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          // Pre-fill with the most recently saved address
          const latest = list[0];
          setSelectedAddressId(latest.id);
          setAddress({
            firstName:   latest.first_name   || '',
            lastName:    latest.last_name    || '',
            addressLine: latest.address_line || '',
            city:        latest.city         || '',
            state:       latest.state        || '',
            pin:         latest.pin          || '',
            phone:       latest.phone        || '',
          });
        }
      })
      .catch(() => {});
  }, [user]);

  function handleSelectSaved(addrId) {
    if (addrId === '__new') {
      setSelectedAddressId('__new');
      setAddress(EMPTY_ADDRESS);
      return;
    }
    const found = savedAddresses.find(a => a.id === addrId);
    if (!found) return;
    setSelectedAddressId(addrId);
    setAddress({
      firstName:   found.first_name   || '',
      lastName:    found.last_name    || '',
      addressLine: found.address_line || '',
      city:        found.city         || '',
      state:       found.state        || '',
      pin:         found.pin          || '',
      phone:       found.phone        || '',
    });
  }

  const subtotal = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.12).toFixed(2));
  const delivery = subtotal >= 500 ? 0 : 50;
  const maxGift = user?.giftPoints || 0;
  const validGift = Math.min(giftPoints, maxGift);
  const total = Math.max(0, subtotal + tax + delivery - validGift);

  function handleAddressChange(e) {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    if (!address.firstName || !address.addressLine || !address.city || !address.pin) {
      setError('Please fill in all required address fields.');
      return;
    }
    setLoading(true);
    try {
      // If user picked an existing saved address, send its id; otherwise send addressData to save it
      const payload = {
        giftPointsToRedeem: validGift,
        paymentMethod: 'card',
        guestEmail: !user ? address.email : undefined,
      };
      if (user && selectedAddressId && selectedAddressId !== '__new') {
        payload.addressId = selectedAddressId;
      } else {
        payload.addressData = address;
      }

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOrderData(data);
      setShowPayModal(true);
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Auth loading spinner ──
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  // ── NOT logged in → full-page login wall ──
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-500/15 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <div className="text-center">
            <h2 className="text-white font-bold text-xl mb-2">Login Required</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              You must be logged in to checkout and place an order. Please login or create an account to continue.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push('/login?redirect=/checkout')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
            >
              Login to Continue
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 border border-[#2a2a2a] hover:border-indigo-600 text-gray-300 hover:text-white text-sm rounded-xl transition"
            >
              New here? Create an account
            </button>
            <button
              onClick={() => router.push('/cart')}
              className="text-gray-600 hover:text-gray-400 text-xs transition"
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-3">🛒</p>
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">Browse Books</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        {/* Address form */}
        <div className="flex-1">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Delivery Address</h2>

            {/* Saved address picker */}
            {user && savedAddresses.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Saved Addresses</label>
                <select
                  value={selectedAddressId || ''}
                  onChange={e => handleSelectSaved(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2a2a2a] text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                >
                  {savedAddresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.first_name} {a.last_name} — {a.address_line}, {a.city}
                    </option>
                  ))}
                  <option value="__new">+ Enter a new address</option>
                </select>
              </div>
            )}

            {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              {[
                ['firstName', 'First Name *', 'text'],
                ['lastName', 'Last Name', 'text'],
                ['addressLine', 'Address *', 'text'],
                ['city', 'City *', 'text'],
                ['state', 'State', 'text'],
                ['pin', 'PIN Code *', 'text'],
                ['phone', 'Phone Number', 'tel'],
                ...(!user ? [['email', 'Email *', 'email']] : []),
              ].map(([name, label, type]) => (
                <div key={name} className={name === 'addressLine' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={address[name] || ''}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2a2a2a] text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 sticky top-20">
            <h2 className="text-lg font-semibold text-white mb-4">Grand Total</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-400">
                  <span className="truncate max-w-[150px]">{item.title} ×{item.quantity}</span>
                  <span>₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#2a2a2a] pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Price ({cartItems.length} items)</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Tax (12%)</span><span>₹{tax.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Delivery</span><span className={delivery === 0 ? 'text-green-400' : ''}>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
              {user && maxGift > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 text-xs">Gift Points ({maxGift} available)</span>
                  <input type="number" min="0" max={maxGift} value={giftPoints}
                    onChange={e => setGiftPoints(Math.max(0, Math.min(maxGift, parseInt(e.target.value) || 0)))}
                    className="w-20 px-2 py-1 rounded bg-[#111] border border-[#2a2a2a] text-xs text-white focus:outline-none" />
                </div>
              )}
              {validGift > 0 && (
                <div className="flex justify-between text-green-400 text-sm"><span>Gift Discount</span><span>-₹{validGift}</span></div>
              )}
            </div>
            <div className="border-t border-[#2a2a2a] mt-3 pt-3 flex justify-between text-white font-bold">
              <span>Total Amount</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition">
              {loading ? 'Processing…' : 'Pay Now →'}
            </button>
          </div>
        </div>
      </form>

      {showPayModal && orderData && (
        <MockPaymentModal
          orderId={orderData.orderId}
          total={orderData.amount}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
}
