import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kidsmoda_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kidsmoda_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, quantity = 1) => {
    setCart((prev) => {
      const key = `${product.id}_${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { key, productId: product.id, name: product.name, price: product.price, image: product.image, size, quantity }];
    });
  };

  const removeFromCart = (key) => setCart((prev) => prev.filter((item) => item.key !== key));
  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeFromCart(key);
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, quantity } : item)));
  };
  const clearCart = () => setCart([]);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
