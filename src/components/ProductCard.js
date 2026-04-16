import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { resolveImage } from '../utils/image';

// Inline tilt — avoids a hook call per-card.  The .tilt-card CSS
// class transforms with --tilt-rx / --tilt-ry custom props.
function attachTilt(el) {
  if (!el) return;
  // Skip touch devices
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const strength = 5;
  el._onMove = (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tilt-rx', `${(0.5 - y) * strength}deg`);
    el.style.setProperty('--tilt-ry', `${(x - 0.5) * strength}deg`);
  };
  el._onLeave = () => {
    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
  };
  el.addEventListener('mousemove', el._onMove);
  el.addEventListener('mouseleave', el._onLeave);
}

export default function ProductCard({ product }) {
  const imgSrc = resolveImage(product.thumbnail || product.image, product.name, '480x600');
  const soldOut = product.quantity === 0;
  const attached = useRef(false);

  const cardRef = useCallback((node) => {
    if (node && !attached.current) {
      attached.current = true;
      attachTilt(node);
    }
  }, []);

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="product-card reveal tilt-card"
      ref={cardRef}
    >
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
