// db.js — SQLite database layer using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './velours.db';
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── SCHEMA ─────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    icon      TEXT DEFAULT '',
    sort      INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS products (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    desc       TEXT DEFAULT '',
    price      INTEGER NOT NULL,
    old_price  INTEGER,
    category   TEXT REFERENCES categories(id),
    badge      TEXT,
    active     INTEGER DEFAULT 1,
    image      TEXT,
    gallery    TEXT DEFAULT '[]',
    width      TEXT,
    height     TEXT,
    sort       INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    password_hash TEXT NOT NULL,
    role          TEXT DEFAULT 'customer',
    addresses     TEXT DEFAULT '[]',
    favorites     TEXT DEFAULT '[]',
    birthday      TEXT,
    created_at    INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(id),
    customer_name   TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    recipient_name  TEXT,
    recipient_phone TEXT,
    card_text       TEXT,
    address         TEXT,
    delivery_date   TEXT,
    delivery_time   TEXT,
    delivery_type   TEXT DEFAULT 'courier',
    delivery_cost   INTEGER DEFAULT 0,
    note            TEXT,
    items           TEXT DEFAULT '[]',
    subtotal        INTEGER DEFAULT 0,
    discount        INTEGER DEFAULT 0,
    total           INTEGER NOT NULL,
    status          TEXT DEFAULT 'new',
    payment_method  TEXT,
    payment_status  TEXT DEFAULT 'pending',
    payment_id      TEXT,
    created_at      INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at      INTEGER
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
`);

// ─── HELPERS ────────────────────────────────────────────────
const uid = () => require('uuid').v4().replace(/-/g, '').slice(0, 12);
const now = () => Date.now();
const parseJSON = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };

// ─── SEED ───────────────────────────────────────────────────
function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (count > 0) return;

  console.log('🌱 Seeding database...');

  // Categories
  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (id, name, icon, sort) VALUES (?, ?, ?, ?)');
  [
    ['roses',   'Розы',       '🌹', 1],
    ['mixed',   'Миксы',      '💐', 2],
    ['mono',    'Монобукеты', '🌸', 3],
    ['premium', 'Премиум',    '✨', 4],
    ['dried',   'Сухоцветы',  '🌾', 5],
  ].forEach(args => insertCat.run(...args));

  // Products
  const insertProd = db.prepare(`INSERT OR IGNORE INTO products (id, name, desc, price, category, badge, active, sort) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`);
  [
    ['p1','Бархатный сад',   'Пионовидные розы Пиаже, лаванда, эвкалипт', 4800, 'roses',   'hit',     1],
    ['p2','Утренний туман',  'Белые пионы, лизиантус, гипсофила',          3600, 'mixed',   null,      2],
    ['p3','Фиолетовый этюд', 'Лавандовые тюльпаны, ирисы, ежевика',       5200, 'mono',    'new',     3],
    ['p4','Золотой час',     'Желтые пионы, мимоза, ранункулюс, зелень',   8900, 'premium', 'premium', 4],
    ['p5','Алая страсть',    'Красные розы Эксплорер, 25 штук',            3200, 'roses',   null,      5],
    ['p6','Небесный бриз',   'Синие ирисы, агапантус, делфиниум',          6400, 'mixed',   null,      6],
    ['p7','Пастельный сон',  'Нежные пионы, фрезия, белая эустома',        4200, 'mono',    null,      7],
    ['p8','Осенний закат',   'Сухоцветы, хлопок, лунария, ковыль',         3800, 'dried',   'new',     8],
  ].forEach(args => insertProd.run(...args));

  // Admin user
  const hash = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)')
    .run('admin001', 'Администратор', 'admin@velours.ru', '+7 495 000-00-00', hash, 'admin');

  // Default settings
  const setSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  [
    ['shop_name',            'Velours'],
    ['phone',                '+7 (495) 123-45-67'],
    ['email',                'hello@velours.ru'],
    ['city',                 'Москва'],
    ['address',              'ул. Тверская, 12'],
    ['delivery_price',       '500'],
    ['free_from',            '3000'],
    ['min_lead_hours',       '2'],
    ['delivery_24_7',        'true'],
    ['yookassa_shop_id',     ''],
    ['yookassa_return_url',  '/pages/checkout.html?status=success'],
    ['notify_email',         'true'],
    ['notify_sms',           'false'],
    ['notify_telegram',      'false'],
    ['daily_report',         'true'],
  ].forEach(([k, v]) => setSetting.run(k, v));

  console.log('✅ Database seeded');
}

seed();

// ─── CATEGORIES ─────────────────────────────────────────────
const categories = {
  getAll: () => db.prepare('SELECT * FROM categories ORDER BY sort, name').all(),
  get: id => db.prepare('SELECT * FROM categories WHERE id = ?').get(id),
  create: ({ id, name, icon = '', sort }) => {
    const sortVal = sort ?? (db.prepare('SELECT MAX(sort) as m FROM categories').get().m || 0) + 1;
    db.prepare('INSERT INTO categories (id, name, icon, sort) VALUES (?, ?, ?, ?)').run(id, name, icon, sortVal);
    return categories.get(id);
  },
  update: (id, data) => {
    const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE categories SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
    return categories.get(id);
  },
  delete: id => db.prepare('DELETE FROM categories WHERE id = ?').run(id),
};

// ─── PRODUCTS ───────────────────────────────────────────────
const products = {
  getAll: ({ category, active, search } = {}) => {
    let q = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (category) { q += ' AND category = ?'; params.push(category); }
    if (active !== undefined) { q += ' AND active = ?'; params.push(active ? 1 : 0); }
    if (search) { q += ' AND (name LIKE ? OR desc LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    q += ' ORDER BY sort, created_at';
    return db.prepare(q).all(...params).map(p => ({
      ...p,
      active: p.active === 1,
      gallery: parseJSON(p.gallery),
    }));
  },
  get: id => {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!p) return null;
    return { ...p, active: p.active === 1, gallery: parseJSON(p.gallery) };
  },
  create: data => {
    const id = uid();
    const sort = (db.prepare('SELECT MAX(sort) as m FROM products').get().m || 0) + 1;
    db.prepare(`
      INSERT INTO products (id, name, desc, price, old_price, category, badge, active, image, gallery, width, height, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.desc||'', data.price, data.oldPrice||null, data.category||null,
      data.badge||null, data.active !== false ? 1 : 0, data.image||null,
      JSON.stringify(data.gallery||[]), data.width||null, data.height||null, sort);
    return products.get(id);
  },
  update: (id, data) => {
    const map = { name:'name', desc:'desc', price:'price', oldPrice:'old_price', category:'category',
      badge:'badge', active:'active', image:'image', gallery:'gallery', width:'width', height:'height', sort:'sort' };
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        sets.push(`${col} = ?`);
        let v = data[k];
        if (k === 'active') v = v ? 1 : 0;
        if (k === 'gallery') v = JSON.stringify(v);
        vals.push(v);
      }
    }
    if (!sets.length) return products.get(id);
    sets.push('updated_at = ?'); vals.push(now());
    db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
    return products.get(id);
  },
  delete: id => db.prepare('DELETE FROM products WHERE id = ?').run(id),
};

// ─── USERS ──────────────────────────────────────────────────
const users = {
  getAll: () => db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(formatUser),
  get: id => { const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id); return u ? formatUser(u) : null; },
  findByEmail: email => { const u = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email); return u ? formatUser(u) : null; },
  findByEmailWithHash: email => db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null,
  create: data => {
    const id = uid();
    const hash = bcrypt.hashSync(data.password, 10);
    db.prepare('INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, data.name, data.email, data.phone||null, hash, data.role||'customer');
    return users.get(id);
  },
  update: (id, data) => {
    const map = { name:'name', email:'email', phone:'phone', birthday:'birthday', addresses:'addresses', favorites:'favorites' };
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        sets.push(`${col} = ?`);
        vals.push(Array.isArray(data[k]) ? JSON.stringify(data[k]) : data[k]);
      }
    }
    if (data.password) { sets.push('password_hash = ?'); vals.push(bcrypt.hashSync(data.password, 10)); }
    if (!sets.length) return users.get(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
    return users.get(id);
  },
  delete: id => db.prepare('DELETE FROM users WHERE id = ?').run(id),
  verifyPassword: (user, password) => bcrypt.compareSync(password, user.password_hash || user.passwordHash),
};

function formatUser(u) {
  return {
    ...u,
    passwordHash: undefined,
    password_hash: undefined,
    addresses: parseJSON(u.addresses),
    favorites: parseJSON(u.favorites),
  };
}

// ─── ORDERS ─────────────────────────────────────────────────
const orders = {
  getAll: ({ userId, status, search, limit } = {}) => {
    let q = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (userId) { q += ' AND user_id = ?'; params.push(userId); }
    if (status) { q += ' AND status = ?'; params.push(status); }
    if (search) { q += ' AND (id LIKE ? OR customer_name LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    q += ' ORDER BY created_at DESC';
    if (limit) { q += ' LIMIT ?'; params.push(limit); }
    return db.prepare(q).all(...params).map(formatOrder);
  },
  get: id => { const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id); return o ? formatOrder(o) : null; },
  create: data => {
    const count = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const id = 'ORD-' + String(count + 1).padStart(3, '0');
    db.prepare(`
      INSERT INTO orders (id, user_id, customer_name, phone, email, recipient_name, recipient_phone,
        card_text, address, delivery_date, delivery_time, delivery_type, delivery_cost,
        note, items, subtotal, discount, total, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.userId||null, data.customerName, data.phone||null, data.email||null,
      data.recipientName||null, data.recipientPhone||null, data.cardText||null,
      data.address||null, data.deliveryDate||null, data.deliveryTime||null,
      data.deliveryType||'courier', data.deliveryCost||0, data.note||null,
      JSON.stringify(data.items||[]), data.subtotal||0, data.discount||0, data.total,
      data.paymentMethod||null);
    return orders.get(id);
  },
  update: (id, data) => {
    const map = { status:'status', paymentStatus:'payment_status', paymentId:'payment_id',
      customerName:'customer_name', phone:'phone', address:'address', note:'note' };
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { sets.push(`${col} = ?`); vals.push(data[k]); }
    }
    if (!sets.length) return orders.get(id);
    sets.push('updated_at = ?'); vals.push(now());
    db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
    return orders.get(id);
  },
  delete: id => db.prepare('DELETE FROM orders WHERE id = ?').run(id),
  stats: () => {
    const total = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const today = new Date().toISOString().split('T')[0];
    const todayTs = new Date(today).getTime();
    const todayCount = db.prepare('SELECT COUNT(*) as c FROM orders WHERE created_at >= ?').get(todayTs).c;
    const todayRev = db.prepare(`SELECT COALESCE(SUM(total),0) as s FROM orders WHERE created_at >= ? AND payment_status = 'paid'`).get(todayTs).s;
    const byStatus = db.prepare('SELECT status, COUNT(*) as c FROM orders GROUP BY status').all()
      .reduce((acc, r) => ({ ...acc, [r.status]: r.c }), {});
    return { total, todayCount, todayRevenue: todayRev, byStatus };
  },
};

function formatOrder(o) {
  return { ...o, items: parseJSON(o.items), userId: o.user_id,
    customerName: o.customer_name, recipientName: o.recipient_name, recipientPhone: o.recipient_phone,
    cardText: o.card_text, deliveryDate: o.delivery_date, deliveryTime: o.delivery_time,
    deliveryType: o.delivery_type, deliveryCost: o.delivery_cost, paymentStatus: o.payment_status,
    paymentId: o.payment_id, paymentMethod: o.payment_method, createdAt: o.created_at };
}

// ─── SETTINGS ───────────────────────────────────────────────
const settings = {
  get: () => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  },
  set: (key, value) => db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value)),
  update: data => {
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const tx = db.transaction(entries => entries.forEach(([k, v]) => upsert.run(k, String(v))));
    tx(Object.entries(data));
    return settings.get();
  },
};

module.exports = { db, categories, products, users, orders, settings };
