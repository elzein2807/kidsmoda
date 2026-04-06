import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Lock } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import './App.css';

const API = process.env.REACT_APP_API || 'http://localhost:5000';

function AdminFloatingButton() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <button type="submit" className={error ? 'shake' : ''}>
            {error ? 'Wrong' : 'Go'}
          </button>
        </form>
      )}
      <button className="admin-float-btn" onClick={() => setOpen(!open)} title="Admin">
        <Lock size={16} />
      </button>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<Checkout />} />
                </Routes>
                <Footer />
                <AdminFloatingButton />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
