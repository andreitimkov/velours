/**
 * VELOURS — Cart Widget
 * Плавающая корзина + иконка в навигации
 */
const CartWidget = (() => {
  let el = null;

  const init = () => {
    injectHTML();
    el = document.getElementById('cartDrawer');
    bindEvents();
    DB.cartEvents.on(render);
    render(DB.cart.get());
    updateNavBadge();
  };

  const injectHTML = () => {
    document.body.insertAdjacentHTML('beforeend', `
      <!-- Cart Drawer -->
      <div class="cart-overlay" id="cartOverlay"></div>
      <div class="cart-drawer" id="cartDrawer">
        <div class="cart-drawer__header">
          <h3 class="cart-drawer__title">Корзина</h3>
          <button class="cart-drawer__close" id="cartClose">✕</button>
        </div>
        <div class="cart-drawer__body" id="cartBody"></div>
        <div class="cart-drawer__footer" id="cartFooter"></div>
      </div>
    `);
  };

  const open  = () => { el?.classList.add('open'); document.getElementById('cartOverlay')?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { el?.classList.remove('open'); document.getElementById('cartOverlay')?.classList.remove('open'); document.body.style.overflow = ''; };

  const bindEvents = () => {
    document.getElementById('cartClose')?.addEventListener('click', close);
    document.getElementById('cartOverlay')?.addEventListener('click', close);
    document.addEventListener('click', async e => {
      if (e.target.closest('[data-open-cart]')) open();
      if (e.target.closest('[data-add-cart]')) {
        const btn = e.target.closest('[data-add-cart]');
        const id = btn.dataset.addCart;
        try {
          const product = await DB.products.get(id);
          if (product) { DB.cart.add(product); open(); showAddedFeedback(btn); }
        } catch(err) { console.error('add to cart', err); }
      }
    });
  };

  const showAddedFeedback = btn => {
    const orig = btn.textContent;
    btn.textContent = '✓ Добавлено';
    btn.style.background = 'var(--green)';
    btn.style.color = 'var(--cream)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 1500);
  };

  const render = async items => {
    updateNavBadge();
    const body   = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    if (!body || !footer) return;

    if (!items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon">🌸</div>
          <p>Корзина пуста</p>
          <a href="/index.html#catalog" class="btn btn--outline" style="margin-top:16px">Выбрать букет</a>
        </div>`;
      footer.innerHTML = '';
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.productId}">
        <div class="cart-item__img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" />`
            : `<div class="cart-item__placeholder">🌹</div>`}
        </div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${(item.price).toLocaleString('ru')} ₽</div>
        </div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-qty-dec="${item.productId}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-qty-inc="${item.productId}">+</button>
        </div>
        <button class="cart-item__remove" data-remove="${item.productId}">✕</button>
      </div>
    `).join('');

    let deliverySettings = { freeFrom: 3000, deliveryPrice: 500 };
    try { const s = await DB.settings.get(); deliverySettings = { freeFrom: parseInt(s.free_from||s.freeFrom)||3000, deliveryPrice: parseInt(s.delivery_price||s.deliveryPrice)||500 }; } catch(e) {}
    const total    = DB.cart.total();
    const delivery = total >= deliverySettings.freeFrom ? 0 : deliverySettings.deliveryPrice;
    const grand    = total + delivery;

    footer.innerHTML = `
      <div class="cart-totals">
        <div class="cart-total-row"><span>Букеты</span><span>${total.toLocaleString('ru')} ₽</span></div>
        <div class="cart-total-row">
          <span>Доставка</span>
          <span>${delivery === 0 ? '<span style="color:var(--success)">Бесплатно</span>' : delivery.toLocaleString('ru') + ' ₽'}</span>
        </div>
        ${total < deliverySettings.freeFrom ? `<div class="cart-free-hint">До бесплатной доставки: ${(deliverySettings.freeFrom - total).toLocaleString('ru')} ₽</div>` : ''}
        <div class="cart-total-row cart-total-row--grand"><span>Итого</span><span>${grand.toLocaleString('ru')} ₽</span></div>
      </div>
      <a href="/pages/checkout.html" class="btn btn--primary btn--full cart-checkout-btn">Оформить заказ</a>
      <button class="cart-clear-btn" id="cartClear">Очистить корзину</button>
    `;

    // events
    body.querySelectorAll('[data-qty-dec]').forEach(b => b.addEventListener('click', () => {
      const item = DB.cart.get().find(i => i.productId === b.dataset.qtyDec);
      if (item) DB.cart.update(item.productId, item.qty - 1);
    }));
    body.querySelectorAll('[data-qty-inc]').forEach(b => b.addEventListener('click', () => {
      const item = DB.cart.get().find(i => i.productId === b.dataset.qtyInc);
      if (item) DB.cart.update(item.productId, item.qty + 1);
    }));
    body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => DB.cart.remove(b.dataset.remove)));
    document.getElementById('cartClear')?.addEventListener('click', () => {
      if (confirm('Очистить корзину?')) DB.cart.clear();
    });
  };

  const updateNavBadge = () => {
    const count = DB.cart.count();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  };

  return { init, open, close };
})();

window.CartWidget = CartWidget;
