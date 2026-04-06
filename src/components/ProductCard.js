import React from 'react';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API || 'http://localhost:5000';

export default function ProductCard({ product }) {
  const isCloudinary = product.image && product.image.startsWith('http');
  const imgSrc = product.image
    ? (isCloudinary ? product.image : `${API}${product.image}`)
    : `https://placehold.co/480x600/eee/999?text=${encodeURIComponent(product.name)}&font=montserrat`;

  return (
    <Link to={`/product/${product._id || product.id}`} className="product-card">
      <div className="product-image-wrap">
        <img src={imgSrc} alt={product.name} className="product-image" />
        {product.quantity === 0 && <span className="product-badge out">Sold Out</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-info-row">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {product.quantity > 0 && <span className="product-qty-label">{product.quantity} in stock</span>}
        </div>
      </div>
    </Link>
  );
}
