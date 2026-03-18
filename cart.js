<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Velours — Оформление заказа</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../css/pages.css"/>
  <style>
    .checkout-layout{display:grid;grid-template-columns:1fr 380px;gap:32px;align-items:start}
    .checkout-steps{display:flex;gap:0;margin-bottom:32px}
    .checkout-step{display:flex;align-items:center;gap:10px;flex:1}
    .checkout-step__num{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.8rem;color:var(--text-muted);flex-shrink:0;transition:all .3s}
    .checkout-step__label{font-size:.78rem;letter-spacing:.05em;color:var(--text-muted);transition:color .3s}
    .checkout-step.active .checkout-step__num{background:var(--gold);border-color:var(--gold);color:var(--bg)}
    .checkout-step.active .checkout-step__label{color:var(--cream)}
    .checkout-step.done .checkout-step__num{background:var(--green);border-color:var(--green);color:#fff}
    .checkout-step-line{flex:1;height:1px;background:var(--border);margin:0 12px}

    /* Order summary */
    .order-summary{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;position:sticky;top:88px}
    .order-summary__title{font-family:var(--font-display);font-size:1.4rem;font-weight:300;color:var(--cream);margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)}
    .summary-item{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)}
    .summary-item:last-of-type{border-bottom:none}
    .summary-item__img{width:52px;height:52px;border-radius:8px;background:var(--bg-3);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.6rem;overflow:hidden}
    .summary-item__img img{width:100%;height:100%;object-fit:cover}
    .summary-item__info{flex:1;min-width:0}
    .summary-item__name{font-size:.88rem;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .summary-item__qty{font-size:.75rem;color:var(--text-muted);margin-top:2px}
    .summary-item__price{font-family:var(--font-display);font-size:1rem;color:var(--gold);flex-shrink:0}
    .summary-totals{margin-top:16px}
    .summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:.86rem;color:var(--text-muted)}
    .summary-row--total{font-family:var(--font-display);font-size:1.3rem;color:var(--cream);border-top:1px solid var(--border);padding-top:12px;margin-top:4px}
    .free-delivery-hint{font-size:.75rem;color:var(--gold);text-align:center;padding:8px;background:rgba(201,169,110,.08);border-radius:8px;margin-top:8px}
    .promo-wrap{display:flex;gap:8px;margin-top:16px}
    .promo-wrap .f-input{flex:1}
    .promo-wrap button{white-space:nowrap;padding:12px 16px;border-radius:8px;background:var(--bg-2);border:1px solid var(--border);color:var(--text-muted);font-size:.78rem;transition:all .2s}
    .promo-wrap button:hover{border-color:var(--gold);color:var(--gold)}

    /* Step panels */
    .step-panel{display:none}
    .step-panel.active{display:block;animation:fadeUp .3s var(--ease-out)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

    /* Delivery options */
    .delivery-options{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
    .delivery-opt{display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:all .2s}
    .delivery-opt:hover,.delivery-opt.active{border-color:var(--gold);background:rgba(201,169,110,.05)}
    .delivery-opt input{accent-color:var(--gold)}
    .delivery-opt__info{flex:1}
    .delivery-opt__label{font-size:.9rem;color:var(--cream)}
    .delivery-opt__desc{font-size:.76rem;color:var(--text-muted);margin-top:2px}
    .delivery-opt__price{font-family:var(--font-display);font-size:1rem;color:var(--gold)}

    /* Saved addresses */
    .saved-addresses{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
    .saved-addr-btn{padding:6px 14px;border-radius:20px;background:none;border:1px solid var(--border);font-size:.75rem;color:var(--text-muted);cursor:pointer;transition:all .2s}
    .saved-addr-btn:hover,.saved-addr-btn.active{border-color:var(--gold);color:var(--gold);background:rgba(201,169,110,.05)}

    /* Payment methods */
    .payment-methods{display:flex;flex-direction:column;gap:12px;margin-bottom:24px}
    .pay-method{display:flex;align-items:center;gap:14px;padding:18px 20px;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:all .2s}
    .pay-method:hover,.pay-method.active{border-color:var(--gold);background:rgba(201,169,110,.05)}
    .pay-method input{accent-color:var(--gold);flex-shrink:0}
    .pay-method__icon{font-size:1.5rem;flex-shrink:0}
    .pay-method__info{flex:1}
    .pay-method__label{font-size:.9rem;color:var(--cream)}
    .pay-method__desc{font-size:.76rem;color:var(--text-muted);margin-top:2px}

    /* YooKassa widget */
    #yookassa-widget{margin-bottom:20px;border-radius:12px;overflow:hidden}
    .yookassa-placeholder{background:var(--bg-2);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center}
    .yookassa-placeholder p{color:var(--text-muted);font-size:.85rem;margin-top:8px}
    .yookassa-placeholder .spinner{width:32px;height:32px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* Step navigation */
    .step-nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px}

    /* Success screen */
    .success-screen{text-align:center;padding:60px 20px;display:none}
    .success-screen.show{display:block;animation:fadeUp .5s var(--ease-out)}
    .success-icon{width:80px;height:80px;background:rgba(74,170,106,.15);border:1px solid rgba(74,170,106,.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 24px}
    .success-title{font-family:var(--font-display);font-size:2.5rem;font-weight:300;color:var(--cream);margin-bottom:8px}
    .success-sub{color:var(--text-muted);font-size:.9rem;line-height:1.7;max-width:440px;margin:0 auto 32px}

    @media(max-width:900px){.checkout-layout{grid-template-columns:1fr}}
    @media(max-width:600px){.checkout-steps{gap:4px}.checkout-step__label{display:none}}
  </style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-follower" id="cursor-follower"></div>

<nav class="page-nav">
  <a href="../index.html" class="page-nav-logo">Velours</a>
  <div class="page-nav-right">
    <a href="../pages/cabinet.html" class="page-nav-link" id="navCabinet">Кабинет</a>
    <a href="../pages/auth.html" class="page-nav-link" id="navLogin">Войти</a>
  </div>
</nav>

<!-- SUCCESS SCREEN -->
<div class="page-wrap page-wrap--narrow">
  <div class="success-screen" id="successScreen">
    <div class="success-icon">✓</div>
    <h1 class="success-title">Заказ оформлен!</h1>
    <p class="success-sub" id="successText">Мы свяжемся с вами в ближайшее время для подтверждения заказа. Ожидайте звонка или SMS.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="../pages/cabinet.html" class="btn btn--primary">Мои заказы</a>
      <a href="../index.html#catalog" class="btn btn--outline">Продолжить покупки</a>
    </div>
  </div>
</div>

<!-- CHECKOUT FORM -->
<div class="page-wrap page-wrap--wide" id="checkoutWrap">
  <div class="page-header-block">
    <h1>Оформление <em>заказа</em></h1>
  </div>

  <!-- Steps -->
  <div class="checkout-steps">
    <div class="checkout-step active" id="step-indicator-1">
      <div class="checkout-step__num">1</div>
      <div class="checkout-step__label">Доставка</div>
    </div>
    <div class="checkout-step-line"></div>
    <div class="checkout-step" id="step-indicator-2">
      <div class="checkout-step__num">2</div>
      <div class="checkout-step__label">Получатель</div>
    </div>
    <div class="checkout-step-line"></div>
    <div class="checkout-step" id="step-indicator-3">
      <div class="checkout-step__num">3</div>
      <div class="checkout-step__label">Оплата</div>
    </div>
  </div>

  <div class="checkout-layout">
    <!-- LEFT: Form steps -->
    <div>
      <!-- STEP 1: Delivery -->
      <div class="step-panel active" id="step1">
        <div class="card" style="margin-bottom:20px">
          <div class="card-title">Способ доставки</div>
          <div class="delivery-options">
            <label class="delivery-opt active">
              <input type="radio" name="deliveryType" value="courier" checked />
              <div class="delivery-opt__info">
                <div class="delivery-opt__label">🚚 Курьерская доставка</div>
                <div class="delivery-opt__desc">В течение 2 часов в любую точку Москвы</div>
              </div>
              <div class="delivery-opt__price" id="courierPrice">500 ₽</div>
            </label>
            <label class="delivery-opt">
              <input type="radio" name="deliveryType" value="express" />
              <div class="delivery-opt__info">
                <div class="delivery-opt__label">⚡ Экспресс-доставка</div>
                <div class="delivery-opt__desc">В течение 1 часа</div>
              </div>
              <div class="delivery-opt__price">900 ₽</div>
            </label>
            <label class="delivery-opt">
              <input type="radio" name="deliveryType" value="pickup" />
              <div class="delivery-opt__info">
                <div class="delivery-opt__label">🏪 Самовывоз</div>
                <div class="delivery-opt__desc">ул. Тверская, 12 — с 9:00 до 21:00</div>
              </div>
              <div class="delivery-opt__price" style="color:var(--success)">Бесплатно</div>
            </label>
          </div>
        </div>

        <div class="card" id="deliveryAddressCard">
          <div class="card-title">Адрес доставки</div>
          <div id="savedAddresses" style="display:none">
            <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px">Мои адреса:</p>
            <div class="saved-addresses" id="savedAddrBtns"></div>
          </div>
          <div class="f-group"><label class="f-label">Улица и дом *</label><input type="text" class="f-input" id="delStreet" placeholder="ул. Тверская, 12" required /></div>
          <div class="f-row">
            <div class="f-group"><label class="f-label">Квартира</label><input type="text" class="f-input" id="delApt" placeholder="45" /></div>
            <div class="f-group"><label class="f-label">Этаж</label><input type="text" class="f-input" id="delFloor" placeholder="3" /></div>
          </div>
          <div class="f-row">
            <div class="f-group"><label class="f-label">Дата доставки *</label><input type="date" class="f-input" id="delDate" required /></div>
            <div class="f-group"><label class="f-label">Время доставки *</label>
              <select class="f-select" id="delTime">
                <option value="">Выберите время</option>
                <option>09:00–11:00</option><option>11:00–13:00</option>
                <option>13:00–15:00</option><option>15:00–17:00</option>
                <option>17:00–19:00</option><option>19:00–21:00</option>
                <option>21:00–23:00</option>
              </select>
            </div>
          </div>
          <div class="f-group"><label class="f-label">Комментарий курьеру</label><input type="text" class="f-input" id="delComment" placeholder="Домофон, этаж, пожелания..." /></div>
        </div>

        <div class="step-nav">
          <a href="../index.html#catalog" class="btn btn--ghost">← Каталог</a>
          <button class="btn btn--primary" id="toStep2">Далее: Получатель →</button>
        </div>
      </div>

      <!-- STEP 2: Recipient -->
      <div class="step-panel" id="step2">
        <div class="card">
          <div class="card-title">Данные получателя</div>
          <div class="f-group">
            <label class="f-check" style="margin-bottom:16px">
              <input type="checkbox" id="recipientIsSelf" checked />
              Получаю сам(а)
            </label>
          </div>
          <div class="f-row">
            <div class="f-group"><label class="f-label">Имя получателя *</label><input type="text" class="f-input" id="recName" required /></div>
            <div class="f-group"><label class="f-label">Телефон получателя *</label><input type="tel" class="f-input" id="recPhone" required /></div>
          </div>
          <div class="f-group">
            <label class="f-label">Открытка (текст)</label>
            <textarea class="f-input" id="cardText" style="height:90px;resize:vertical" placeholder="Текст поздравления на открытке..."></textarea>
          </div>
          <div class="divider"></div>
          <div class="card-title" style="font-size:1rem">Ваши данные (для связи)</div>
          <div class="f-row">
            <div class="f-group"><label class="f-label">Ваше имя *</label><input type="text" class="f-input" id="senderName" required /></div>
            <div class="f-group"><label class="f-label">Ваш телефон *</label><input type="tel" class="f-input" id="senderPhone" required /></div>
          </div>
          <div class="f-group"><label class="f-label">Email для чека</label><input type="email" class="f-input" id="senderEmail" /></div>
        </div>
        <div class="step-nav">
          <button class="btn btn--ghost" id="backToStep1">← Назад</button>
          <button class="btn btn--primary" id="toStep3">Далее: Оплата →</button>
        </div>
      </div>

      <!-- STEP 3: Payment -->
      <div class="step-panel" id="step3">
        <div class="card" style="margin-bottom:20px">
          <div class="card-title">Способ оплаты</div>
          <div class="payment-methods">
            <label class="pay-method active">
              <input type="radio" name="paymentMethod" value="card_online" checked />
              <div class="pay-method__icon">💳</div>
              <div class="pay-method__info">
                <div class="pay-method__label">Банковская карта онлайн</div>
                <div class="pay-method__desc">Visa, Mastercard, МИР — через ЮKassa</div>
              </div>
            </label>
            <label class="pay-method">
              <input type="radio" name="paymentMethod" value="sbp" />
              <div class="pay-method__icon">📱</div>
              <div class="pay-method__info">
                <div class="pay-method__label">СБП — Система быстрых платежей</div>
                <div class="pay-method__desc">Перевод по QR-коду или номеру телефона</div>
              </div>
            </label>
            <label class="pay-method">
              <input type="radio" name="paymentMethod" value="yoomoney" />
              <div class="pay-method__icon">🟡</div>
              <div class="pay-method__info">
                <div class="pay-method__label">ЮMoney</div>
                <div class="pay-method__desc">Оплата через ЮMoney кошелёк</div>
              </div>
            </label>
            <label class="pay-method">
              <input type="radio" name="paymentMethod" value="cash" />
              <div class="pay-method__icon">💵</div>
              <div class="pay-method__info">
                <div class="pay-method__label">Наличными курьеру</div>
                <div class="pay-method__desc">Оплата при получении заказа</div>
              </div>
            </label>
          </div>

          <!-- YooKassa Widget area -->
          <div id="yookassa-widget">
            <div class="yookassa-placeholder" id="ykPlaceholder">
              <div class="spinner"></div>
              <p>Виджет оплаты ЮKassa<br>
              <span style="font-size:.72rem;opacity:.6">Для активации добавьте shopId в настройки<br>POST /api/payments/create → получите confirmation_token</span></p>
            </div>
          </div>

          <!-- ЮKassa connection note -->
          <div style="background:rgba(201,169,110,.06);border:1px solid rgba(201,169,110,.2);border-radius:10px;padding:14px;font-size:.78rem;color:var(--text-muted);line-height:1.6">
            🔐 <strong style="color:var(--gold)">Подключение ЮKassa:</strong><br>
            1. Зарегистрируйтесь на <a href="https://yookassa.ru" target="_blank" style="color:var(--gold)">yookassa.ru</a><br>
            2. Добавьте <code style="background:var(--bg-2);padding:2px 6px;border-radius:4px">shopId</code> и <code style="background:var(--bg-2);padding:2px 6px;border-radius:4px">secretKey</code> в настройки<br>
            3. Создайте endpoint <code style="background:var(--bg-2);padding:2px 6px;border-radius:4px">POST /api/payments/create</code><br>
            4. Инициализируйте виджет: <code style="background:var(--bg-2);padding:2px 6px;border-radius:4px">new window.YooMoneyCheckoutWidget({...})</code>
          </div>
        </div>

        <div class="card">
          <div class="f-group" style="margin-bottom:0">
            <label class="f-check">
              <input type="checkbox" id="agreeTerms" required />
              Я согласен(а) с <a href="#">условиями доставки</a> и <a href="#">политикой конфиденциальности</a>
            </label>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn btn--ghost" id="backToStep2">← Назад</button>
          <button class="btn btn--primary" id="placeOrderBtn" style="min-width:200px">
            Оформить заказ <span id="placeOrderTotal"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT: Order summary -->
    <div>
      <div class="order-summary">
        <div class="order-summary__title">Ваш заказ</div>
        <div id="summaryItems"></div>
        <div class="summary-totals" id="summaryTotals"></div>
        <div class="promo-wrap">
          <input type="text" class="f-input" id="promoInput" placeholder="Промокод" style="padding:10px 12px;font-size:.82rem" />
          <button id="promoBtn">Применить</button>
        </div>
        <div id="promoResult" style="font-size:.78rem;margin-top:8px"></div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script src="../js/api.js"></script>
<script src="../js/cart.js"></script>
<script>
// Cursor
const cursor=document.getElementById('cursor'),follower=document.getElementById('cursor-follower');
let mx=0,my=0,fx=0,fy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px'});
(function af(){fx+=(mx-fx)*.1;fy+=(my-fy)*.1;follower.style.left=fx+'px';follower.style.top=fy+'px';requestAnimationFrame(af)})();

function showToast(msg,type=''){const t=document.getElementById('toast');t.textContent=msg;t.className='toast'+(type?' toast--'+type:'');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500)}

// Auth display
const sess = DB.session.get();
document.getElementById('navCabinet').style.display = sess ? '' : 'none';
document.getElementById('navLogin').style.display = sess ? 'none' : '';

// Check success redirect
const params = new URLSearchParams(window.location.search);
if (params.get('status') === 'success') {
  document.getElementById('checkoutWrap').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
}

// Check cart
const cartItems = DB.cart.get();
if (!cartItems.length && !params.get('orderId') && params.get('status') !== 'success') {
  document.querySelector('.page-header-block').innerHTML = `<div class="empty-state"><div class="empty-state__icon">🛒</div><h3>Корзина пуста</h3><p>Добавьте букеты, чтобы оформить заказ</p><a href="../index.html#catalog" class="btn btn--outline" style="margin-top:16px">В каталог</a></div>`;
}

// Min date = today
const today = new Date().toISOString().split('T')[0];
document.getElementById('delDate').min = today;
document.getElementById('delDate').value = today;

// Settings
const settings = DB.settings.get();
let deliveryPrice = settings.deliveryPrice || 500;
let discountAmount = 0;

// Render summary
function renderSummary() {
  const items = DB.cart.get();
  const subtotal = DB.cart.total();
  const isFree = subtotal >= (settings.freeFrom || 3000);
  const delivery = document.querySelector('input[name=deliveryType]:checked')?.value === 'pickup' ? 0 : (isFree ? 0 : deliveryPrice);
  const total = subtotal + delivery - discountAmount;

  document.getElementById('summaryItems').innerHTML = items.map(i => `
    <div class="summary-item">
      <div class="summary-item__img">${i.image ? `<img src="${i.image}" alt="${i.name}" />` : '🌹'}</div>
      <div class="summary-item__info">
        <div class="summary-item__name">${i.name}</div>
        <div class="summary-item__qty">${i.qty} шт × ${i.price.toLocaleString('ru')} ₽</div>
      </div>
      <div class="summary-item__price">${(i.price*i.qty).toLocaleString('ru')} ₽</div>
    </div>
  `).join('');

  document.getElementById('summaryTotals').innerHTML = `
    <div class="summary-row"><span>Товары (${items.reduce((s,i)=>s+i.qty,0)} шт)</span><span>${subtotal.toLocaleString('ru')} ₽</span></div>
    <div class="summary-row"><span>Доставка</span><span>${delivery===0?'<span style="color:var(--success)">Бесплатно</span>':delivery.toLocaleString('ru')+' ₽'}</span></div>
    ${discountAmount>0?`<div class="summary-row" style="color:var(--success)"><span>Скидка по промокоду</span><span>−${discountAmount.toLocaleString('ru')} ₽</span></div>`:''}
    <div class="summary-row summary-row--total"><span>Итого</span><span>${total.toLocaleString('ru')} ₽</span></div>
    ${!isFree&&delivery>0?`<div class="free-delivery-hint">До бесплатной доставки: ${(settings.freeFrom-subtotal).toLocaleString('ru')} ₽</div>`:''}
  `;
  document.getElementById('placeOrderTotal').textContent = `— ${total.toLocaleString('ru')} ₽`;
  return { subtotal, delivery, total, items };
}
renderSummary();

// Delivery type toggle
document.querySelectorAll('input[name=deliveryType]').forEach(r => {
  r.addEventListener('change', () => {
    document.querySelectorAll('.delivery-opt').forEach(o=>o.classList.toggle('active', o.querySelector('input').checked));
    const isPickup = r.value === 'pickup';
    document.getElementById('deliveryAddressCard').style.display = isPickup ? 'none' : '';
    if (r.value === 'express') deliveryPrice = 900;
    else if (r.value === 'courier') deliveryPrice = settings.deliveryPrice||500;
    else deliveryPrice = 0;
    renderSummary();
  });
});

// Payment method toggle
document.querySelectorAll('input[name=paymentMethod]').forEach(r => {
  r.addEventListener('change', () => {
    document.querySelectorAll('.pay-method').forEach(m=>m.classList.toggle('active',m.querySelector('input').checked));
    const showWidget = ['card_online','sbp','yoomoney'].includes(r.value);
    document.getElementById('ykPlaceholder').style.display = showWidget ? '' : 'none';
  });
});

// Promo
const PROMOS = { 'VELOURS10': 10, 'FLOWERS20': 20, 'WELCOME15': 15 };
document.getElementById('promoBtn').addEventListener('click', () => {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  const pct = PROMOS[code];
  const res = document.getElementById('promoResult');
  if (pct) {
    discountAmount = Math.floor(DB.cart.total() * pct / 100);
    res.innerHTML = `<span style="color:var(--success)">✓ Промокод применён: −${pct}% (−${discountAmount.toLocaleString('ru')} ₽)</span>`;
    renderSummary(); showToast(`Скидка ${pct}% применена`);
  } else {
    res.innerHTML = `<span style="color:var(--danger)">Промокод не найден</span>`;
  }
});

// Saved addresses for logged-in users
if (sess) {
  const u = DB.users.get(sess.userId);
  if (u?.name) document.getElementById('senderName').value = u.name;
  if (u?.phone) document.getElementById('senderPhone').value = u.phone;
  if (u?.email) document.getElementById('senderEmail').value = u.email;
  if (u?.addresses?.length) {
    document.getElementById('savedAddresses').style.display = '';
    document.getElementById('savedAddrBtns').innerHTML = u.addresses.map(a =>
      `<button class="saved-addr-btn" onclick="fillAddr(${JSON.stringify(a).replace(/"/g,'&quot;')})">${a.tag||a.street}</button>`
    ).join('');
  }
}
window.fillAddr = function(a) {
  document.getElementById('delStreet').value = a.street||'';
  document.getElementById('delApt').value    = a.apt||'';
  document.getElementById('delFloor').value  = a.floor||'';
  document.getElementById('delComment').value= a.comment||'';
  document.querySelectorAll('.saved-addr-btn').forEach(b=>b.classList.remove('active'));
  event?.target?.classList.add('active');
};

// Recipient self-fill
document.getElementById('recipientIsSelf').addEventListener('change', e => {
  if (e.target.checked && sess) {
    const u = DB.users.get(sess.userId);
    document.getElementById('recName').value  = u?.name||'';
    document.getElementById('recPhone').value = u?.phone||'';
  } else if (!e.target.checked) {
    document.getElementById('recName').value  = '';
    document.getElementById('recPhone').value = '';
  }
});
// Auto-fill recipient
if (sess) { const u=DB.users.get(sess.userId); document.getElementById('recName').value=u?.name||''; document.getElementById('recPhone').value=u?.phone||''; }

// Steps
let currentStep = 1;
function goTo(n) {
  document.querySelectorAll('.step-panel').forEach((p,i)=>p.classList.toggle('active',i+1===n));
  for(let i=1;i<=3;i++){
    const ind=document.getElementById('step-indicator-'+i);
    ind.classList.toggle('active',i===n);
    ind.classList.toggle('done',i<n);
  }
  currentStep=n;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.getElementById('toStep2').addEventListener('click', ()=>{
  if (!document.getElementById('delStreet').value && document.querySelector('input[name=deliveryType]:checked')?.value !== 'pickup') {
    showToast('Укажите адрес доставки','error'); return;
  }
  if (!document.getElementById('delDate').value || !document.getElementById('delTime').value) {
    showToast('Укажите дату и время доставки','error'); return;
  }
  goTo(2);
});
document.getElementById('backToStep1').addEventListener('click', ()=>goTo(1));
document.getElementById('toStep3').addEventListener('click', ()=>{
  if (!document.getElementById('recName').value || !document.getElementById('recPhone').value) {
    showToast('Укажите данные получателя','error'); return;
  }
  if (!document.getElementById('senderName').value || !document.getElementById('senderPhone').value) {
    showToast('Укажите ваши данные','error'); return;
  }
  goTo(3); initYookassa();
});
document.getElementById('backToStep2').addEventListener('click', ()=>goTo(2));

// Init YooKassa widget (scaffold)
async function initYookassa() {
  const shopId = settings.yookassaShopId;
  if (!shopId) return; // not configured

  /**
   * PRODUCTION CODE:
   * 1. POST to your backend: /api/payments/create
   *    → returns { confirmation_token }
   * 2. Init widget with token
   */
  const { total } = renderSummary();
  try {
    const resp = await DB.payment.create({ orderId: 'pending', amount: total });
    if (resp.token && resp.token.startsWith('demo_')) return; // demo mode

    // Real integration:
    // const widget = new window.YooMoneyCheckoutWidget({
    //   confirmation_token: resp.token,
    //   return_url: settings.yookassaReturnUrl,
    //   customization: {
    //     colors: { controlPrimary: '#c9a96e', background: { show: true, value: '#1a2e1a' } }
    //   },
    //   error_callback(err) { showToast('Ошибка платежа: ' + err.error, 'error'); }
    // });
    // widget.render('yookassa-widget');
    // document.getElementById('ykPlaceholder').style.display = 'none';
  } catch(e) { console.error('[YooKassa]', e); }
}

// Place order
document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  if (!document.getElementById('agreeTerms').checked) {
    showToast('Примите условия доставки','error'); return;
  }
  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Оформляем...'; btn.disabled = true;

  const { items, total, delivery } = renderSummary();
  const method = document.querySelector('input[name=paymentMethod]:checked').value;

  // Create order
  const order = DB.orders.create({
    userId:         sess?.userId || null,
    customerName:   document.getElementById('senderName').value,
    phone:          document.getElementById('senderPhone').value,
    email:          document.getElementById('senderEmail').value,
    recipientName:  document.getElementById('recName').value,
    recipientPhone: document.getElementById('recPhone').value,
    cardText:       document.getElementById('cardText').value,
    address: document.querySelector('input[name=deliveryType]:checked').value === 'pickup'
      ? 'Самовывоз: ул. Тверская, 12'
      : `${document.getElementById('delStreet').value}${document.getElementById('delApt').value?', кв.'+document.getElementById('delApt').value:''}`,
    deliveryDate:   document.getElementById('delDate').value,
    deliveryTime:   document.getElementById('delTime').value,
    deliveryType:   document.querySelector('input[name=deliveryType]:checked').value,
    deliveryCost:   delivery,
    note:           document.getElementById('delComment').value,
    items,
    subtotal:       DB.cart.total(),
    discount:       discountAmount,
    total,
    paymentMethod:  method,
    paymentStatus:  method === 'cash' ? 'pending_cash' : 'pending',
  });

  DB.cart.clear();

  if (method === 'cash') {
    // Direct success
    document.getElementById('checkoutWrap').style.display = 'none';
    document.getElementById('successScreen').classList.add('show');
    document.getElementById('successText').textContent = `Заказ ${order.id} принят. Курьер привезёт букет и примет оплату наличными. Ожидайте звонка.`;
  } else {
    /**
     * PRODUCTION PAYMENT FLOW:
     * const payment = await DB.payment.create({ orderId: order.id, amount: total, email: order.email });
     * → Redirect to YooKassa OR render widget
     * → On success webhook: DB.orders.update(order.id, { paymentStatus: 'paid' })
     */
    // Demo: simulate success
    setTimeout(() => {
      DB.orders.update(order.id, { paymentStatus: 'paid', status: 'confirmed' });
      document.getElementById('checkoutWrap').style.display = 'none';
      document.getElementById('successScreen').classList.add('show');
      document.getElementById('successText').textContent = `Заказ ${order.id} оплачен и подтверждён. Доставим ${order.deliveryDate} в ${order.deliveryTime}. Смотрите статус в личном кабинете.`;
    }, 1200);
  }
});
</script>
</body>
</html>
