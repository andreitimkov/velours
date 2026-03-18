/* ========================================
   VELOURS — Main Site JS v2
   ======================================== */

// ── CURSOR ─────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mx=0,my=0,fx=0,fy=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cursor.style.left=mx+'px'; cursor.style.top=my+'px';
});
(function af(){fx+=(mx-fx)*.1;fy+=(my-fy)*.1;follower.style.left=fx+'px';follower.style.top=fy+'px';requestAnimationFrame(af)})();

document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.style.transform='translate(-50%,-50%) scale(2)';cursor.style.background='var(--gold-lt)'});
  el.addEventListener('mouseleave',()=>{cursor.style.transform='translate(-50%,-50%) scale(1)';cursor.style.background='var(--gold)'});
});

// ── LOADER ─────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 900);
});

// ── NAV SCROLL ─────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 60), {passive:true});

// ── MOBILE MENU ────────────────────────────
document.getElementById('burgerBtn')?.addEventListener('click', () => document.getElementById('mobileMenu')?.classList.add('open'));
document.getElementById('menuClose')?.addEventListener('click', () => document.getElementById('mobileMenu')?.classList.remove('open'));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => document.getElementById('mobileMenu')?.classList.remove('open')));

// ── AUTH NAV ───────────────────────────────
function updateAuthNav() {
  const sess = DB.session.get();
  const loginBtn   = document.getElementById('navLoginBtn');
  const userBtn    = document.getElementById('navUserBtn');
  const userName   = document.getElementById('navUserName');
  const userAvatar = document.getElementById('navUserAvatar');
  if (sess) {
    loginBtn?.style && (loginBtn.style.display = 'none');
    if (userBtn) userBtn.style.display = 'flex';
    if (userName) userName.textContent = sess.name?.split(' ')[0] || 'Кабинет';
    if (userAvatar) userAvatar.textContent = (sess.name||'?')[0].toUpperCase();
  } else {
    loginBtn?.style && (loginBtn.style.display = '');
    if (userBtn) userBtn.style.display = 'none';
  }
}
updateAuthNav();

// ── STATS COUNTER ──────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target) || 0;
  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now-start)/duration, 1);
    const ease = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(target * ease).toLocaleString('ru');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── REVEAL ─────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay) || 0;
      setTimeout(() => {
        e.target.classList.add('visible');
        // If this element itself is a counter, animate it
        if ('counter' in e.target.dataset) animateCounter(e.target);
        // Also animate any counter children (e.g. inside a .reveal wrapper)
        e.target.querySelectorAll('[data-counter]').forEach(animateCounter);
      }, delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
// Observe .reveal elements; counter spans are handled via their parent reveal
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
// Also observe standalone counters not inside a .reveal
document.querySelectorAll('[data-counter]').forEach(el => {
  if (!el.closest('.reveal')) revealObserver.observe(el);
});

// ── CATALOG ────────────────────────────────
async function renderCatalog(categoryFilter = 'all') {
  const grid    = document.getElementById('catalogGrid');
  if (!grid) return;
  try {
  const products = await DB.products.getAll({ active: true });
  const sess     = DB.session.get();

  // filter
  const filtered = categoryFilter === 'all' ? products : products.filter(p => p.category === categoryFilter);

  if (!filtered.length) {
    grid.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted);grid-column:1/-1">Товаров нет</div>';
    return;
  }

  const BADGE_LABEL = { hit:'🔥 Хит', new:'✨ Новинка', premium:'💎 Премиум', sale:'🏷 Скидка' };

  grid.innerHTML = filtered.map(p => `
    <div class="product-card reveal" data-category="${p.category}">
      <div class="product-card__visual">
        <div class="product-card__img">
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
            : `<svg viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg" width="100" style="opacity:.5">${flowerSVG(p.category)}</svg>`}
        </div>
        ${p.badge ? `<div class="product-card__badge product-card__badge--${p.badge}">${BADGE_LABEL[p.badge]||p.badge}</div>` : ''}
        <div class="product-card__actions">
          <button class="product-card__quick-btn" data-add-cart="${p.id}">В корзину</button>
          <button class="product-card__fav-btn${favs.includes(p.id)?' active':''}" data-fav="${p.id}" title="В избранное">♡</button>
        </div>
      </div>
      <div class="product-card__info">
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__desc">${p.desc||''}</div>
        <div class="product-card__footer">
          <div class="product-card__price">
            ${p.oldPrice ? `<span style="text-decoration:line-through;font-size:.8rem;opacity:.5;margin-right:8px">${p.oldPrice.toLocaleString('ru')} ₽</span>` : ''}
            ${p.price.toLocaleString('ru')} ₽
          </div>
          <button class="product-card__btn" data-add-cart="${p.id}">+ Корзина</button>
        </div>
      </div>
    </div>
  `).join('');

  // re-observe new cards
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // fav buttons
  grid.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sess = DB.session.get();
      if (!sess) { window.location.href='/pages/auth.html?redirect=/#catalog'; return; }
      try {
        const user = await DB.users.me();
        const favs = user.favorites || [];
        const id   = btn.dataset.fav;
        const newFavs = favs.includes(id) ? favs.filter(f=>f!==id) : [...favs, id];
        await DB.users.update({ favorites: newFavs });
        btn.classList.toggle('active', newFavs.includes(id));
        btn.textContent = newFavs.includes(id) ? '♥' : '♡';
        showToast(newFavs.includes(id) ? '♥ Добавлено в избранное' : '♡ Удалено из избранного');
      } catch(e) { console.error(e); }
    });
  });
  } catch(e) { console.error('renderCatalog', e); }
}

function flowerSVG(cat) {
  const colors = { roses:'#c85c5c', mixed:'#9b5ea2', mono:'#5c8cc8', premium:'#c9a96e', dried:'#b8946a' };
  const col = colors[cat] || colors.mixed;
  return `<ellipse cx="90" cy="140" rx="60" ry="80" fill="${col}22"/><circle cx="90" cy="90" r="35" fill="${col}44"/><circle cx="90" cy="90" r="20" fill="${col}88"/>`;
}

// ── CATALOG FILTERS ─────────────────────────
async function initCatalogFilters() {
  const filterWrap = document.getElementById('catalogFilters');
  if (!filterWrap) return;

  // populate dynamic category filters from DB
  const cats = await DB.categories.getAll();
  filterWrap.innerHTML = `<button class="filter-btn active" data-filter="all">Все</button>` +
    cats.map(c => `<button class="filter-btn" data-filter="${c.id}">${c.icon} ${c.name}</button>`).join('');

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCatalog(btn.dataset.filter);
  });

  renderCatalog('all');
}

// ── REVIEWS SLIDER ──────────────────────────
function initReviews() {
  const cards = document.querySelectorAll('.review-card');
  const dots  = document.querySelectorAll('.dot');
  if (!cards.length) return;
  let idx = 0;

  function show(i) {
    cards.forEach((c,j) => c.classList.toggle('active', j===i));
    dots.forEach((d,j) => d.classList.toggle('active', j===i));
    idx = i;
  }

  document.querySelector('.reviews-prev')?.addEventListener('click', () => show((idx-1+cards.length)%cards.length));
  document.querySelector('.reviews-next')?.addEventListener('click', () => show((idx+1)%cards.length));
  dots.forEach((d,i) => d.addEventListener('click', () => show(i)));
  setInterval(() => show((idx+1)%cards.length), 5000);
}

// ── HERO ORDER MODAL ────────────────────────
function initQuickOrder() {
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-quick-order]');
    if (!btn) return;
    const id  = btn.dataset.quickOrder;
    try {
      const p = await DB.products.get(id);
      if (p) {
        document.getElementById('quickModalProduct').textContent = p.name;
        document.getElementById('quickModal')?.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    } catch(e) { console.error(e); }
  });
  document.querySelector('#quickModal .modal-close')?.addEventListener('click', () => {
    document.getElementById('quickModal')?.classList.remove('open');
    document.body.style.overflow = '';
  });
  document.getElementById('quickOrderForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('qName').value;
    const phone = document.getElementById('qPhone').value;
    const pName = document.getElementById('quickModalProduct').textContent;
    try {
      await DB.orders.create({
        customerName: name,
        phone,
        items: [],
        total: 0,
        deliveryDate: '',
        deliveryTime: '',
        address: 'Уточнить',
        note: `Быстрый заказ: ${pName}`,
        paymentMethod: 'pending',
      });
    } catch(e) { console.error(e); }
    document.getElementById('quickModal').classList.remove('open');
    document.body.style.overflow = '';
    showToast('✓ Заявка принята! Мы перезвоним вам.');
    e.target.reset();
  });
}

// ── MAIN ORDER FORM ─────────────────────────
function initOrderForm() {
  document.getElementById('mainOrderForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      customerName: document.getElementById('oName').value,
      phone:        document.getElementById('oPhone').value,
      address:      document.getElementById('oAddress').value,
      deliveryDate: document.getElementById('oDate').value,
      deliveryTime: document.getElementById('oTime').value,
      note:         document.getElementById('oNote').value,
      items:        DB.cart.get().length ? DB.cart.get() : [],
      total:        DB.cart.total() || 0,
      paymentMethod:'pending',
      paymentStatus:'pending',
      userId:       DB.session.get()?.userId || null,
    };
    try {
      const order = await DB.orders.create(data);
      showToast(`✓ Заказ ${order.id} принят! Ожидайте звонка.`);
    } catch(err) {
      showToast('✓ Заявка отправлена!');
    }
    e.target.reset();
    DB.cart.clear();
  });
}

// ── TOAST ───────────────────────────────────
let toastTimer;
function showToast(msg, type='') {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (type?' toast--'+type:'');
  t.classList.add('show');
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3500);
}
window.showToast = showToast;

// ── SMOOTH SCROLL ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});

// ── INIT ALL ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  CartWidget.init();
  initCatalogFilters();
  initReviews();
  initQuickOrder();
  initOrderForm();
  updateAuthNav();
});
