<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Velours — Вход / Регистрация</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/pages.css" />
  <style>
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden}
    .auth-bg{position:fixed;inset:0;z-index:0}
    .auth-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.25}
    .auth-blob--1{width:500px;height:500px;background:radial-gradient(circle,#2a7a4a,transparent);top:-100px;right:-60px;animation:floatB 14s ease-in-out infinite}
    .auth-blob--2{width:400px;height:400px;background:radial-gradient(circle,#c9a96e,transparent);bottom:-80px;left:-80px;animation:floatB 18s ease-in-out infinite reverse}
    @keyframes floatB{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
    .auth-wrap{position:relative;z-index:1;width:100%;max-width:440px;padding:20px}
    .auth-logo{font-family:var(--font-display);font-size:2.2rem;color:var(--gold);text-align:center;letter-spacing:.2em;margin-bottom:4px}
    .auth-tagline{text-align:center;color:var(--text-muted);font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:32px}
    .auth-card{background:var(--surface);border:1px solid var(--border-2);border-radius:20px;padding:36px 32px;backdrop-filter:blur(20px)}
    .auth-tabs{display:flex;gap:0;margin-bottom:28px;border-bottom:1px solid var(--border)}
    .auth-tab{flex:1;background:none;border:none;padding:12px;font-family:var(--font-body);font-size:.82rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);transition:all .2s;border-bottom:2px solid transparent;margin-bottom:-1px}
    .auth-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
    .auth-panel{display:none}
    .auth-panel.active{display:block;animation:fadeUp .3s var(--ease-out)}
    .auth-social{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
    .auth-social-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px;border-radius:10px;background:var(--bg-2);border:1px solid var(--border);font-size:.84rem;color:var(--text);transition:all .2s}
    .auth-social-btn:hover{border-color:var(--border-2);background:var(--bg-3)}
    .auth-social-btn svg{flex-shrink:0}
    .forgot-link{font-size:.76rem;color:var(--gold);text-align:right;display:block;margin-bottom:20px}
    .forgot-link:hover{text-decoration:underline}
    .auth-footer{text-align:center;margin-top:20px;font-size:.8rem;color:var(--text-muted)}
    .auth-footer a{color:var(--gold)}
    .auth-back{position:absolute;top:24px;left:24px;display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--text-muted);transition:color .2s}
    .auth-back:hover{color:var(--cream)}
    .form-err-msg{background:rgba(224,85,85,.1);border:1px solid rgba(224,85,85,.3);border-radius:8px;padding:10px 14px;font-size:.82rem;color:#ff9090;margin-bottom:16px;display:none}
    .form-err-msg.show{display:block}
    .password-wrap{position:relative}
    .password-wrap .f-input{padding-right:44px}
    .password-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);font-size:.9rem;transition:color .2s}
    .password-toggle:hover{color:var(--cream)}
    .strength-bar{height:3px;border-radius:2px;background:var(--border);margin-top:6px;overflow:hidden}
    .strength-fill{height:100%;border-radius:2px;transition:all .3s;width:0}
    .strength-label{font-size:.68rem;color:var(--text-muted);margin-top:4px}
  </style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-follower" id="cursor-follower"></div>

<div class="auth-bg">
  <div class="auth-blob auth-blob--1"></div>
  <div class="auth-blob auth-blob--2"></div>
</div>

<a href="../index.html" class="auth-back">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  На главную
</a>

<div class="auth-wrap">
  <div class="auth-logo">Velours</div>
  <div class="auth-tagline">Доставка цветов в Москве</div>

  <div class="auth-card">
    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="login">Вход</button>
      <button class="auth-tab" data-tab="register">Регистрация</button>
    </div>

    <!-- LOGIN -->
    <div class="auth-panel active" id="panel-login">
      <div class="auth-social">
        <button class="auth-social-btn" id="googleAuthBtn">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Войти через Google
        </button>
      </div>
      <div class="divider divider--text">или</div>
      <div class="form-err-msg" id="loginErr"></div>
      <form id="loginForm">
        <div class="f-group">
          <label class="f-label">Email</label>
          <input type="email" class="f-input" id="loginEmail" placeholder="your@email.com" required />
        </div>
        <div class="f-group">
          <label class="f-label">Пароль</label>
          <div class="password-wrap">
            <input type="password" class="f-input" id="loginPassword" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-toggle="loginPassword">👁</button>
          </div>
        </div>
        <a href="#" class="forgot-link">Забыли пароль?</a>
        <div class="f-group" style="margin-bottom:8px">
          <label class="f-check">
            <input type="checkbox" checked id="rememberMe" />
            Запомнить меня
          </label>
        </div>
        <button type="submit" class="btn btn--primary btn--full" style="margin-top:16px" id="loginBtn">Войти</button>
      </form>
    </div>

    <!-- REGISTER -->
    <div class="auth-panel" id="panel-register">
      <div class="form-err-msg" id="regErr"></div>
      <form id="registerForm">
        <div class="f-row">
          <div class="f-group">
            <label class="f-label">Имя *</label>
            <input type="text" class="f-input" id="regName" placeholder="Анна" required />
          </div>
          <div class="f-group">
            <label class="f-label">Фамилия</label>
            <input type="text" class="f-input" id="regLastname" placeholder="Иванова" />
          </div>
        </div>
        <div class="f-group">
          <label class="f-label">Email *</label>
          <input type="email" class="f-input" id="regEmail" placeholder="your@email.com" required />
        </div>
        <div class="f-group">
          <label class="f-label">Телефон</label>
          <input type="tel" class="f-input" id="regPhone" placeholder="+7 (___) ___-__-__" />
        </div>
        <div class="f-group">
          <label class="f-label">Пароль * <span style="color:var(--text-muted);font-size:.68rem;text-transform:none">(минимум 6 символов)</span></label>
          <div class="password-wrap">
            <input type="password" class="f-input" id="regPassword" placeholder="••••••••" required />
            <button type="button" class="password-toggle" data-toggle="regPassword">👁</button>
          </div>
          <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
          <div class="strength-label" id="strengthLabel"></div>
        </div>
        <div class="f-group">
          <label class="f-label">Повторите пароль *</label>
          <input type="password" class="f-input" id="regPassword2" placeholder="••••••••" required />
        </div>
        <div class="f-group" style="margin-bottom:8px">
          <label class="f-check">
            <input type="checkbox" id="regConsent" required />
            Я согласен(а) с <a href="#">политикой конфиденциальности</a>
          </label>
        </div>
        <button type="submit" class="btn btn--primary btn--full" style="margin-top:16px" id="regBtn">Создать аккаунт</button>
      </form>
    </div>
  </div>

  <div class="auth-footer">
    <p>Нет аккаунта? <a href="#" id="switchToReg">Зарегистрироваться</a></p>
  </div>
</div>

<div class="toast" id="toast"></div>

<script src="../js/api.js"></script>
<script>
// Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mx=0,my=0,fx=0,fy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px'});
(function af(){fx+=(mx-fx)*.1;fy+=(my-fy)*.1;follower.style.left=fx+'px';follower.style.top=fy+'px';requestAnimationFrame(af)})();

// Redirect if already logged in
const sess = DB.session.get();
if (sess) {
  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get('redirect') || '../pages/cabinet.html';
}

// Toast
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' toast--'+type : '');
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3500);
}

// Tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab,.auth-panel').forEach(el=>el.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
  });
});
document.getElementById('switchToReg')?.addEventListener('click', e => {
  e.preventDefault();
  document.querySelectorAll('.auth-tab')[1].click();
});

// Password toggle
document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.toggle);
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});

// Password strength
document.getElementById('regPassword')?.addEventListener('input', e => {
  const val = e.target.value;
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0, color = '#e05555', text = 'Слабый';
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const pct = Math.min(score * 20, 100);
  if (score >= 4) { color = '#4aaa6a'; text = 'Надёжный'; }
  else if (score >= 3) { color = '#c9a96e'; text = 'Средний'; }
  fill.style.width = pct + '%'; fill.style.background = color;
  label.textContent = val.length > 0 ? text : '';
  label.style.color = color;
});

// Get redirect
const getRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || '../pages/cabinet.html';
};

// LOGIN
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = document.getElementById('loginErr');
  err.classList.remove('show');
  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Вход...'; btn.disabled = true;
  try {
    Auth.login({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value });
    showToast('✓ Добро пожаловать!');
    setTimeout(() => window.location.href = getRedirect(), 600);
  } catch(ex) {
    err.textContent = ex.message; err.classList.add('show');
    btn.textContent = 'Войти'; btn.disabled = false;
  }
});

// REGISTER
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = document.getElementById('regErr');
  err.classList.remove('show');
  const p1 = document.getElementById('regPassword').value;
  const p2 = document.getElementById('regPassword2').value;
  if (p1 !== p2) { err.textContent = 'Пароли не совпадают'; err.classList.add('show'); return; }
  const btn = document.getElementById('regBtn');
  btn.textContent = 'Создаём аккаунт...'; btn.disabled = true;
  try {
    const name = document.getElementById('regName').value + (document.getElementById('regLastname').value ? ' ' + document.getElementById('regLastname').value : '');
    Auth.register({ name, email: document.getElementById('regEmail').value, phone: document.getElementById('regPhone').value, password: p1 });
    showToast('✓ Аккаунт создан!');
    setTimeout(() => window.location.href = getRedirect(), 600);
  } catch(ex) {
    err.textContent = ex.message; err.classList.add('show');
    btn.textContent = 'Создать аккаунт'; btn.disabled = false;
  }
});

// Google mock
document.getElementById('googleAuthBtn').addEventListener('click', () => {
  showToast('Google OAuth: подключите backend (Firebase / Supabase)', 'warn');
});
</script>
</body>
</html>
