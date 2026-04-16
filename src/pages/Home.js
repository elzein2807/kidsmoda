import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal, useRevealChildren } from '../utils/motion';
import HeroScene from '../components/HeroScene';

/* High-quality lifestyle photos for each category.
   Using Unsplash CDN with crop/resize params for optimal loading.
   Replace with your own product photography when ready — the gradient
   overlay keeps text readable on any image. */
const categories = [
  { name: 'Shoes',     slug: 'shoes',     image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=750&fit=crop&q=80' },
  { name: 'Girls',     slug: 'girls',     image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=750&fit=crop&q=80' },
  { name: 'Boys',      slug: 'boys',      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=750&fit=crop&q=80' },
  { name: 'Sets Girls', slug: 'sets-girls', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=750&fit=crop&q=80' },
  { name: 'Sets Boys', slug: 'sets-boys',  image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=750&fit=crop&q=80' },
  { name: 'Babies',    slug: 'babies',     image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=750&fit=crop&q=80' },
];

const marqueeItems = [
  'New Collection', 'Lebanon + Worldwide', 'Kids Fashion', 'Free Delivery $50+', 'Cash on Delivery', 'Visa Accepted',
  'New Collection', 'Lebanon + Worldwide', 'Kids Fashion', 'Free Delivery $50+', 'Cash on Delivery', 'Visa Accepted',
];

function mergeRefs(...refs) {
  return (node) => refs.forEach((r) => {
    if (typeof r === 'function') r(node);
    else if (r) r.current = node;
  });
}

export default function Home() {
  const [catRef, catVisible] = useReveal();
  const [infoRef, infoVisible] = useReveal();
  const gridRef = useRevealChildren('.category-card');

  return (
    <div className="fade-in">
      <section className="hero hero-with-blobs">
        <div className="hero-blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        {/* Subtle 3D floating shapes — hidden on mobile via width check */}
        <HeroScene />
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
              className="category-card reveal"
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
