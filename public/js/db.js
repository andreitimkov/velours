/**
 * VELOURS — Database Layer
 * ─────────────────────────────────────────────────────────────
 * Сейчас: localStorage (для демо и разработки без бэкенда)
 * 
 * Для продакшена замените методы на fetch() вызовы к API:
 *   GET    /api/products          → DB.products.getAll()
 *   GET    /api/products/:id      → DB.products.get(id)
 *   POST   /api/products          → DB.products.create(data)
 *   PUT    /api/products/:id      → DB.products.update(id, data)
 *   DELETE /api/products/:id      → DB.products.delete(id)
 * 
 * Рекомендуемый стек бэкенда:
 *   Node.js + Express + PostgreSQL (pg) + Multer (фото)
 *   или Supabase (hosted PostgreSQL + Storage + Auth)
 * ─────────────────────────────────────────────────────────────
 */

const DB = (() => {

  // ── helpers ──────────────────────────────────────────────
  const read  = key => JSON.parse(localStorage.getItem('vl_' + key) || 'null');
  const write = (key, val) => localStorage.setItem('vl_' + key, JSON.stringify(val));
  const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ── SEED ─────────────────────────────────────────────────
  function seed() {
    if (read('seeded')) return;

    write('categories', [
      { id: 'roses',   name: 'Розы',        icon: '🌹', sort: 1 },
      { id: 'mixed',   name: 'Миксы',       icon: '💐', sort: 2 },
      { id: 'mono',    name: 'Монобукеты',  icon: '🌸', sort: 3 },
      { id: 'premium', name: 'Премиум',     icon: '✨', sort: 4 },
      { id: 'dried',   name: 'Сухоцветы',   icon: '🌾', sort: 5 },
    ]);

    write('products', [
      { id: 'p1', name: 'Бархатный сад',   desc: 'Пионовидные розы Пиаже, лаванда, эвкалипт', price: 4800, category: 'roses',   active: true,  badge: 'hit',     image: null, sort: 1, createdAt: Date.now() },
      { id: 'p2', name: 'Утренний туман',  desc: 'Белые пионы, лизиантус, гипсофила',          price: 3600, category: 'mixed',   active: true,  badge: null,      image: null, sort: 2, createdAt: Date.now() },
      { id: 'p3', name: 'Фиолетовый этюд', desc: 'Лавандовые тюльпаны, ирисы, ежевика',       price: 5200, category: 'mono',    active: true,  badge: 'new',     image: null, sort: 3, createdAt: Date.now() },
      { id: 'p4', name: 'Золотой час',     desc: 'Желтые пионы, мимоза, ранункулюс, зелень',   price: 8900, category: 'premium', active: true,  badge: 'premium', image: null, sort: 4, createdAt: Date.now() },
      { id: 'p5', name: 'Алая страсть',    desc: 'Красные розы Эксплорер, 25 штук',            price: 3200, category: 'roses',   active: true,  badge: null,      image: null, sort: 5, createdAt: Date.now() },
      { id: 'p6', name: 'Небесный бриз',   desc: 'Синие ирисы, агапантус, делфиниум',          price: 6400, category: 'mixed',   active: true,  badge: null,      image: null, sort: 6, createdAt: Date.now() },
      { id: 'p7', name: 'Пастельный сон',  desc: 'Нежные пионы, фрезия, белая эустома',        price: 4200, category: 'mono',    active: true,  badge: null,      image: null, sort: 7, createdAt: Date.now() },
      { id: 'p8', name: 'Осенний закат',   desc: 'Сухоцветы, хлопок, лунария, ковыль',         price: 3800, category: 'dried',   active: true,  badge: 'new',     image: null, sort: 8, createdAt: Date.now() },
    ]);

    write('orders', [
      { id: 'ORD-001', userId: null, customerName: 'Анастасия К.', phone: '+7 916 123-45-67', address: 'Ленинский пр-т, 48, кв.12', items: [{productId:'p1',name:'Бархатный сад',price:4800,qty:1}], total: 4800, deliveryDate: '2024-12-20', deliveryTime: '14:00', status: 'done',     note: 'Позвонить за час', paymentStatus: 'paid',    paymentMethod: 'card', createdAt: Date.now()-86400000*2 },
      { id: 'ORD-002', userId: null, customerName: 'Михаил Р.',    phone: '+7 903 234-56-78', address: 'Тверская, 12',              items: [{productId:'p4',name:'Золотой час',price:8900,qty:1}], total: 8900, deliveryDate: '2024-12-21', deliveryTime: '16:30', status: 'delivery', note: '', paymentStatus: 'paid', paymentMethod: 'card', createdAt: Date.now()-86400000 },
      { id: 'ORD-003', userId: null, customerName: 'София Л.',     phone: '+7 925 345-67-89', address: 'Арбат, 24, кв.5',          items: [{productId:'p2',name:'Утренний туман',price:3600,qty:1},{productId:'p5',name:'Алая страсть',price:3200,qty:1}], total: 6800, deliveryDate: '2024-12-22', deliveryTime: '18:00', status: 'new',      note: 'Домофон не работает', paymentStatus: 'pending', paymentMethod: 'card', createdAt: Date.now()-3600000 },
    ]);

    write('users', [
      { id: 'u1', name: 'Администратор', email: 'admin@velours.ru', phone: '+7 495 000-00-00', role: 'admin', passwordHash: 'admin', addresses: [], createdAt: Date.now() }
    ]);

    write('settings', {
      shopName:      'Velours',
      phone:         '+7 (495) 123-45-67',
      email:         'hello@velours.ru',
      city:          'Москва',
      address:       'ул. Тверская, 12',
      deliveryPrice: 500,
      freeFrom:      3000,
      minLeadHours:  2,
      delivery24_7:  true,
      yookassaShopId:    '',   // ← вставьте shopId из ЮKassa
      yookassaReturnUrl: 'http://localhost:8080/pages/checkout.html?status=success',
      notifyEmail:   true,
      notifySMS:     true,
      notifyTelegram:false,
      dailyReport:   true,
    });

    write('seeded', true);
  }

  // ── CATEGORIES ───────────────────────────────────────────
  const categories = {
    getAll:  ()       => read('categories') || [],
    get:     id       => (read('categories') || []).find(c => c.id === id),
    create:  data     => {
      const cats = read('categories') || [];
      const item = { ...data, id: data.id || uid(), sort: cats.length + 1 };
      cats.push(item); write('categories', cats); return item;
    },
    update:  (id, d)  => {
      const cats = (read('categories') || []).map(c => c.id === id ? { ...c, ...d } : c);
      write('categories', cats);
      return cats.find(c => c.id === id);
    },
    delete:  id       => {
      write('categories', (read('categories') || []).filter(c => c.id !== id));
    },
  };

  // ── PRODUCTS ─────────────────────────────────────────────
  const products = {
    getAll:   (filter = {}) => {
      let list = read('products') || [];
      if (filter.category) list = list.filter(p => p.category === filter.category);
      if (filter.active !== undefined) list = list.filter(p => p.active === filter.active);
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      }
      return list.sort((a, b) => a.sort - b.sort);
    },
    get:      id => (read('products') || []).find(p => p.id === id),
    create:   data => {
      const prods = read('products') || [];
      const item = { ...data, id: uid(), createdAt: Date.now(), sort: prods.length + 1 };
      prods.push(item); write('products', prods); return item;
    },
    update:   (id, data) => {
      const prods = (read('products') || []).map(p => p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p);
      write('products', prods);
      return prods.find(p => p.id === id);
    },
    delete:   id => { write('products', (read('products') || []).filter(p => p.id !== id)); },
    reorder:  ids => {
      const prods = read('products') || [];
      ids.forEach((id, i) => { const p = prods.find(p => p.id === id); if (p) p.sort = i; });
      write('products', prods);
    },
  };

  // ── ORDERS ───────────────────────────────────────────────
  const orders = {
    getAll:   (filter = {}) => {
      let list = read('orders') || [];
      if (filter.userId)   list = list.filter(o => o.userId === filter.userId);
      if (filter.status)   list = list.filter(o => o.status === filter.status);
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(o =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q)
        );
      }
      return list.sort((a, b) => b.createdAt - a.createdAt);
    },
    get:      id => (read('orders') || []).find(o => o.id === id),
    create:   data => {
      const list = read('orders') || [];
      const num = String(list.length + 1).padStart(3, '0');
      const item = { ...data, id: 'ORD-' + num, createdAt: Date.now(), status: 'new', paymentStatus: 'pending' };
      list.unshift(item); write('orders', list); return item;
    },
    update:   (id, data) => {
      const list = (read('orders') || []).map(o => o.id === id ? { ...o, ...data } : o);
      write('orders', list);
      return list.find(o => o.id === id);
    },
    delete:   id => { write('orders', (read('orders') || []).filter(o => o.id !== id)); },
    stats:    () => {
      const list = read('orders') || [];
      const today = new Date().toDateString();
      return {
        total:        list.length,
        todayCount:   list.filter(o => new Date(o.createdAt).toDateString() === today).length,
        todayRevenue: list.filter(o => new Date(o.createdAt).toDateString() === today && o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
        byStatus:     { new: 0, confirmed: 0, delivery: 0, done: 0, cancelled: 0, ...Object.fromEntries(Object.entries(list.reduce((acc, o) => { acc[o.status] = (acc[o.status]||0)+1; return acc; }, {}))) },
      };
    },
  };

  // ── USERS ────────────────────────────────────────────────
  const users = {
    getAll:  ()     => read('users') || [],
    get:     id     => (read('users') || []).find(u => u.id === id),
    findByEmail: email => (read('users') || []).find(u => u.email.toLowerCase() === email.toLowerCase()),
    create:  data   => {
      const list = read('users') || [];
      if (list.find(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Email уже используется');
      const item = { ...data, id: uid(), role: 'customer', addresses: [], favorites: [], createdAt: Date.now() };
      list.push(item); write('users', list); return item;
    },
    update:  (id, data) => {
      const list = (read('users') || []).map(u => u.id === id ? { ...u, ...data } : u);
      write('users', list);
      return list.find(u => u.id === id);
    },
    delete:  id => { write('users', (read('users') || []).filter(u => u.id !== id)); },
    addAddress: (userId, addr) => {
      const u = users.get(userId); if (!u) return;
      const addresses = [...(u.addresses||[]), { id: uid(), ...addr }];
      return users.update(userId, { addresses });
    },
    removeAddress: (userId, addrId) => {
      const u = users.get(userId); if (!u) return;
      return users.update(userId, { addresses: u.addresses.filter(a => a.id !== addrId) });
    },
  };

  // ── SETTINGS ─────────────────────────────────────────────
  const settings = {
    get:    ()   => read('settings') || {},
    update: data => { write('settings', { ...settings.get(), ...data }); return settings.get(); },
  };

  // ── AUTH SESSION ─────────────────────────────────────────
  const session = {
    get:   ()     => read('session'),
    set:   user   => write('session', { userId: user.id, role: user.role, name: user.name, email: user.email }),
    clear: ()     => localStorage.removeItem('vl_session'),
    isAdmin: ()   => session.get()?.role === 'admin',
    user:  ()     => { const s = session.get(); return s ? users.get(s.userId) : null; },
  };

  // ── CART ─────────────────────────────────────────────────
  const cart = {
    get:    ()         => read('cart') || [],
    add:    (product, qty = 1) => {
      const items = cart.get();
      const exist = items.find(i => i.productId === product.id);
      if (exist) exist.qty += qty;
      else items.push({ productId: product.id, name: product.name, price: product.price, image: product.image, qty });
      write('cart', items);
      cartEvents.emit();
    },
    remove: id         => { write('cart', cart.get().filter(i => i.productId !== id)); cartEvents.emit(); },
    update: (id, qty)  => {
      if (qty < 1) return cart.remove(id);
      write('cart', cart.get().map(i => i.productId === id ? { ...i, qty } : i));
      cartEvents.emit();
    },
    clear:  ()         => { write('cart', []); cartEvents.emit(); },
    total:  ()         => cart.get().reduce((s, i) => s + i.price * i.qty, 0),
    count:  ()         => cart.get().reduce((s, i) => s + i.qty, 0),
  };

  const cartEvents = {
    listeners: [],
    on:   fn  => cartEvents.listeners.push(fn),
    emit: ()  => cartEvents.listeners.forEach(fn => fn(cart.get())),
  };

  // ── PAYMENT (YooKassa scaffold) ───────────────────────────
  /**
   * BACKEND REQUIRED для реальных платежей:
   * POST /api/payments/create  → { paymentToken, paymentId }
   * 
   * Пример Node.js (yookassa npm package):
   *   const { YooCheckout } = require('@a2seven/yoo-checkout');
   *   const checkout = new YooCheckout({ shopId, secretKey });
   *   const payment = await checkout.createPayment({
   *     amount: { value: total.toFixed(2), currency: 'RUB' },
   *     confirmation: { type: 'embedded' },
   *     description: `Заказ Velours ${orderId}`,
   *     capture: true,
   *   });
   *   return { token: payment.confirmation.confirmation_token, paymentId: payment.id };
   */
  const payment = {
    // В демо просто имитируем создание платежа
    create: async ({ orderId, amount, email }) => {
      console.log('[YooKassa] Создание платежа:', { orderId, amount, email });
      // TODO: fetch('/api/payments/create', { method:'POST', body: JSON.stringify({orderId,amount,email}) })
      return { token: 'demo_token_' + uid(), paymentId: 'pay_' + uid() };
    },
    // Вызывается по webhook от YooKassa: POST /api/payments/webhook
    confirm: async (paymentId) => {
      console.log('[YooKassa] Подтверждение платежа:', paymentId);
      return { status: 'succeeded' };
    },
  };

  // ── REVIEWS ──────────────────────────────────────────────
  const reviews = {
    getAll: (filter = {}) => {
      let list = read('reviews') || [];
      if (filter.productId) list = list.filter(r => r.productId === filter.productId);
      return list.sort((a, b) => b.createdAt - a.createdAt);
    },
    create: data => {
      const list = read('reviews') || [];
      const item = { ...data, id: uid(), createdAt: Date.now() };
      list.unshift(item); write('reviews', list); return item;
    },
  };

  // INIT
  seed();

  return { categories, products, orders, users, session, cart, cartEvents, settings, payment, reviews, uid };

})();

window.DB = DB;
