import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Shield, Truck, CreditCard, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { API, resolveImage } from '../utils/image';

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setSimilar([]);
    setSelectedSize('');
    setQuantity(1);
    setAdded(false);

    (async () => {
      try {
        const p = await fetch(`${API}/api/products/${id}`).then(r => r.json());
        if (cancelled) return;
        setProduct(p);
        // Kick off similar fetch without blocking render
        fetch(`${API}/api/products?category=${p.category}`)
          .then(r => r.json())
          .then(all => {
            if (cancelled) return;
            setSimilar(all.filter(x => (x._id || x.id) !== id).slice(0, 4));
          })
          .catch(() => {});
      } catch {
        /* swallow — UI stays in loading state if the fetch never resolves */
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (!product) {
    return (
      <div className="page fade-in">
        <div className="product-detail">
          <div className="product-detail-image skeleton-box" />
          <div className="product-detail-info">
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-md" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
        </div>
      </div>
    );
  }

  const imgSrc = resolveImage(product.image, product.name, '600x750');
  const inStock = product.quantity > 0;

  const handleAdd = () => {
    const size = selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : 'One Size');
    if (!selectedSize && product.sizes?.length > 0) setSelectedSize(size);
    addToCart(product, size, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <Link to="/" className="breadcrumb">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/category/${product.category}`} className="breadcrumb">{product.category}</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail-image">
          <img src={imgSrc} alt={product.name} decoding="async" />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>

          {inStock ? (
            <p className="product-stock in-stock">{product.quantity} in stock</p>
          ) : (
            <p className="product-stock out-of-stock">Out of stock</p>
          )}

          {product.description && (
            <p className="product-detail-desc">{product.description}</p>
          )}

          {product.sizes?.length > 0 && (
            <div className="product-sizes">
              <label>Size</label>
              <div className="size-options">
                {product.sizes.map(s => (
                  <button key={s} type="button" className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-quantity">
            <label>Quantity</label>
            <div className="quantity-selector">
              <button type="button" aria-label="Decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase" onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}><Plus size={16} /></button>
            </div>
          </div>

          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={!inStock}
          >
            <ShoppingBag size={18} />
            {!inStock ? 'Sold Out' : added ? 'Added!' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
          </button>

          {product.material && (
            <div className="product-meta">
              <strong>Material:</strong> {product.material}
            </div>
          )}

          <div className="product-safety">
            <h4><Shield size={16} /> Safety & Quality</h4>
            <p>{product.safety || 'CE certified. Non-toxic materials. Tested for child safety standards.'}</p>
          </div>

          <div className="product-promises">
            <div><Truck size={16} /> Free delivery on orders above $50</div>
            <div><Truck size={16} /> Lebanon + Worldwide shipping</div>
            <div><CreditCard size={16} /> Cash on Delivery / Visa Card</div>
            <div><Shield size={16} /> OEKO-TEX certified</div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="similar-products">
          <h2 className="similar-title">You Might Also Like</h2>
          <div className="products-grid similar-grid">
            {similar.map(p => <ProductCard key={p._id || p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
