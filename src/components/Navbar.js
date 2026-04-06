import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { count } = useCart();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="kids">Kids</span>
        <span className="moda">Moda</span>
      </Link>
      <ul className="navbar-links">
        <li><Link to="/category/shoes">Shoes</Link></li>
        <li><Link to="/category/girls">Girls</Link></li>
        <li><Link to="/category/boys">Boys</Link></li>
        <li><Link to="/category/babies">Babies</Link></li>
      </ul>
      <Link to="/cart" className="navbar-cart">
        <ShoppingBag size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Cart ({count})
      </Link>
    </nav>
  );
}
