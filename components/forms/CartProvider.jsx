'use client';
// components/forms/CartProvider.jsx
// Client-side cart state — synced with /api/cart, exposes itemCount for the navbar badge.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [itemCount, setItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) return;
      const items = await res.json();
      setCartItems(items);
      setItemCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (bookId, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, quantity }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to add to cart');
    }
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    await fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ itemCount, cartItems, fetchCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
