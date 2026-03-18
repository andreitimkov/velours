/**
 * VELOURS — API Client
 * ─────────────────────────────────────────────────────────────
 * Подключите этот файл ВМЕСТО js/db.js когда бэкенд готов:
 *
 *   <script src="js/api.js"></script>   ← вместо db.js
 *
 * Файл экспортирует тот же объект DB, что и db.js,
 * но все вызовы идут на реальный REST API.
 * ─────────────────────────────────────────────────────────────
 */

const API_BASE = (window.VELOURS_API_BASE || '') + '/api';

// ── Token management ──────────────────────────────────────────
const token = {
  get:    ()    => localStorage.getItem('vl_token'),
  set:    (t)   => localStorage.setItem('vl_token', t),
  clear:  ()    => localStorage.removeItem('vl_token'),
};

// ── HTTP helpers ──────────────────────────────────────────────
async function http(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = token.get();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get    = (path, auth)        => http('GET',    path, null, auth);
const post   = (path, body, auth)  => http('POST',   path, body, auth);
const put    = (path, body, auth)  => http('PUT',    path, body, auth);
const del    = (path, auth)        => http('DELETE', path, null, auth);

// ── Cart (stays in localStorage) ─────────────────────────────
const cartStore = {
  read:  ()     => JSON.parse(localStorage.getItem('vl_cart') || '[]'),
  write: (data) => localStorage.setItem('vl_cart', JSON.stringify(data)),
};

const cartEvents = { listeners: [], on: fn => cartEvents.listeners.push(fn), emit: () => cartEvents.listeners.forEach(fn => fn(DB.cart.get())) };

const DB = {

  // ── CATEGORIES ──────────────────────────────────────────────
  categories: {
    getAll:  ()          => get('/categories'),
    get:     id          => get(`/categories/${id}`),
    create:  data        => post('/categories', data, true),
    update:  (id, data)  => put(`/categories/${id}`, data, true),
    delete:  id          => del(`/categories/${id}`, true),
  },

  // ── PRODUCTS ────────────────────────────────────────────────
  products: {
    getAll:  (filter = {}) => {
      const qs = new URLSearchParams(filter).toString();
      return get('/products' + (qs ? `?${qs}` : ''));
    },
    get:     id            => get(`/products/${id}`),
    create:  data          => post('/products', data, true),
    update:  (id, data)    => put(`/products/${id}`, data, true),
    delete:  id            => del(`/products/${id}`, true),

    // Image upload (FormData, not JSON)
    uploadImage: async (id, file) => {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_BASE}/products/${id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.get()}` },
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },

    uploadGallery: async (id, file) => {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_BASE}/products/${id}/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.get()}` },
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },

  // ── ORDERS ──────────────────────────────────────────────────
  orders: {
    getAll:  (filter = {}) => {
      const qs = new URLSearchParams(filter).toString();
      return get('/orders' + (qs ? `?${qs}` : ''), true);
    },
    getMy:   ()            => get('/orders/my', true),
    get:     id            => get(`/orders/${id}`, true),
    create:  data          => post('/orders', data),
    update:  (id, data)    => put(`/orders/${id}`, data, true),
    delete:  id            => del(`/orders/${id}`, true),
    stats:   ()            => get('/orders/stats', true),
  },

  // ── USERS ────────────────────────────────────────────────────
  users: {
    getAll:      ()         => get('/users', true),
    me:          ()         => get('/auth/me', true),
    update:      data       => put('/users/me', data, true),
    changePass:  data       => put('/users/me/password', data, true),
    delete:      id         => del(`/users/${id}`, true),
    findByEmail: () => { throw new Error('Use Auth.login instead') },
    addAddress: async (userId, addr) => {
      const me = await DB.users.me();
      const addresses = [...(me.addresses || []), { id: Date.now().toString(36), ...addr }];
      return DB.users.update({ addresses });
    },
    removeAddress: async (userId, addrId) => {
      const me = await DB.users.me();
      return DB.users.update({ addresses: (me.addresses||[]).filter(a => a.id !== addrId) });
    },
  },

  // ── AUTH / SESSION ───────────────────────────────────────────
  session: {
    get:     () => {
      const t = token.get();
      if (!t) return null;
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) { token.clear(); return null; }
        return payload;
      } catch { return null; }
    },
    set:     (user) => { /* token is set via auth methods */ },
    clear:   () => token.clear(),
    isAdmin: () => DB.session.get()?.role === 'admin',
    user:    () => DB.users.me(),
  },

  // ── AUTH ─────────────────────────────────────────────────────
  auth: {
    login: async ({ email, password }) => {
      const data = await post('/auth/login', { email, password });
      token.set(data.token);
      return data.user;
    },
    register: async ({ name, email, phone, password }) => {
      const data = await post('/auth/register', { name, email, phone, password });
      token.set(data.token);
      return data.user;
    },
    logout: () => {
      token.clear();
      DB.cart.clear();
      window.location.href = '/index.html';
    },
  },

  // ── CART (localStorage, same as db.js) ───────────────────────
  cart: {
    get:    () => cartStore.read(),
    add:    (product, qty = 1) => {
      const items = cartStore.read();
      const exist = items.find(i => i.productId === product.id);
      if (exist) exist.qty += qty;
      else items.push({ productId: product.id, name: product.name, price: product.price, image: product.image, qty });
      cartStore.write(items); cartEvents.emit();
    },
    remove: id => { cartStore.write(cartStore.read().filter(i => i.productId !== id)); cartEvents.emit(); },
    update: (id, qty) => {
      if (qty < 1) return DB.cart.remove(id);
      cartStore.write(cartStore.read().map(i => i.productId === id ? { ...i, qty } : i)); cartEvents.emit();
    },
    clear:  () => { cartStore.write([]); cartEvents.emit(); },
    total:  () => cartStore.read().reduce((s, i) => s + i.price * i.qty, 0),
    count:  () => cartStore.read().reduce((s, i) => s + i.qty, 0),
  },

  // ── PAYMENT ──────────────────────────────────────────────────
  payment: {
    create: ({ orderId, amount, email }) => post('/payments/create', { orderId, amount, email }, true),
  },

  // ── SETTINGS ─────────────────────────────────────────────────
  settings: {
    get:    () => get('/settings'),
    update: data => put('/settings', data, true),
  },

  cartEvents,
};

// Expose Auth helpers matching auth.js interface
const Auth = {
  login:       DB.auth.login,
  register:    DB.auth.register,
  logout:      DB.auth.logout,
  requireAuth: (redirect = '/pages/auth.html') => {
    if (!DB.session.get()) {
      window.location.href = redirect + '?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  },
  requireAdmin: () => {
    if (!DB.session.isAdmin()) { window.location.href = '/index.html'; return false; }
    return true;
  },
};

window.DB   = DB;
window.Auth = Auth;
