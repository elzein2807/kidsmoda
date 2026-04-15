import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API = process.env.REACT_APP_API || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

function resolveImg(src, name) {
  if (!src) return `https://placehold.co/120x150/eee/999?text=${encodeURIComponent(name || 'Item')}&font=montserrat`;
  // Absolute (http/https) or data URI → use as-is
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  // Legacy relative /uploads path → prefix API base
  return `${API}${src}`;
}

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="page fade-in">
        <h1 className="page-title">Your Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-back">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const shipping = total >= 50 ? 0 : 4;
  const grandTotal = total + shipping;

  return (
    <div className="page fade-in">
      <h1 className="page-title">Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.key}>
              <img src={resolveImg(item.image, item.name)} alt={item.name} className="cart-item-image" loading="lazy" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-size">Size: {item.size}</p>
                <p className="cart-item-price">${item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-qty">
                <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button aria-label="Increase quantity" onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
              </div>
              <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
              <button className="cart-item-remove" aria-label="Remove" onClick={() => removeFromCart(item.key)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          {shipping > 0 && (
            <p className="checkout-shipping-note">Add ${(50 - total).toFixed(2)} more for free delivery</p>
          )}
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
