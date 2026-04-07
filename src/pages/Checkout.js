import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API = process.env.REACT_APP_API || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'visa', label: 'Visa / Bank Card' },
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: 'Lebanon', payment: 'cod' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const shipping = total >= 50 ? 0 : 4;
  const grandTotal = total + shipping;

  // Handle Stripe success redirect
  useEffect(() => {
    if (sessionId) {
      fetch(`${API}/api/checkout/session/${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'paid') {
            clearCart();
            setSuccess(true);
          }
        })
        .catch(() => {});
    }
  }, [sessionId]);

  if (success || (sessionId && cart.length === 0)) {
    return (
      <div className="page">
        <div className="success-state">
          <h1>Order Placed!</h1>
          <p>Thank you for your order. We'll contact you on WhatsApp or by phone to confirm.</p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>Questions? Call us at <strong>+961 81 898 170</strong></p>
          <Link to="/" className="btn-back">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Checkout</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-back">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (form.payment === 'visa') {
        // Stripe Checkout
        const res = await fetch(`${API}/api/checkout/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: form, total: grandTotal }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } else {
        // Cash on Delivery
        await fetch(`${API}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: form, total: grandTotal }),
        });
        clearCart();
        setSuccess(true);
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Shipping Details</h3>
          <input name="name" placeholder="Full Name" required value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone / WhatsApp" required value={form.phone} onChange={handleChange} />
          <input name="address" placeholder="Full Address" required value={form.address} onChange={handleChange} />
          <div className="form-row">
            <input name="city" placeholder="City" required value={form.city} onChange={handleChange} />
            <input name="country" placeholder="Country" required value={form.country} onChange={handleChange} />
          </div>

          <h3 style={{ marginTop: 24 }}>Payment Method</h3>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                className={`payment-option ${form.payment === pm.value ? 'active' : ''}`}
              >
                <input type="radio" name="payment" value={pm.value} checked={form.payment === pm.value} onChange={handleChange} />
                <span className="payment-radio" />
                {pm.label}
              </label>
            ))}
          </div>

          <button type="submit" className="checkout-submit" disabled={submitting}>
            {submitting
              ? 'Processing...'
              : form.payment === 'visa'
                ? `Pay with Card — $${grandTotal.toFixed(2)}`
                : `Place Order — $${grandTotal.toFixed(2)}`
            }
          </button>
        </form>
        <div className="checkout-summary">
          <h3>Your Order</h3>
          {cart.map((item) => (
            <div className="checkout-item" key={item.key}>
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-item">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          {shipping > 0 && (
            <p className="checkout-shipping-note">Free delivery on orders above $50</p>
          )}
          <div className="checkout-total">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
