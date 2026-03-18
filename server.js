// server.js — Velours API Server
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const jwt        = require('jsonwebtoken');
const multer     = require('multer');
const { v4: uuidv4 } = require('uuid');
const { categories, products, users, orders, settings } = require('./database');

const app  = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'velours_dev_secret';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── MIDDLEWARE ───────────────────────────────────────────────
// In production (same origin) CORS is not needed, but keep it for local dev
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',');
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins[0] === '*' || allowedOrigins.includes(origin)) cb(null, true);
  else cb(new Error('Not allowed by CORS'));
}, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.resolve(UPLOADS_DIR)));

// ─── MULTER (image upload) ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Недопустимый тип файла. Разрешены: JPG, PNG, WebP, GIF'));
  }
});

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Токен не предоставлен' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
    next();
  });
}

// ─── HELPERS ─────────────────────────────────────────────────
const ok   = (res, data, status = 200) => res.status(status).json(data);
const fail = (res, msg, status = 400) => res.status(status).json({ error: msg });

// ─── ROUTES ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'Email и пароль обязательны');
  const user = users.findByEmailWithHash(email);
  if (!user || !users.verifyPassword(user, password)) return fail(res, 'Неверный email или пароль', 401);
  const token = jwt.sign({ userId: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  ok(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return fail(res, 'Заполните обязательные поля');
  if (password.length < 6) return fail(res, 'Пароль должен содержать минимум 6 символов');
  if (users.findByEmail(email)) return fail(res, 'Email уже используется');
  const user = users.create({ name, email, phone, password });
  const token = jwt.sign({ userId: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  ok(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return fail(res, 'Пользователь не найден', 404);
  ok(res, user);
});

// ── CATEGORIES ────────────────────────────────────────────────
app.get('/api/categories', (req, res) => ok(res, categories.getAll()));

app.post('/api/categories', adminMiddleware, (req, res) => {
  const { id, name, icon, sort } = req.body;
  if (!id || !name) return fail(res, 'Укажите id и название');
  if (categories.get(id)) return fail(res, 'Категория с таким id уже существует');
  ok(res, categories.create({ id, name, icon, sort }), 201);
});

app.put('/api/categories/:id', adminMiddleware, (req, res) => {
  if (!categories.get(req.params.id)) return fail(res, 'Категория не найдена', 404);
  ok(res, categories.update(req.params.id, req.body));
});

app.delete('/api/categories/:id', adminMiddleware, (req, res) => {
  const prods = products.getAll({ category: req.params.id });
  if (prods.length) return fail(res, `Нельзя удалить: ${prods.length} товаров в категории`);
  categories.delete(req.params.id);
  ok(res, { deleted: true });
});

// ── PRODUCTS ─────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, active, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (active !== undefined) filter.active = active === 'true' || active === '1';
  if (search) filter.search = search;
  ok(res, products.getAll(filter));
});

app.get('/api/products/:id', (req, res) => {
  const p = products.get(req.params.id);
  if (!p) return fail(res, 'Товар не найден', 404);
  ok(res, p);
});

app.post('/api/products', adminMiddleware, (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return fail(res, 'Название и цена обязательны');
  ok(res, products.create(req.body), 201);
});

app.put('/api/products/:id', adminMiddleware, (req, res) => {
  if (!products.get(req.params.id)) return fail(res, 'Товар не найден', 404);
  ok(res, products.update(req.params.id, req.body));
});

app.delete('/api/products/:id', adminMiddleware, (req, res) => {
  if (!products.get(req.params.id)) return fail(res, 'Товар не найден', 404);
  products.delete(req.params.id);
  ok(res, { deleted: true });
});

// ── IMAGE UPLOAD ──────────────────────────────────────────────
// Upload single product image
app.post('/api/products/:id/image', adminMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return fail(res, 'Файл не загружен');
  const url = `/uploads/${req.file.filename}`;
  products.update(req.params.id, { image: url });
  ok(res, { url });
});

// Upload gallery image
app.post('/api/products/:id/gallery', adminMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return fail(res, 'Файл не загружен');
  const p = products.get(req.params.id);
  if (!p) return fail(res, 'Товар не найден', 404);
  const url = `/uploads/${req.file.filename}`;
  const gallery = [...(p.gallery || []), url];
  products.update(req.params.id, { gallery });
  ok(res, { url, gallery });
});

// Upload standalone (returns url only)
app.post('/api/upload', adminMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return fail(res, 'Файл не загружен');
  ok(res, { url: `/uploads/${req.file.filename}` });
});

// Multiple images at once
app.post('/api/upload/multiple', adminMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return fail(res, 'Файлы не загружены');
  ok(res, { urls: req.files.map(f => `/uploads/${f.filename}`) });
});

// ── ORDERS ────────────────────────────────────────────────────
app.get('/api/orders', adminMiddleware, (req, res) => {
  const { status, search, limit } = req.query;
  ok(res, orders.getAll({ status, search, limit: limit ? parseInt(limit) : undefined }));
});

app.get('/api/orders/stats', adminMiddleware, (req, res) => ok(res, orders.stats()));

app.get('/api/orders/my', authMiddleware, (req, res) => {
  ok(res, orders.getAll({ userId: req.user.userId }));
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return fail(res, 'Заказ не найден', 404);
  if (req.user.role !== 'admin' && order.userId !== req.user.userId) return fail(res, 'Нет доступа', 403);
  ok(res, order);
});

app.post('/api/orders', (req, res) => {
  // Public endpoint — anyone can create an order
  const { customerName, phone, total, items } = req.body;
  if (!customerName || !phone || !total || !items?.length) return fail(res, 'Заполните обязательные поля');
  const order = orders.create({ ...req.body, userId: req.body.userId || null });
  ok(res, order, 201);
});

app.put('/api/orders/:id', adminMiddleware, (req, res) => {
  if (!orders.get(req.params.id)) return fail(res, 'Заказ не найден', 404);
  ok(res, orders.update(req.params.id, req.body));
});

app.delete('/api/orders/:id', adminMiddleware, (req, res) => {
  if (!orders.get(req.params.id)) return fail(res, 'Заказ не найден', 404);
  orders.delete(req.params.id);
  ok(res, { deleted: true });
});

// ── USERS ────────────────────────────────────────────────────
app.get('/api/users', adminMiddleware, (req, res) => {
  ok(res, users.getAll().filter(u => u.role !== 'admin').map(u => ({ ...u, password_hash: undefined })));
});

app.put('/api/users/me', authMiddleware, (req, res) => {
  const allowed = ['name', 'phone', 'birthday', 'addresses', 'favorites'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  ok(res, users.update(req.user.userId, data));
});

app.put('/api/users/me/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.getWithHash(req.user.userId);
  if (!user || !users.verifyPassword(user, currentPassword)) return fail(res, 'Неверный текущий пароль', 401);
  if (!newPassword || newPassword.length < 6) return fail(res, 'Новый пароль должен содержать минимум 6 символов');
  users.update(req.user.userId, { password: newPassword });
  ok(res, { updated: true });
});

app.delete('/api/users/:id', adminMiddleware, (req, res) => {
  if (!users.get(req.params.id)) return fail(res, 'Пользователь не найден', 404);
  users.delete(req.params.id);
  ok(res, { deleted: true });
});

// ── SETTINGS ─────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const s = settings.get();
  // Public settings only (no secrets)
  const { yookassa_secret_key, ...publicSettings } = s;
  ok(res, publicSettings);
});

app.put('/api/settings', adminMiddleware, (req, res) => {
  // Never expose secret key through API
  const { yookassa_secret_key, ...safeData } = req.body;
  ok(res, settings.update(safeData));
});

// ── PAYMENTS (YooKassa) ───────────────────────────────────────
app.post('/api/payments/create', authMiddleware, async (req, res) => {
  const { orderId, amount, email } = req.body;
  if (!orderId || !amount) return fail(res, 'orderId и amount обязательны');

  const shopId    = settings.get().yookassa_shop_id || process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    // Demo mode — return fake token
    return ok(res, { token: `demo_${Date.now()}`, paymentId: `pay_demo_${orderId}`, demo: true });
  }

  try {
    const idempotenceKey = `${orderId}_${Date.now()}`;
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: { value: parseFloat(amount).toFixed(2), currency: 'RUB' },
        confirmation: { type: 'embedded' },
        description: `Заказ Velours ${orderId}`,
        capture: true,
        receipt: email ? { customer: { email }, items: [] } : undefined,
        metadata: { orderId },
      }),
    });
    const data = await response.json();
    if (!response.ok) return fail(res, data.description || 'Ошибка ЮKassa', 502);
    ok(res, { token: data.confirmation.confirmation_token, paymentId: data.id });
  } catch (err) {
    console.error('[YooKassa]', err);
    fail(res, 'Ошибка соединения с ЮKassa', 502);
  }
});

// YooKassa webhook
app.post('/api/payments/webhook', express.json(), (req, res) => {
  const { event, object } = req.body;
  console.log('[Webhook]', event, object?.id);
  if (event === 'payment.succeeded') {
    const orderId = object?.metadata?.orderId;
    if (orderId) orders.update(orderId, { paymentStatus: 'paid', status: 'confirmed', paymentId: object.id });
  }
  if (event === 'payment.canceled') {
    const orderId = object?.metadata?.orderId;
    if (orderId) orders.update(orderId, { paymentStatus: 'cancelled' });
  }
  res.sendStatus(200);
});

// ─── STATIC FILES (frontend) ──────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: serve index.html for non-API routes (SPA-like)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message?.includes('CORS')) return res.status(403).json({ error: 'CORS: запрос отклонён' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Файл слишком большой (макс 5 МБ)' });
  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

// ─── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌹 Velours API запущен на http://localhost:${PORT}`);
  console.log(`   Документация: http://localhost:${PORT}/api/health`);
  console.log(`   Фронтенд: ${process.env.FRONTEND_URL || 'http://localhost:8080'}\n`);
});

module.exports = app;
