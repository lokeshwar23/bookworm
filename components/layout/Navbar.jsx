'use client';
// components/layout/Navbar.jsx

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/forms/AuthProvider';
import { useCart } from '@/components/forms/CartProvider';
import { ShoppingCart, User, LogOut, BookOpen, PenLine } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  function guardedNav(path) {
    if (!user) { router.push('/login'); return; }
    router.push(path);
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#111] border-b border-[#2a2a2a] px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-indigo-400 font-bold text-lg tracking-tight">
          <BookOpen size={22} />
          <span>Book Worm</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <button
            onClick={() => guardedNav('/orders')}
            className={`hover:text-white transition ${pathname.startsWith('/orders') ? 'text-white' : ''}`}
          >
            My Orders
          </button>
          <button
            onClick={() => guardedNav('/wishlist')}
            className={`hover:text-white transition ${pathname === '/wishlist' ? 'text-white' : ''}`}
          >
            My Wishlist
          </button>
          <button
            onClick={() => guardedNav('/writers')}
            className={`hover:text-white transition flex items-center gap-1 ${pathname === '/writers' ? 'text-white' : ''}`}
          >
            <PenLine size={14} />
            My Writers
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-gray-400 hover:text-white transition">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition px-2 py-1 rounded-lg hover:bg-[#2a2a2a]">
                <User size={16} />
                <span className="hidden md:inline max-w-[100px] truncate">{user.fullName?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-400 transition"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
