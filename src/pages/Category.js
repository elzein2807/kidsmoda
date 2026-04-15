import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { API } from '../utils/image';

const LABELS = {
  shoes: 'Shoes',
  girls: 'Girls',
  boys: 'Boys',
  'sets-girls': 'Sets Girls',
  'sets-boys': 'Sets Boys',
  babies: 'Babies',
};

function ProductSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="product-image-wrap skeleton-box" style={{ aspectRatio: '4/5' }} />
      <div className="product-info">
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-short" />
      </div>
    </div>
  );
}

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API}/api/products?category=${slug}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setProducts(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <Link to="/" className="breadcrumb">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{LABELS[slug] || slug}</span>
      </div>
      <h1 className="page-title">{LABELS[slug] || slug}</h1>

      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products in this category yet.</p>
          <Link to="/" className="btn-back">Back to Home</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
