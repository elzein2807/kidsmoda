import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Your Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-back">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => {
            const isCloud = item.image && item.image.startsWith('http');
            const imgSrc = item.image
              ? (isCloud ? item.image : `http://localhost:5000${item.image}`)
              : 'https://placehold.co/120x150/eee/999?text=IMG&font=montserrat';
            return (
              <div className="cart-item" key={item.key}>
                <img src={imgSrc} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-size">Size: {item.size}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                </div>
                <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.key)}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className="free">Free</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
