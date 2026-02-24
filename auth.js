/**
 * auth.js — Authentication Module
 * Handles: register, login, logout, session persistence
 * Storage keys: aura_users, aura_session
 */

const Auth = (() => {
  const USERS_KEY   = 'aura_users';
  const SESSION_KEY = 'aura_session';

  /* ─── Storage helpers ─── */
  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  }
  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* ─── Validators ─── */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /* ─── Core actions ─── */
  function register({ name, email, password }) {
    if (!name.trim())             return { ok: false, field: 'name',     msg: 'Name is required.' };
    if (!isValidEmail(email))     return { ok: false, field: 'email',    msg: 'Enter a valid email address.' };
    if (password.length < 6)      return { ok: false, field: 'password', msg: 'Password must be at least 6 characters.' };

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, field: 'email', msg: 'An account with this email already exists.' };
    }

    const user = { id: Date.now(), name: name.trim(), email: email.toLowerCase().trim() };
    users.push({ ...user, password });
    saveUsers(users);
    saveSession(user);
    return { ok: true, user };
  }

  function login({ email, password }) {
    if (!isValidEmail(email))  return { ok: false, field: 'email',    msg: 'Enter a valid email address.' };
    if (!password)             return { ok: false, field: 'password', msg: 'Password is required.' };

    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, field: 'general', msg: 'Incorrect email or password.' };

    const user = { id: found.id, name: found.name, email: found.email };
    saveSession(user);
    return { ok: true, user };
  }

  function logout() {
    clearSession();
  }

  function currentUser() {
    return getSession();
  }

  function isLoggedIn() {
    return !!getSession();
  }

  return { register, login, logout, currentUser, isLoggedIn };
})();

/* ─── Auth UI Controller ─── */
const AuthUI = (() => {
  function init() {
    // Nav buttons
    document.getElementById('loginNavBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerNavBtn').addEventListener('click', () => openModal('registerModal'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Footer links
    document.getElementById('footerLoginLink').addEventListener('click', (e) => { e.preventDefault(); openModal('loginModal'); });
    document.getElementById('footerRegisterLink').addEventListener('click', (e) => { e.preventDefault(); openModal('registerModal'); });

    // Modal switch links
    document.getElementById('switchToRegister').addEventListener('click', (e) => { e.preventDefault(); closeModal('loginModal'); openModal('registerModal'); });
    document.getElementById('switchToLogin').addEventListener('click', (e) => { e.preventDefault(); closeModal('registerModal'); openModal('loginModal'); });

    // Password toggles
    document.querySelectorAll('.pw-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁' : '🙈';
      });
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Render initial state
    renderAuthState();
  }

  function handleLogin(e) {
    e.preventDefault();
    clearErrors('login');
    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = Auth.login({ email, password });
    if (!result.ok) {
      showError('login', result.field, result.msg);
      return;
    }
    closeModal('loginModal');
    renderAuthState();
    showToast(`Welcome back, ${result.user.name}! 🌸`, '✦');
    document.getElementById('loginForm').reset();
  }

  function handleRegister(e) {
    e.preventDefault();
    clearErrors('register');
    const name     = document.getElementById('registerName').value;
    const email    = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const result = Auth.register({ name, email, password });
    if (!result.ok) {
      showError('register', result.field, result.msg);
      return;
    }
    closeModal('registerModal');
    renderAuthState();
    showToast(`Welcome to Aura, ${result.user.name}! 🎀`, '✦');
    document.getElementById('registerForm').reset();
  }

  function handleLogout() {
    const user = Auth.currentUser();
    Auth.logout();
    renderAuthState();
    showToast(`See you soon, ${user.name}! 🌸`, '👋');
  }

  function renderAuthState() {
    const user = Auth.currentUser();
    const guestBtns  = document.getElementById('authGuestBtns');
    const userArea   = document.getElementById('authUserArea');
    const userName   = document.getElementById('userNameNav');
    const userAvatar = document.getElementById('userAvatarNav');

    if (user) {
      guestBtns.style.display = 'none';
      userArea.style.display  = 'flex';
      userName.textContent    = user.name.split(' ')[0];
      userAvatar.textContent  = user.name.charAt(0).toUpperCase();
    } else {
      guestBtns.style.display = 'flex';
      userArea.style.display  = 'none';
    }
  }

  function clearErrors(prefix) {
    ['Name', 'Email', 'Password', 'General'].forEach(f => {
      const el = document.getElementById(`${prefix}${f}Err`);
      if (el) el.textContent = '';
    });
  }

  function showError(prefix, field, msg) {
    const fieldMap = { name: 'Name', email: 'Email', password: 'Password', general: 'General' };
    const el = document.getElementById(`${prefix}${fieldMap[field] || 'General'}Err`);
    if (el) el.textContent = msg;
  }

  return { init, renderAuthState };
})();
