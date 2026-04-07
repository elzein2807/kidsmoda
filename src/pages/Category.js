import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const API = process.env.REACT_APP_API || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

const LABELS = {
  shoes: 'Shoes',
  girls: 'Girls',
  boys: 'Boys',
  'sets-girls': 'Sets Girls',
  'sets-boys': 'Sets Boys',
  babies: 'Babies',
};

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/products?category=${slug}`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="breadcrumb">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{LABELS[slug] || slug}</span>
      </div>
      <h1 className="page-title">{LABELS[slug] || slug}</h1>

      {loading ? (
        <p className="page-message">Loading...</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products in this category yet.</p>
          <Link to="/" className="btn-back">Back to Home</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
