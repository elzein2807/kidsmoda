import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImage } from '../utils/image';

export default function ProductCard({ product }) {
  // Prefer the lightweight thumbnail on listings; fall back to the full image.
  const imgSrc = resolveImage(product.thumbnail || product.image, product.name, '480x600');
  const soldOut = product.quantity === 0;

  return (
    <Link to={`/product/${product._id || product.id}`} className="product-card">
      <div className="product-image-wrap">
        <img src={imgSrc} alt={product.name} className="product-image" loading="lazy" decoding="async" />
        {soldOut && <span className="product-badge out">Sold Out</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-info-row">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {!soldOut && <span className="product-qty-label">{product.quantity} in stock</span>}
        </div>
      </div>
    </Link>
  );
}
