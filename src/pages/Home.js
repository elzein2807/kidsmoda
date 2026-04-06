import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Shoes', slug: 'shoes', color: 'pink', image: 'https://placehold.co/480x600/FF3ECB/ffffff?text=SHOES&font=montserrat' },
  { name: 'Girls', slug: 'girls', color: 'purple', image: 'https://placehold.co/480x600/A855F7/ffffff?text=GIRLS&font=montserrat' },
  { name: 'Boys', slug: 'boys', color: 'blue', image: 'https://placehold.co/480x600/3B82F6/ffffff?text=BOYS&font=montserrat' },
  { name: 'Sets Girls', slug: 'sets-girls', color: 'coral', image: 'https://placehold.co/480x600/FF6B6B/ffffff?text=SETS+GIRLS&font=montserrat' },
  { name: 'Sets Boys', slug: 'sets-boys', color: 'green', image: 'https://placehold.co/480x600/22D366/ffffff?text=SETS+BOYS&font=montserrat' },
  { name: 'Babies', slug: 'babies', color: 'orange', image: 'https://placehold.co/480x600/FF6B2C/ffffff?text=BABIES&font=montserrat' },
];

const marqueeItems = [
  'New Collection', 'Lebanon + Worldwide', 'Kids Fashion', 'Free Delivery $50+', 'Cash on Delivery', 'Visa Accepted',
  'New Collection', 'Lebanon + Worldwide', 'Kids Fashion', 'Free Delivery $50+', 'Cash on Delivery', 'Visa Accepted',
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">New Collection 2026</div>
        <h1>
          Style For<br />
          <span className="line2">Little</span><br />
          <span className="line3">Icons</span>
        </h1>
        <p className="hero-sub">
          Curated kids fashion with bold colors and playful designs.
          Quality pieces for every little personality.
        </p>
        <Link to="/category/girls" className="hero-btn">
          Shop Now <ArrowRight size={18} />
        </Link>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span className="marquee-item" key={i}>
              <span className="marquee-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="categories" id="categories">
        <div className="categories-header">
          <div className="categories-label">Shop By Category</div>
          <h2 className="categories-title">Browse Our Collection</h2>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link to={`/category/${cat.slug}`} className="category-card" data-color={cat.color} key={i}>
              <div className="category-image-wrap">
                <img className="category-image" src={cat.image} alt={cat.name} />
              </div>
              <div className="category-bottom">
                <span className="category-name">{cat.name}</span>
                <span className="category-arrow">
                  <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="info-banner">
        <div className="info-grid">
          <div className="info-item">
            <h4>Free Delivery $50+</h4>
            <p>Lebanon + Worldwide shipping</p>
          </div>
          <div className="info-item">
            <h4>Safe Materials</h4>
            <p>CE certified, non-toxic</p>
          </div>
          <div className="info-item">
            <h4>Multiple Payments</h4>
            <p>Cash on Delivery + Visa</p>
          </div>
          <div className="info-item">
            <h4>Secure Checkout</h4>
            <p>100% safe & trusted</p>
          </div>
        </div>
      </section>
    </>
  );
}
