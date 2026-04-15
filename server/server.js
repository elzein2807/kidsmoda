const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ahmadangelina2824';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================================
// DATA LAYER — Neon Postgres in production, JSON files locally
// ============================================================
let db = null;
let Product, Order;

async function initDB() {
  if (db) return;

  if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);

    // Create tables
    await sql`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price NUMERIC NOT NULL,
      category TEXT NOT NULL,
      sizes TEXT[] DEFAULT '{}',
      quantity INTEGER DEFAULT 0,
      safety TEXT DEFAULT 'CE certified. Non-toxic materials. Tested for child safety.',
      material TEXT DEFAULT '',
      image TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
    // Migrate existing schemas that predate the thumbnail column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT ''`;
    await sql`CREATE INDEX IF NOT EXISTS products_category_idx ON products (category)`;
    await sql`CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC)`;

    await sql`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB NOT NULL,
      customer JSONB NOT NULL,
      total NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    Product = {
      // List queries return ONLY the thumbnail (not the full image) so we
      // stay well under Neon's 64MB serverless response cap as inventory grows.
      find: async (filter) => {
        let rows;
        if (filter && filter.category) {
          rows = await sql`SELECT id, name, description, price, category, sizes, quantity, safety, material, thumbnail, in_stock, created_at
            FROM products WHERE category = ${filter.category} ORDER BY created_at DESC`;
        } else {
          rows = await sql`SELECT id, name, description, price, category, sizes, quantity, safety, material, thumbnail, in_stock, created_at
            FROM products ORDER BY created_at DESC`;
        }
        return rows.map(r => ({
          _id: r.id, id: r.id, name: r.name, description: r.description,
          price: parseFloat(r.price), category: r.category, sizes: r.sizes || [],
          quantity: r.quantity, safety: r.safety, material: r.material,
          // Frontend reads `thumbnail` when present, falling back to `image`.
          // Populate both with the same compact value so old clients still work.
          thumbnail: r.thumbnail || '', image: r.thumbnail || '',
          inStock: r.in_stock, createdAt: r.created_at,
        }));
      },
      // Detail query returns the full image for the product page.
      findById: async (id) => {
        const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          _id: r.id, id: r.id, name: r.name, description: r.description,
          price: parseFloat(r.price), category: r.category, sizes: r.sizes || [],
          quantity: r.quantity, safety: r.safety, material: r.material,
          image: r.image, thumbnail: r.thumbnail || '',
          inStock: r.in_stock, createdAt: r.created_at,
        };
      },
      create: async (data) => {
        const id = uuidv4();
        await sql`INSERT INTO products (id, name, description, price, category, sizes, quantity, safety, material, image, thumbnail, in_stock)
          VALUES (${id}, ${data.name}, ${data.description || ''}, ${data.price}, ${data.category},
          ${data.sizes || []}, ${data.quantity || 0}, ${data.safety || 'CE certified. Non-toxic materials.'},
          ${data.material || ''}, ${data.image || ''}, ${data.thumbnail || ''}, ${data.inStock !== false})`;
        return { _id: id, id, ...data, createdAt: new Date().toISOString() };
      },
      findByIdAndUpdate: async (id, update) => {
        const current = await Product.findById(id);
        if (!current) return null;
        const merged = { ...current, ...update };
        await sql`UPDATE products SET
          name = ${merged.name}, description = ${merged.description || ''}, price = ${merged.price},
          category = ${merged.category}, sizes = ${merged.sizes || []}, quantity = ${merged.quantity || 0},
          safety = ${merged.safety || ''}, material = ${merged.material || ''},
          image = ${merged.image || current.image || ''},
          thumbnail = ${merged.thumbnail || current.thumbnail || ''},
          in_stock = ${merged.inStock !== false}
          WHERE id = ${id}`;
        return { ...merged, _id: id, id };
      },
      findByIdAndDelete: async (id) => {
        await sql`DELETE FROM products WHERE id = ${id}`;
      },
    };

    Order = {
      find: async () => {
        const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
        return rows.map(r => ({
          _id: r.id, id: r.id, items: r.items, customer: r.customer,
          total: parseFloat(r.total), status: r.status, stripeSessionId: r.stripe_session_id,
          createdAt: r.created_at,
        }));
      },
      findOne: async (filter) => {
        const rows = await sql`SELECT * FROM orders WHERE stripe_session_id = ${filter.stripeSessionId}`;
        if (rows.length === 0) return null;
        const r = rows[0];
        return { _id: r.id, id: r.id, items: r.items, customer: r.customer, total: parseFloat(r.total), status: r.status, createdAt: r.created_at };
      },
      create: async (data) => {
        const id = uuidv4();
        await sql`INSERT INTO orders (id, items, customer, total, status, stripe_session_id)
          VALUES (${id}, ${JSON.stringify(data.items)}, ${JSON.stringify(data.customer)}, ${data.total}, ${data.status || 'pending'}, ${data.stripeSessionId || null})`;
        return { _id: id, id, ...data, status: data.status || 'pending', createdAt: new Date().toISOString() };
      },
      findByIdAndUpdate: async (id, update) => {
        if (update.status) {
          await sql`UPDATE orders SET status = ${update.status} WHERE id = ${id}`;
        }
        const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
        if (rows.length === 0) return null;
        const r = rows[0];
        return { _id: r.id, id: r.id, items: r.items, customer: r.customer, total: parseFloat(r.total), status: r.status, createdAt: r.created_at };
      },
    };

    db = 'postgres';
    console.log('Neon Postgres connected');
  } else {
    // JSON file fallback for local dev
    const DATA_DIR = path.join(__dirname, 'data');
    const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); } catch { return []; } };
    const writeJSON = (f, d) => fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(d, null, 2));

    Product = {
      find: (filter) => { let items = readJSON('products.json'); if (filter && filter.category) items = items.filter(p => p.category === filter.category); return Promise.resolve(items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); },
      findById: (id) => { const items = readJSON('products.json'); return Promise.resolve(items.find(p => p.id === id) || null); },
      create: (data) => { const items = readJSON('products.json'); const item = { id: uuidv4(), _id: uuidv4(), ...data, createdAt: new Date().toISOString() }; item._id = item.id; items.push(item); writeJSON('products.json', items); return Promise.resolve(item); },
      findByIdAndUpdate: (id, update) => { const items = readJSON('products.json'); const idx = items.findIndex(p => p.id === id); if (idx === -1) return Promise.resolve(null); items[idx] = { ...items[idx], ...update }; writeJSON('products.json', items); return Promise.resolve(items[idx]); },
      findByIdAndDelete: (id) => { let items = readJSON('products.json'); items = items.filter(p => p.id !== id); writeJSON('products.json', items); return Promise.resolve(); },
    };
    Order = {
      find: () => { return Promise.resolve(readJSON('orders.json').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); },
      findOne: (filter) => { const items = readJSON('orders.json'); return Promise.resolve(items.find(o => o.stripeSessionId === filter.stripeSessionId) || null); },
      create: (data) => { const items = readJSON('orders.json'); const item = { id: uuidv4(), _id: uuidv4(), ...data, status: data.status || 'pending', createdAt: new Date().toISOString() }; item._id = item.id; items.push(item); writeJSON('orders.json', items); return Promise.resolve(item); },
      findByIdAndUpdate: (id, update) => { const items = readJSON('orders.json'); const idx = items.findIndex(o => o.id === id); if (idx === -1) return Promise.resolve(null); items[idx] = { ...items[idx], ...update }; writeJSON('orders.json', items); return Promise.resolve(items[idx]); },
    };
    db = 'json';
    console.log('Using JSON file storage (no POSTGRES_URL)');
  }
}

// ============================================================
// IMAGE UPLOAD — base64 in production, local files locally
// ============================================================
let uploadHandler;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  // Production: compress HEAVILY, then store as base64 data URI in Postgres.
  // Produces BOTH a full-size image (600px, q72) for the product detail page
  // and a thumbnail (260px, q60) for listing grids. The thumbnail is ~5-10KB
  // which keeps category/home listings well under Neon's 64MB response cap
  // even with hundreds of products.
  uploadHandler = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return { image: '', thumbnail: '' };
    const { Jimp, JimpMime } = require('jimp');
    const src = await Jimp.read(req.file.buffer);

    // Full image: long edge ≤ 600px
    const full = src.clone();
    if (full.width > full.height) {
      if (full.width > 600) full.resize({ w: 600 });
    } else {
      if (full.height > 600) full.resize({ h: 600 });
    }
    const fullBuf = await full.getBuffer(JimpMime.jpeg, { quality: 72 });

    // Thumbnail: long edge ≤ 260px
    const thumb = src.clone();
    if (thumb.width > thumb.height) {
      if (thumb.width > 260) thumb.resize({ w: 260 });
    } else {
      if (thumb.height > 260) thumb.resize({ h: 260 });
    }
    const thumbBuf = await thumb.getBuffer(JimpMime.jpeg, { quality: 60 });

    return {
      image: `data:image/jpeg;base64,${fullBuf.toString('base64')}`,
      thumbnail: `data:image/jpeg;base64,${thumbBuf.toString('base64')}`,
    };
  }
  app._uploadImage = uploadImage;
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  uploadHandler = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return { image: '', thumbnail: '' };
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'kidsmoda', transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }] },
        (err, result) => (err ? reject(err) : resolve({ image: result.secure_url, thumbnail: result.secure_url }))
      );
      stream.end(req.file.buffer);
    });
  }
  app._uploadImage = uploadImage;
} else {
  // Local dev: disk storage
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  });
  uploadHandler = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return { image: '', thumbnail: '' };
    const url = `/uploads/${req.file.filename}`;
    return { image: url, thumbnail: url };
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
    // CDN caches the listing for 60s, serves stale for up to 5m while revalidating.
    // Admin mutations will naturally refresh on next page load.
    res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { image, thumbnail } = await app._uploadImage(req);
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      category: req.body.category,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      quantity: parseInt(req.body.quantity) || 0,
      safety: req.body.safety || 'CE certified. Non-toxic materials. Tested for child safety.',
      material: req.body.material || '',
      image, thumbnail,
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

    const { image, thumbnail } = await app._uploadImage(req);
    if (image) update.image = image;
    if (thumbnail) update.thumbnail = thumbnail;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// One-shot purge — clears all products. Used to recover from oversized-base64 bloat.
app.post('/api/products/_purge', requireAdmin, async (req, res) => {
  try {
    if (db === 'postgres') {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);
      await sql`DELETE FROM products`;
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
