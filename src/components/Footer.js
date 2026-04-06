import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="kids">Kids</span>
            <span className="moda">Moda</span>
          </Link>
          <p>Curated kids fashion from Lebanon to the world. Bold colors, playful designs, quality you can trust.</p>
          <div className="footer-contact">
            <a href="tel:+96181898170"><Phone size={14} /> +961 81 898 170</a>
            <span><MapPin size={14} /> Lebanon — Worldwide Delivery</span>
          </div>
        </div>
        <div className="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><Link to="/category/shoes">Shoes</Link></li>
            <li><Link to="/category/girls">Girls</Link></li>
            <li><Link to="/category/boys">Boys</Link></li>
            <li><Link to="/category/sets-girls">Sets Girls</Link></li>
            <li><Link to="/category/sets-boys">Sets Boys</Link></li>
            <li><Link to="/category/babies">Babies</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Payment Methods</h5>
          <ul>
            <li>Cash on Delivery</li>
            <li>Visa / Bank Card</li>
          </ul>
          <h5 style={{ marginTop: 20 }}>Delivery</h5>
          <ul>
            <li>Free over $50</li>
            <li>All Lebanon + Worldwide</li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Safety & Quality</h5>
          <ul>
            <li>CE Certified Products</li>
            <li>Non-Toxic Materials</li>
            <li>OEKO-TEX Standard</li>
            <li>Child Safety Tested</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 KidsModa Lebanon. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://instagram.com/kidsladysmodaoutlet" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=100063686498498" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://tiktok.com/@kidsmodalebanon1" target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
