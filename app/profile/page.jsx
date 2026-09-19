'use client';
// app/profile/page.jsx
import { useAuth } from '@/components/forms/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Gift, ClipboardList, Heart, PenLine } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  if (loading || !user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-indigo-700 flex items-center justify-center text-xl font-bold text-white">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Gift points */}
        <div className="flex items-center gap-3 bg-[#111] border border-yellow-800/40 rounded-xl px-4 py-3">
          <Gift size={20} className="text-yellow-400" />
          <div>
            <p className="text-xs text-gray-500">Gift Points Balance</p>
            <p className="text-xl font-bold text-yellow-400">{user.giftPoints} pts</p>
            <p className="text-xs text-gray-600">1 point = ₹1 discount at checkout</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/orders" className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-indigo-700 rounded-xl p-4 transition">
          <ClipboardList size={20} className="text-indigo-400" />
          <div>
            <p className="text-sm font-semibold text-white">My Orders</p>
            <p className="text-xs text-gray-500">View order history</p>
          </div>
        </Link>
        <Link href="/wishlist" className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-pink-700 rounded-xl p-4 transition">
          <Heart size={20} className="text-pink-400" />
          <div>
            <p className="text-sm font-semibold text-white">My Wishlist</p>
            <p className="text-xs text-gray-500">Saved books</p>
          </div>
        </Link>
        <Link href="/writers" className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-purple-700 rounded-xl p-4 transition">
          <PenLine size={20} className="text-purple-400" />
          <div>
            <p className="text-sm font-semibold text-white">My Writers</p>
            <p className="text-xs text-gray-500">Followed authors</p>
          </div>
        </Link>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-xl text-sm font-medium transition"
      >
        Sign Out
      </button>
    </div>
  );
}
