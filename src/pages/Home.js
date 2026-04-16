import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal, useMagnetic, useRevealChildren } from '../utils/motion';

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

// Merge refs utility — lets us attach multiple refs to one DOM element
// (e.g. magnetic AND reveal on the same button)
function mergeRefs(...refs) {
  return (node) => refs.forEach((r) => {
    if (typeof r === 'function') r(node);
    else if (r) r.current = node;
  });
}

export default function Home() {
  const magneticRef = useMagnetic(0.3);
  const [catRef, catVisible] = useReveal();
  const [infoRef, infoVisible] = useReveal();
  const gridRef = useRevealChildren('.category-card');

  return (
    <div className="fade-in">
      {/* Animated gradient blobs behind hero */}
      <section className="hero hero-with-blobs">
        <div className="hero-blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="hero-badge">New Collection 2026</div>
        <h1>
          <span className="hero-text-line">Style For</span><br />
          <span className="line2 hero-text-line">Little</span><br />
          <span className="line3 hero-text-line">Icons</span>
        </h1>
        <p className="hero-sub">
          Curated kids fashion with bold colors and playful designs.
          Quality pieces for every little personality.
        </p>
        <Link to="/category/girls" className="hero-btn magnetic" ref={magneticRef}>
          <span className="btn-shine" />
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

      <section
        className={`categories reveal-section ${catVisible ? 'in-view' : ''}`}
        id="categories"
        ref={mergeRefs(catRef, gridRef)}
      >
        <div className="categories-header">
          <div className="categories-label">Shop By Category</div>
          <h2 className="categories-title">Browse Our Collection</h2>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link
              to={`/category/${cat.slug}`}
              className="category-card reveal tilt-card"
              data-color={cat.color}
              key={i}
            >
              <div className="category-image-wrap">
                <img className="category-image" src={cat.image} alt={cat.name} loading="lazy" decoding="async" />
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

      <section
        className={`info-banner reveal-section ${infoVisible ? 'in-view' : ''}`}
        ref={infoRef}
      >
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
    </div>
  );
}
