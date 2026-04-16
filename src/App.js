import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Lock } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import { API } from './utils/image';
import './App.css';

// Code split the heavier routes so the homepage stays light.
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));

function PageFallback() {
  return <div className="page"><div className="page-message">Loading…</div></div>;
}

function NotFound() {
  return (
    <div className="page fade-in">
      <h1 className="page-title">404 — Not Found</h1>
      <div className="empty-state">
        <p>That page doesn't exist.</p>
        <Link to="/" className="btn-back">Back to Home</Link>
      </div>
    </div>
  );
}

function AdminFloatingButton() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('kidsmoda_admin', data.token);
        navigate('/admin');
      } else {
        setError(true);
        setTimeout(() => setError(false), 1500);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-float">
      {open && (
        <form className="admin-float-popup" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={busy} className={error ? 'shake' : ''}>
            {busy ? '...' : error ? 'Wrong' : 'Go'}
          </button>
        </form>
      )}
      <button className="admin-float-btn" aria-label="Admin" onClick={() => setOpen(!open)} title="Admin">
        <Lock size={16} />
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/admin" element={
              <Suspense fallback={<PageFallback />}><Admin /></Suspense>
            } />
            <Route
              path="*"
              element={
                <>
                  <ScrollProgress />
                  <Navbar />
                  <Suspense fallback={<PageFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:slug" element={<Category />} />
                      <Route path="/product/:id" element={<Product />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/success" element={<Checkout />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Footer />
                  <AdminFloatingButton />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
