import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API } from '../utils/image';

const ALL_PAYMENT_METHODS = [
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
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);

  // Ask the server which payment methods are live. If Stripe isn't
  // configured we hide the Visa option entirely so customers never hit a
  // dead-end "Pay with Card" button.
  useEffect(() => {
    fetch(`${API}/api/config`)
      .then(r => r.ok ? r.json() : {})
      .then(cfg => setStripeEnabled(!!cfg.stripeEnabled))
      .catch(() => {});
  }, []);

  const PAYMENT_METHODS = stripeEnabled ? ALL_PAYMENT_METHODS : ALL_PAYMENT_METHODS.filter(p => p.value !== 'visa');

  const shipping = total >= 50 ? 0 : 4;
  const grandTotal = total + shipping;

  const validateForm = () => {
    if (form.name.trim().length < 2) return 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 6) return 'Please enter a valid phone number';
    if (form.address.trim().length < 4) return 'Please enter a full address';
    if (form.city.trim().length < 2) return 'Please enter your city';
    if (form.country.trim().length < 2) return 'Please enter your country';
    return null;
  };

  // Handle Stripe success redirect
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    fetch(`${API}/api/checkout/session/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.status === 'paid') {
          clearCart();
          setSuccess(true);
        } else if (data.error) {
          setErrorMsg(data.error);
        }
      })
      .catch(() => setErrorMsg('Could not verify your payment. Please contact us.'));
    return () => { cancelled = true; };
  }, [sessionId, clearCart]);

  if (success || (sessionId && cart.length === 0)) {
    return (
      <div className="page fade-in">
        <div className="success-state">
          <h1>Order Placed!</h1>
          <p>Thank you for your order. We'll contact you on WhatsApp or by phone to confirm.</p>
          {orderId && <p style={{ color: '#666', fontSize: '0.9rem' }}>Order ID: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong></p>}
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>Questions? Call us at <strong>+961 81 898 170</strong></p>
          <Link to="/" className="btn-back">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page fade-in">
        <h1 className="page-title">Checkout</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-back">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // guard against double-submit
    setErrorMsg('');

    const vErr = validateForm();
    if (vErr) { setErrorMsg(vErr); return; }

    setSubmitting(true);
    try {
      if (form.payment === 'visa') {
        // Stripe Checkout — redirect to Stripe's hosted, PCI-compliant
        // payment page where the customer enters their real card details.
        const res = await fetch(`${API}/api/checkout/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: form, total: grandTotal }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not start card payment. Please try again or use Cash on Delivery.');
          setSubmitting(false);
          return;
        }
        if (data.url) {
          window.location.href = data.url;
          return; // leave submitting=true; we're navigating away
        }
        setErrorMsg('Payment unavailable. Please try Cash on Delivery.');
        setSubmitting(false);
      } else {
        // Cash on Delivery
        const res = await fetch(`${API}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: { ...form, payment: 'cod' }, total: grandTotal }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not place your order. Please try again.');
          setSubmitting(false);
          return;
        }
        setOrderId(data._id || data.id || '');
        clearCart();
        setSuccess(true);
        setSubmitting(false);
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
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

          {errorMsg && (
            <div className="checkout-error" role="alert" style={{
              background: '#fff2f2', color: '#b00020', border: '1px solid #ffd1d1',
              padding: '10px 14px', borderRadius: 10, marginTop: 14, fontSize: '0.92rem'
            }}>
              {errorMsg}
            </div>
          )}
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
