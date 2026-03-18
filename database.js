// database.js — PostgreSQL version (pg)
const { Pool } = require('pg');
const bcrypt    = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ─── HELPERS ────────────────────────────────────────────────
const uid       = () => require('uuid').v4().replace(/-/g,'').slice(0,12);
const now       = () => Date.now();
const parseJSON = (v, fb = []) => { try { return JSON.parse(v); } catch { return fb; } };

const q   = (text, params) => pool.query(text, params);
const one = async (text, params) => { const r = await pool.query(text, params); return r.rows[0] || null; };
const all = async (text, params) => { const r = await pool.query(text, params); return r.rows; };

// ─── SCHEMA ─────────────────────────────────────────────────
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      icon       TEXT DEFAULT '',
      sort       INTEGER DEFAULT 0,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
    );

    CREATE TABLE IF NOT EXISTS products (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      "desc"     TEXT DEFAULT '',
      price      INTEGER NOT NULL,
      old_price  INTEGER,
      category   TEXT REFERENCES categories(id),
      badge      TEXT,
      active     BOOLEAN DEFAULT TRUE,
      image      TEXT,
      gallery    TEXT DEFAULT '[]',
      width      TEXT,
      height     TEXT,
      sort       INTEGER DEFAULT 0,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
      updated_at BIGINT
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
      created_at    BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
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
      created_at      BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
      updated_at      BIGINT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC);
  `);
}

// ─── SEED ───────────────────────────────────────────────────
async function seed() {
  const row = await one('SELECT COUNT(*) AS c FROM categories');
  if (parseInt(row.c) > 0) return;
  console.log('🌱 Seeding database...');

  for (const [id, name, icon, sort] of [
    ['roses','Розы','🌹',1],['mixed','Миксы','💐',2],['mono','Монобукеты','🌸',3],
    ['premium','Премиум','✨',4],['dried','Сухоцветы','🌾',5],
  ]) {
    await q('INSERT INTO categories (id,name,icon,sort) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',[id,name,icon,sort]);
  }

  for (const [id,name,desc,price,category,badge,sort] of [
    ['p1','Бархатный сад',  'Пионовидные розы Пиаже, лаванда, эвкалипт',  4800,'roses',  'hit',    1],
    ['p2','Утренний туман', 'Белые пионы, лизиантус, гипсофила',           3600,'mixed',  null,     2],
    ['p3','Фиолетовый этюд','Лавандовые тюльпаны, ирисы, ежевика',        5200,'mono',   'new',    3],
    ['p4','Золотой час',    'Желтые пионы, мимоза, ранункулюс, зелень',   8900,'premium','premium',4],
    ['p5','Алая страсть',   'Красные розы Эксплорер, 25 штук',            3200,'roses',  null,     5],
    ['p6','Небесный бриз',  'Синие ирисы, агапантус, делфиниум',          6400,'mixed',  null,     6],
    ['p7','Пастельный сон', 'Нежные пионы, фрезия, белая эустома',        4200,'mono',   null,     7],
    ['p8','Осенний закат',  'Сухоцветы, хлопок, лунария, ковыль',         3800,'dried',  'new',    8],
  ]) {
    await q(`INSERT INTO products (id,name,"desc",price,category,badge,active,sort)
             VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7) ON CONFLICT DO NOTHING`,[id,name,desc,price,category,badge,sort]);
  }

  const hash = bcrypt.hashSync('admin', 10);
  await q(`INSERT INTO users (id,name,email,phone,password_hash,role)
           VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
    ['admin001','Администратор','admin@velours.ru','+7 495 000-00-00',hash,'admin']);

  for (const [k,v] of [
    ['shop_name','Velours'],['phone','+7 (495) 123-45-67'],['email','hello@velours.ru'],
    ['city','Москва'],['address','ул. Тверская, 12'],['delivery_price','500'],
    ['free_from','3000'],['min_lead_hours','2'],['delivery_24_7','true'],
    ['yookassa_shop_id',''],['yookassa_return_url','/pages/checkout.html?status=success'],
    ['notify_email','true'],['notify_sms','false'],['notify_telegram','false'],['daily_report','true'],
  ]) {
    await q('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT DO NOTHING',[k,v]);
  }
  console.log('✅ Database seeded');
}

// ─── CATEGORIES ─────────────────────────────────────────────
const categories = {
  getAll: () => all('SELECT * FROM categories ORDER BY sort, name'),
  get:    id => one('SELECT * FROM categories WHERE id = $1', [id]),
  create: async ({ id, name, icon = '', sort }) => {
    const m = await one('SELECT MAX(sort) AS m FROM categories');
    const s = sort ?? (parseInt(m?.m || 0) + 1);
    await q('INSERT INTO categories (id,name,icon,sort) VALUES ($1,$2,$3,$4)',[id,name,icon,s]);
    return categories.get(id);
  },
  update: async (id, data) => {
    const allowed = ['name','icon','sort'];
    const sets = []; const vals = [];
    for (const k of allowed) {
      if (data[k] !== undefined) { vals.push(data[k]); sets.push(`${k} = $${vals.length}`); }
    }
    if (sets.length) { vals.push(id); await q(`UPDATE categories SET ${sets.join(',')} WHERE id = $${vals.length}`,vals); }
    return categories.get(id);
  },
  delete: id => q('DELETE FROM categories WHERE id = $1',[id]),
};

// ─── PRODUCTS ───────────────────────────────────────────────
const fmtProd = p => p ? { ...p, active: !!p.active, gallery: parseJSON(p.gallery) } : null;

const products = {
  getAll: async ({ category, active, search } = {}) => {
    let text = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (category !== undefined) { params.push(category); text += ` AND category = $${params.length}`; }
    if (active !== undefined)   { params.push(active);   text += ` AND active = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      text += ` AND (name ILIKE $${n} OR "desc" ILIKE $${n})`;
    }
    text += ' ORDER BY sort, created_at';
    return (await all(text, params)).map(fmtProd);
  },
  get: async id => fmtProd(await one('SELECT * FROM products WHERE id = $1',[id])),
  create: async data => {
    const id = uid();
    const m  = await one('SELECT MAX(sort) AS m FROM products');
    const sort = parseInt(m?.m || 0) + 1;
    await q(
      `INSERT INTO products (id,name,"desc",price,old_price,category,badge,active,image,gallery,width,height,sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id,data.name,data.desc||'',data.price,data.oldPrice||null,data.category||null,
       data.badge||null,data.active!==false,data.image||null,
       JSON.stringify(data.gallery||[]),data.width||null,data.height||null,sort]
    );
    return products.get(id);
  },
  update: async (id, data) => {
    const map = {name:'name',desc:'"desc"',price:'price',oldPrice:'old_price',category:'category',
      badge:'badge',active:'active',image:'image',gallery:'gallery',width:'width',height:'height',sort:'sort'};
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        let v = data[k];
        if (k === 'active')  v = !!v;
        if (k === 'gallery') v = JSON.stringify(v);
        vals.push(v); sets.push(`${col} = $${vals.length}`);
      }
    }
    if (!sets.length) return products.get(id);
    vals.push(now()); sets.push(`updated_at = $${vals.length}`);
    vals.push(id);
    await q(`UPDATE products SET ${sets.join(',')} WHERE id = $${vals.length}`,vals);
    return products.get(id);
  },
  delete: id => q('DELETE FROM products WHERE id = $1',[id]),
};

// ─── USERS ──────────────────────────────────────────────────
const fmtUser = u => {
  if (!u) return null;
  const out = { ...u, addresses: parseJSON(u.addresses), favorites: parseJSON(u.favorites) };
  delete out.password_hash;
  return out;
};

const users = {
  getAll: async () => (await all('SELECT * FROM users ORDER BY created_at DESC')).map(fmtUser),
  get:    async id    => fmtUser(await one('SELECT * FROM users WHERE id = $1',[id])),
  findByEmail: async email => fmtUser(await one('SELECT * FROM users WHERE LOWER(email) = LOWER($1)',[email])),
  findByEmailWithHash: email => one('SELECT * FROM users WHERE LOWER(email) = LOWER($1)',[email]),
  getWithHash:        id    => one('SELECT * FROM users WHERE id = $1',[id]),
  create: async data => {
    const id   = uid();
    const hash = bcrypt.hashSync(data.password, 10);
    await q('INSERT INTO users (id,name,email,phone,password_hash,role) VALUES ($1,$2,$3,$4,$5,$6)',
      [id,data.name,data.email,data.phone||null,hash,data.role||'customer']);
    return users.get(id);
  },
  update: async (id, data) => {
    const map = {name:'name',email:'email',phone:'phone',birthday:'birthday',addresses:'addresses',favorites:'favorites'};
    const sets = []; const vals = [];
    for (const [k,col] of Object.entries(map)) {
      if (data[k] !== undefined) {
        vals.push(Array.isArray(data[k]) ? JSON.stringify(data[k]) : data[k]);
        sets.push(`${col} = $${vals.length}`);
      }
    }
    if (data.password) { vals.push(bcrypt.hashSync(data.password,10)); sets.push(`password_hash = $${vals.length}`); }
    if (!sets.length) return users.get(id);
    vals.push(id);
    await q(`UPDATE users SET ${sets.join(',')} WHERE id = $${vals.length}`,vals);
    return users.get(id);
  },
  delete: id => q('DELETE FROM users WHERE id = $1',[id]),
  verifyPassword: (user, password) => bcrypt.compareSync(password, user.password_hash),
};

// ─── ORDERS ─────────────────────────────────────────────────
const fmtOrder = o => o ? {
  ...o, items: parseJSON(o.items),
  userId: o.user_id, customerName: o.customer_name,
  recipientName: o.recipient_name, recipientPhone: o.recipient_phone,
  cardText: o.card_text, deliveryDate: o.delivery_date, deliveryTime: o.delivery_time,
  deliveryType: o.delivery_type, deliveryCost: o.delivery_cost,
  paymentStatus: o.payment_status, paymentId: o.payment_id,
  paymentMethod: o.payment_method, createdAt: o.created_at,
} : null;

const orders = {
  getAll: async ({ userId, status, search, limit } = {}) => {
    let text = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (userId) { params.push(userId); text += ` AND user_id = $${params.length}`; }
    if (status) { params.push(status); text += ` AND status = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      text += ` AND (id ILIKE $${n} OR customer_name ILIKE $${n} OR phone ILIKE $${n})`;
    }
    text += ' ORDER BY created_at DESC';
    if (limit) { params.push(limit); text += ` LIMIT $${params.length}`; }
    return (await all(text, params)).map(fmtOrder);
  },
  get:    async id => fmtOrder(await one('SELECT * FROM orders WHERE id = $1',[id])),
  create: async data => {
    const countRow = await one('SELECT COUNT(*) AS c FROM orders');
    const id = 'ORD-' + String(parseInt(countRow.c) + 1).padStart(3,'0');
    await q(
      `INSERT INTO orders (id,user_id,customer_name,phone,email,recipient_name,recipient_phone,
        card_text,address,delivery_date,delivery_time,delivery_type,delivery_cost,
        note,items,subtotal,discount,total,payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [id,data.userId||null,data.customerName,data.phone||null,data.email||null,
       data.recipientName||null,data.recipientPhone||null,data.cardText||null,
       data.address||null,data.deliveryDate||null,data.deliveryTime||null,
       data.deliveryType||'courier',data.deliveryCost||0,data.note||null,
       JSON.stringify(data.items||[]),data.subtotal||0,data.discount||0,data.total,
       data.paymentMethod||null]
    );
    return orders.get(id);
  },
  update: async (id, data) => {
    const map = {status:'status',paymentStatus:'payment_status',paymentId:'payment_id',
      customerName:'customer_name',phone:'phone',address:'address',note:'note'};
    const sets = []; const vals = [];
    for (const [k,col] of Object.entries(map)) {
      if (data[k] !== undefined) { vals.push(data[k]); sets.push(`${col} = $${vals.length}`); }
    }
    if (!sets.length) return orders.get(id);
    vals.push(now()); sets.push(`updated_at = $${vals.length}`);
    vals.push(id);
    await q(`UPDATE orders SET ${sets.join(',')} WHERE id = $${vals.length}`,vals);
    return orders.get(id);
  },
  delete: id => q('DELETE FROM orders WHERE id = $1',[id]),
  stats: async () => {
    const todayTs = new Date().setHours(0,0,0,0);
    const [tot, tday, trev, byS] = await Promise.all([
      one('SELECT COUNT(*) AS c FROM orders'),
      one('SELECT COUNT(*) AS c FROM orders WHERE created_at >= $1',[todayTs]),
      one(`SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE created_at >= $1 AND payment_status = 'paid'`,[todayTs]),
      all('SELECT status, COUNT(*) AS c FROM orders GROUP BY status'),
    ]);
    return {
      total:        parseInt(tot.c),
      todayCount:   parseInt(tday.c),
      todayRevenue: parseInt(trev.s),
      byStatus:     byS.reduce((acc,r) => ({...acc,[r.status]:parseInt(r.c)}),{}),
    };
  },
};

// ─── SETTINGS ───────────────────────────────────────────────
const settings = {
  get: async () => Object.fromEntries((await all('SELECT key,value FROM settings')).map(r => [r.key,r.value])),
  set: (key, value) => q(
    'INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    [key, String(value)]
  ),
  update: async data => {
    for (const [k,v] of Object.entries(data)) {
      await q('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',[k,String(v)]);
    }
    return settings.get();
  },
};

// ─── INIT ────────────────────────────────────────────────────
async function init() {
  try {
    await initSchema();
    await seed();
    console.log('✅ PostgreSQL connected and ready');
  } catch (err) {
    console.error('❌ Database init failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, categories, products, users, orders, settings, init };
