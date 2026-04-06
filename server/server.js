const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ahmadangelina2824';

app.use(cors());
app.use(express.json());

// ============================================================
// DATA LAYER — MongoDB in production, JSON files locally
// ============================================================
let db = null;
let Product, Order;

async function initDB() {
  if (db) return;

  if (process.env.MONGODB_URI) {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const ProductSchema = new mongoose.Schema({
      name: String, description: { type: String, default: '' }, price: Number,
      category: String, sizes: [String], quantity: { type: Number, default: 0 },
      safety: { type: String, default: 'CE certified. Non-toxic materials. Tested for child safety.' },
      material: { type: String, default: '' }, image: { type: String, default: '' },
      inStock: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now },
    });
    const OrderSchema = new mongoose.Schema({
      items: [{ productId: String, name: String, price: Number, image: String, size: String, quantity: Number }],
      customer: { name: String, email: String, phone: String, address: String, city: String, country: String, payment: String },
      total: Number, status: { type: String, default: 'pending' }, stripeSessionId: String,
      createdAt: { type: Date, default: Date.now },
    });

    Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    db = 'mongo';
  } else {
    // JSON file fallback
    const DATA_DIR = path.join(__dirname, 'data');
    const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); } catch { return []; } };
    const writeJSON = (f, d) => fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(d, null, 2));

    Product = {
      find: (filter) => { let items = readJSON('products.json'); if (filter && filter.category) items = items.filter(p => p.category === filter.category); return Promise.resolve(items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); },
      findById: (id) => { const items = readJSON('products.json'); return Promise.resolve(items.find(p => p.id === id) || null); },
      create: (data) => { const items = readJSON('products.json'); const item = { id: uuidv4(), _id: uuidv4(), ...data, createdAt: new Date().toISOString() }; item._id = item.id; items.push(item); writeJSON('products.json', items); return Promise.resolve(item); },
      findByIdAndUpdate: (id, update, opts) => { const items = readJSON('products.json'); const idx = items.findIndex(p => p.id === id); if (idx === -1) return Promise.resolve(null); items[idx] = { ...items[idx], ...update }; writeJSON('products.json', items); return Promise.resolve(items[idx]); },
      findByIdAndDelete: (id) => { let items = readJSON('products.json'); items = items.filter(p => p.id !== id); writeJSON('products.json', items); return Promise.resolve(); },
    };
    Order = {
      find: () => { return Promise.resolve(readJSON('orders.json').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); },
      findOne: (filter) => { const items = readJSON('orders.json'); return Promise.resolve(items.find(o => o.stripeSessionId === filter.stripeSessionId) || null); },
      create: (data) => { const items = readJSON('orders.json'); const item = { id: uuidv4(), _id: uuidv4(), ...data, status: data.status || 'pending', createdAt: new Date().toISOString() }; item._id = item.id; items.push(item); writeJSON('orders.json', items); return Promise.resolve(item); },
      findByIdAndUpdate: (id, update, opts) => { const items = readJSON('orders.json'); const idx = items.findIndex(o => o.id === id); if (idx === -1) return Promise.resolve(null); items[idx] = { ...items[idx], ...update }; writeJSON('orders.json', items); return Promise.resolve(items[idx]); },
    };
    db = 'json';
    console.log('Using JSON file storage (no MONGODB_URI)');
  }
}

// ============================================================
// IMAGE UPLOAD — Cloudinary in production, local files locally
// ============================================================
let uploadHandler;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  uploadHandler = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return '';
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'kidsmoda', transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }] },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      stream.end(req.file.buffer);
    });
  }
  app._uploadImage = uploadImage;
} else {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  });
  uploadHandler = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return '';
    return `/uploads/${req.file.filename}`;
  }
  app._uploadImage = uploadImage;
}

const upload = uploadHandler;

// ============================================================
// AUTH
// ============================================================
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === `Bearer ${ADMIN_PASSWORD}`) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// DB init middleware
app.use(async (req, res, next) => {
  try { await initDB(); } catch (e) { console.error('DB init error:', e.message); }
  next();
});

// ============================================================
// ROUTES
// ============================================================

// Admin login
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ success: true, token: ADMIN_PASSWORD });
  res.status(401).json({ error: 'Wrong password' });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await app._uploadImage(req);
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      category: req.body.category,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      quantity: parseInt(req.body.quantity) || 0,
      safety: req.body.safety || 'CE certified. Non-toxic materials. Tested for child safety.',
      material: req.body.material || '',
      image: imageUrl,
      inStock: true,
    });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.price) update.price = parseFloat(req.body.price);
    if (req.body.category) update.category = req.body.category;
    if (req.body.sizes !== undefined) update.sizes = req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
    if (req.body.quantity !== undefined) update.quantity = parseInt(req.body.quantity) || 0;
    if (req.body.safety !== undefined) update.safety = req.body.safety;
    if (req.body.material !== undefined) update.material = req.body.material;
    if (req.body.inStock !== undefined) update.inStock = req.body.inStock === 'true';

    const imageUrl = await app._uploadImage(req);
    if (imageUrl) update.image = imageUrl;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Orders
app.get('/api/orders', requireAdmin, async (req, res) => {
  try { res.json(await Order.find()); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create({ items: req.body.items, customer: req.body.customer, total: req.body.total });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stripe Checkout (only if configured)
app.post('/api/checkout/create-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(400).json({ error: 'Stripe not configured' });
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { items, customer, total } = req.body;
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customer.email,
      line_items: items.map(item => ({
        price_data: { currency: 'usd', product_data: { name: `${item.name} (${item.size})` }, unit_amount: Math.round(item.price * 100) },
        quantity: item.quantity,
      })),
      metadata: { orderData: JSON.stringify({ items, customer, total }) },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });
    res.json({ url: session.url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkout/session/:id', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(400).json({ error: 'Stripe not configured' });
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    if (session.payment_status === 'paid') {
      const orderData = JSON.parse(session.metadata.orderData);
      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (!existing) {
        await Order.create({ ...orderData, customer: { ...orderData.customer, payment: 'visa' }, status: 'confirmed', stripeSessionId: session.id });
      }
      return res.json({ status: 'paid' });
    }
    res.json({ status: session.payment_status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Start server (local dev)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
