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
app.use(express.json({ limit: '20mb' }));

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
  // Production: compress and store as base64 data URI in Postgres.
  // Produces BOTH a full-size image (1400px, q88) for the product detail page
  // and a thumbnail (600px, q70) for listing grids. The full image is only
  // fetched ONE AT A TIME via /api/products/:id, so Neon's 64MB response cap
  // never comes into play. The thumbnail is ~20-35KB — crisp at 2x retina in
  // the grid but still small enough that 500 products fit comfortably in one
  // listing response.
  uploadHandler = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

  async function uploadImage(req) {
    if (!req.file) return { image: '', thumbnail: '' };
    const { Jimp, JimpMime } = require('jimp');
    const src = await Jimp.read(req.file.buffer);

    // Full image: long edge ≤ 1400px, high quality
    const full = src.clone();
    if (full.width > full.height) {
      if (full.width > 1400) full.resize({ w: 1400 });
    } else {
      if (full.height > 1400) full.resize({ h: 1400 });
    }
    const fullBuf = await full.getBuffer(JimpMime.jpeg, { quality: 88 });

    // Thumbnail: long edge ≤ 600px so it's sharp at 2x retina in the grid
    const thumb = src.clone();
    if (thumb.width > thumb.height) {
      if (thumb.width > 600) thumb.resize({ w: 600 });
    } else {
      if (thumb.height > 600) thumb.resize({ h: 600 });
    }
    const thumbBuf = await thumb.getBuffer(JimpMime.jpeg, { quality: 70 });

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

// Public config — tells the frontend which payment methods are live. If no
// STRIPE_SECRET_KEY is set we hide the Visa option entirely so customers
// never hit a dead-end "Pay with Card" button. The moment the env var is
// added, Visa lights up automatically on the next page load.
app.get('/api/config', (req, res) => {
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
  res.json({
    stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
    currency: 'USD',
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ success: true, token: ADMIN_PASSWORD });
  res.status(401).json({ error: 'Wrong password' });
});

// Products
// A request is "fresh" (cache-bypassing) if it carries the admin token OR
// passes ?fresh=1. Admin dashboards always bypass the CDN so delete/add/edit
// actions reflect instantly — no ghost products after a refresh.
const isFreshRequest = (req) => {
  if (req.query.fresh === '1') return true;
  const t = req.headers.authorization;
  if (t && t === `Bearer ${ADMIN_PASSWORD}`) return true;
  return false;
};

app.get('/api/products', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter);
    if (isFreshRequest(req)) {
      // Admin must always see the current truth
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    } else {
      // Short public CDN cache. s-maxage=15 means mutations propagate to shoppers
      // within 15 seconds at most. stale-while-revalidate=60 keeps it fast.
      res.set('Cache-Control', 'public, max-age=10, s-maxage=15, stale-while-revalidate=60');
    }
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (isFreshRequest(req)) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    } else {
      res.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=120');
    }
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
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await Order.find());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Validate incoming items against stock. Returns { ok: true } on success, or
// { ok: false, error, status } with a human-readable reason.
async function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: 'Cart is empty' };
  }
  for (const it of items) {
    const pId = it.productId || it._id || it.id;
    if (!pId) return { ok: false, status: 400, error: `Missing product id on line "${it.name || '?'}"` };
    if (!Number.isFinite(it.quantity) || it.quantity < 1) {
      return { ok: false, status: 400, error: `Invalid quantity on "${it.name || '?'}"` };
    }
    const product = await Product.findById(pId);
    if (!product) return { ok: false, status: 400, error: `"${it.name || 'Item'}" is no longer available` };
    if (product.inStock === false) return { ok: false, status: 400, error: `"${product.name}" is out of stock` };
    const available = Number(product.quantity) || 0;
    if (available > 0 && it.quantity > available) {
      return { ok: false, status: 400, error: `Only ${available} left of "${product.name}"` };
    }
  }
  return { ok: true };
}

// Decrement stock quantities after a confirmed order. Best-effort — if one
// update fails we log it but do NOT fail the whole order, because the order
// is already confirmed from the shopper's perspective.
async function decrementStock(items) {
  for (const it of items) {
    try {
      const pId = it.productId || it._id || it.id;
      if (!pId) continue;
      const product = await Product.findById(pId);
      if (!product) continue;
      const newQty = Math.max(0, (Number(product.quantity) || 0) - (Number(it.quantity) || 0));
      await Product.findByIdAndUpdate(pId, {
        quantity: newQty,
        inStock: newQty > 0 ? product.inStock !== false : false,
      }, { new: true });
    } catch (err) {
      console.error('Stock decrement failed for item', it, err.message);
    }
  }
}

// Light-weight field validation for customer info
function validateCustomer(c) {
  if (!c || typeof c !== 'object') return 'Customer info missing';
  const required = ['name', 'email', 'phone', 'address', 'city', 'country'];
  for (const f of required) {
    if (!c[f] || String(c[f]).trim().length < 2) return `Please fill in your ${f}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return 'Please enter a valid email address';
  return null;
}

app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer, total } = req.body || {};
    const custErr = validateCustomer(customer);
    if (custErr) return res.status(400).json({ error: custErr });
    const check = await validateOrderItems(items);
    if (!check.ok) return res.status(check.status).json({ error: check.error });
    if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
      return res.status(400).json({ error: 'Invalid total' });
    }

    const order = await Order.create({
      items,
      customer: { ...customer, payment: customer.payment || 'cod' },
      total: Number(total),
      status: 'pending',
    });
    // COD orders decrement stock immediately — Stripe orders wait for the
    // payment confirmation poll to avoid burning inventory on abandoned carts.
    await decrementStock(items);
    res.json(order);
  } catch (e) {
    console.error('Order create failed:', e);
    res.status(500).json({ error: 'Could not save order. Please try again.' });
  }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stripe Checkout (only if configured)
app.post('/api/checkout/create-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Card payments are temporarily unavailable. Please choose Cash on Delivery.' });
  }
  try {
    const { items, customer, total } = req.body || {};
    const custErr = validateCustomer(customer);
    if (custErr) return res.status(400).json({ error: custErr });
    const check = await validateOrderItems(items);
    if (!check.ok) return res.status(check.status).json({ error: check.error });
    if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
      return res.status(400).json({ error: 'Invalid total' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: `${item.name}${item.size ? ` (${item.size})` : ''}` },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as an extra line item so the Stripe total matches ours exactly.
    const subtotal = items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
    const shippingCents = Math.max(0, Math.round((Number(total) - subtotal) * 100));
    if (shippingCents > 0) {
      lineItems.push({
        price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: shippingCents },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customer.email,
      line_items: lineItems,
      metadata: { orderData: JSON.stringify({ items, customer, total }) },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe session failed:', e);
    res.status(500).json({ error: e.message || 'Could not start payment. Please try again.' });
  }
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
        await Order.create({
          ...orderData,
          customer: { ...orderData.customer, payment: 'visa' },
          status: 'confirmed',
          stripeSessionId: session.id,
        });
        // Decrement stock ONCE, on the first confirmation observation.
        await decrementStock(orderData.items || []);
      }
      return res.json({ status: 'paid' });
    }
    res.json({ status: session.payment_status });
  } catch (e) {
    console.error('Stripe session retrieve failed:', e);
    res.status(500).json({ error: 'Could not verify payment. Please contact support.' });
  }
});

// Start server (local dev)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
