import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const LINKS = [
  { to: '/category/shoes', label: 'Shoes' },
  { to: '/category/girls', label: 'Girls' },
  { to: '/category/boys', label: 'Boys' },
  { to: '/category/sets-girls', label: 'Sets Girls' },
  { to: '/category/sets-boys', label: 'Sets Boys' },
  { to: '/category/babies', label: 'Babies' },
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const { pathname } = useLocation();
  const prevCount = useRef(count);

  // Auto-close the drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Subtle shadow once the user scrolls past the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bounce the cart pill whenever an item is added
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <button
          className="navbar-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" className="navbar-logo">
          <span className="kids">Kids</span>
          <span className="moda">Moda</span>
        </Link>
        <ul className="navbar-links">
          {LINKS.slice(0, 4).map(l => (
            <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
          ))}
        </ul>
        <Link to="/cart" className={`navbar-cart ${bump ? 'bump' : ''}`}>
          <ShoppingBag size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Cart ({count})
        </Link>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Shop</span>
            <button className="mobile-drawer-close" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <ul className="mobile-drawer-links">
            {LINKS.map(l => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
            <li className="mobile-drawer-sep" />
            <li><Link to="/cart">Cart ({count})</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}
