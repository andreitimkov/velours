/**
 * VELOURS — Auth Module
 * Регистрация, вход, выход, управление сессией
 */
const Auth = (() => {

  // Простое хеширование пароля (в prod используйте bcrypt на сервере)
  const hashPassword = str => btoa(encodeURIComponent(str));

  const login = ({ email, password }) => {
    const user = DB.users.findByEmail(email);
    if (!user) throw new Error('Пользователь не найден');
    if (user.passwordHash !== hashPassword(password)) throw new Error('Неверный пароль');
    DB.session.set(user);
    return user;
  };

  const register = ({ name, email, phone, password }) => {
    if (!name || !email || !password) throw new Error('Заполните все обязательные поля');
    if (password.length < 6) throw new Error('Пароль должен содержать минимум 6 символов');
    const user = DB.users.create({ name, email, phone, passwordHash: hashPassword(password) });
    DB.session.set(user);
    return user;
  };

  const logout = () => {
    DB.session.clear();
    window.location.href = '/index.html';
  };

  const requireAuth = (redirectTo = '/pages/auth.html') => {
    if (!DB.session.get()) {
      window.location.href = redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!DB.session.isAdmin()) {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  };

  return { login, register, logout, requireAuth, requireAdmin };
})();

window.Auth = Auth;
