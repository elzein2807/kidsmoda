import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Edit3, Package, ShoppingCart, Phone, Mail, MapPin, User } from 'lucide-react';

const API = process.env.REACT_APP_API || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

const CATEGORIES = [
  { value: 'shoes', label: 'Shoes' },
  { value: 'girls', label: 'Girls' },
  { value: 'boys', label: 'Boys' },
  { value: 'sets-girls', label: 'Sets Girls' },
  { value: 'sets-boys', label: 'Sets Boys' },
  { value: 'babies', label: 'Babies' },
];

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered'];

function pid(item) { return item._id || item.id; }

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('kidsmoda_admin') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'shoes', sizes: '', quantity: '', safety: '', material: '', image: null });

  const headers = { Authorization: `Bearer ${token}` };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('kidsmoda_admin', data.token);
        setLoginError('');
      } else {
        setLoginError('Wrong password');
      }
    } catch {
      setLoginError('Connection error');
    }
  };

  const logout = () => { setToken(''); localStorage.removeItem('kidsmoda_admin'); };

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/products`).then(r => r.json()).then(setProducts).catch(() => {});
    fetch(`${API}/api/orders`, { headers }).then(r => r.json()).then(setOrders).catch(() => {});
  }, [token]);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'shoes', sizes: '', quantity: '', safety: '', material: '', image: null });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, sizes: p.sizes.join(', '), quantity: String(p.quantity || 0),
      safety: p.safety, material: p.material || '', image: null,
    });
    setEditId(pid(p));
    setShowForm(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('sizes', form.sizes);
    fd.append('quantity', form.quantity);
    fd.append('safety', form.safety);
    fd.append('material', form.material);
    if (form.image) fd.append('image', form.image);

    const url = editId ? `${API}/api/products/${editId}` : `${API}/api/products`;
    const method = editId ? 'PUT' : 'POST';

    try {
      await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const updated = await fetch(`${API}/api/products`).then(r => r.json());
      setProducts(updated);
      resetForm();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers });
    setProducts(products.filter(p => pid(p) !== id));
  };

  const handleStatusChange = async (orderId, status) => {
    await fetch(`${API}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders(orders.map(o => (pid(o) === orderId ? { ...o, status } : o)));
  };

  if (!token) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h1>Admin Panel</h1>
          <p>Enter password to continue</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {loginError && <div className="admin-error">{loginError}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>KidsModa Admin</h1>
        <button className="admin-logout" onClick={logout}><LogOut size={16} /> Logout</button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          <Package size={16} /> Products ({products.length})
        </button>
        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <ShoppingCart size={16} /> Orders ({orders.length})
        </button>
      </div>

      {tab === 'products' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Products</h2>
            <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          {showForm && (
            <form className="admin-product-form" onSubmit={handleSubmitProduct}>
              <h3>{editId ? 'Edit Product' : 'New Product'}</h3>
              <div className="admin-form-grid">
                <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Price ($)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input placeholder="Quantity in stock" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <input placeholder="Sizes (e.g. 2Y, 3Y, 4Y)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
                <input placeholder="Material (e.g. 100% Organic Cotton)" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} style={{ marginBottom: 12 }} />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <textarea placeholder="Safety info (e.g. CE certified, non-toxic...)" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} />
              <div className="admin-form-actions">
                <button type="submit" className="admin-save-btn">{editId ? 'Update' : 'Add Product'}</button>
                <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-table">
            <div className="admin-table-header">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Actions</span>
            </div>
            {products.map(p => (
              <div className="admin-table-row" key={pid(p)}>
                <span>
                  <img src={p.image || 'https://placehold.co/60x60/eee/999?text=No+Img'} alt="" className="admin-thumb" />
                </span>
                <span className="admin-product-name">{p.name}</span>
                <span className="admin-product-cat">{p.category}</span>
                <span>${p.price.toFixed(2)}</span>
                <span>{p.quantity || 0}</span>
                <span className="admin-actions">
                  <button onClick={() => handleEdit(p)}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(pid(p))}><Trash2 size={14} /></button>
                </span>
              </div>
            ))}
            {products.length === 0 && <p className="admin-empty">No products yet. Click "Add Product" to get started.</p>}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-section">
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <p className="admin-empty">No orders yet.</p>
          ) : (
            orders.map(order => (
              <div className="admin-order" key={pid(order)}>
                <div className="admin-order-header">
                  <div>
                    <strong>Order #{pid(order).slice(0, 8)}</strong>
                    <span className="admin-order-date">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</span>
                    {order.customer?.payment && <span className="admin-order-payment">{order.customer.payment === 'cod' ? 'CASH ON DELIVERY' : 'VISA CARD'}</span>}
                  </div>
                  <div className="admin-order-status">
                    <select value={order.status} onChange={(e) => handleStatusChange(pid(order), e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-order-customer">
                  <div className="admin-customer-row"><User size={14} /> <strong>{order.customer?.name}</strong></div>
                  <div className="admin-customer-row"><Phone size={14} /> <a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a></div>
                  <div className="admin-customer-row"><Mail size={14} /> <a href={`mailto:${order.customer?.email}`}>{order.customer?.email}</a></div>
                  <div className="admin-customer-row"><MapPin size={14} /> {order.customer?.address}, {order.customer?.city}, {order.customer?.country}</div>
                </div>
                <div className="admin-order-items">
                  {order.items?.map((item, i) => (
                    <div key={i} className="admin-order-item">
                      <span>{item.name} (Size: {item.size})</span>
                      <span>x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-order-total">Total: ${order.total?.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
