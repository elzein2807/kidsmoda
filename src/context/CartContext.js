import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kidsmoda_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kidsmoda_cart', JSON.stringify(cart));
    } catch {
      /* localStorage full — ignore */
    }
  }, [cart]);

  const addToCart = useCallback((product, size, quantity = 1) => {
    setCart((prev) => {
      const key = `${product._id || product.id}_${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      // Intentionally omit the full `image` from cart storage — it can be
      // several hundred KB of base64 and would blow out localStorage quickly.
      // The cart row renders a tiny placeholder; the name is enough context.
      return [...prev, {
        key,
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.thumbnail || '',
        size,
        quantity,
      }];
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, quantity } : item)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count };
  }, [cart, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
