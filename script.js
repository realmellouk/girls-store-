/**
 * script.js — Main UI Orchestration
 * Handles: cursor, scroll, navbar, modal system, drawers, testimonials, reveals, init
 */

/* ══════════════════════════════════════════
   GLOBAL MODAL / DRAWER SYSTEM
══════════════════════════════════════════ */

/** Open a modal by ID */
function openModal(id) {
  const modal    = document.getElementById(id);
  const backdrop = document.getElementById('modalBackdrop');
  if (!modal) return;
  // Close any open drawers first
  document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open'));
  backdrop.classList.add('active');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/** Close a modal by ID */
function closeModal(id) {
  const modal    = document.getElementById(id);
  const backdrop = document.getElementById('modalBackdrop');
  if (!modal) return;
  modal.classList.remove('active');
  // Only remove backdrop if no other modal is open
  if (!document.querySelector('.modal.active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/** Open a side drawer */
function openDrawer(id) {
  const drawer   = document.getElementById(id);
  const backdrop = document.getElementById('modalBackdrop');
  if (!drawer) return;
  // Close other drawers
  document.querySelectorAll('.drawer.open').forEach(d => { if (d.id !== id) d.classList.remove('open'); });
  backdrop.classList.add('active');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/** Close a side drawer */
function closeDrawer(id) {
  const drawer   = document.getElementById(id);
  const backdrop = document.getElementById('modalBackdrop');
  if (!drawer) return;
  drawer.classList.remove('open');
  if (!document.querySelector('.modal.active') && !document.querySelector('.drawer.open')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ── Backdrop click closes all ── */
document.getElementById('modalBackdrop').addEventListener('click', () => {
  document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
  document.querySelectorAll('.drawer.open').forEach(d => closeDrawer(d.id));
});

/* ── data-close buttons ── */
document.addEventListener('click', (e) => {
  const closeTarget = e.target.closest('[data-close]');
  if (closeTarget) closeModal(closeTarget.dataset.close);
});

/* ── Escape key ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
    document.querySelectorAll('.drawer.open').forEach(d => closeDrawer(d.id));
  }
});

/* ══════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════ */

let toastTimer;
function showToast(message, icon = '✓') {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  const iconEl  = document.getElementById('toastIcon');
  clearTimeout(toastTimer);
  msgEl.textContent  = message;
  iconEl.textContent = icon;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════ */

const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();

document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorFollower.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorFollower.style.opacity = '1'; });

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════
   NAVBAR SCROLL BEHAVIOUR
══════════════════════════════════════════ */

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const isScrolled = window.scrollY > 60;
  navbar.classList.toggle('scrolled', isScrolled);
  // Keep search bar flush below navbar at all times
  const searchBar = document.getElementById('searchBarWrap');
  if (searchBar) searchBar.style.top = isScrolled ? '58px' : '70px';
  // Hero visual parallax
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.scrollY < window.innerHeight) {
    heroVisual.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }
}, { passive: true });

/* ══════════════════════════════════════════
   HAMBURGER MOBILE MENU
══════════════════════════════════════════ */

const hamburger = document.getElementById('hamburger');
const navLinksEl = document.querySelector('.nav-links');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    navLinksEl.style.cssText = `
      display:flex; flex-direction:column; position:fixed;
      top:70px; left:0; right:0; z-index:999;
      background:rgba(253,246,240,0.97); backdrop-filter:blur(20px);
      padding:30px 30px 40px; gap:24px;
      box-shadow:0 20px 60px rgba(212,97,138,0.12);
      opacity:1; transform:translateY(0); transition:opacity 0.3s, transform 0.3s;
    `;
  } else {
    navLinksEl.style.opacity = '0';
    navLinksEl.style.transform = 'translateY(-10px)';
    setTimeout(() => { if (!menuOpen) navLinksEl.style.display = 'none'; }, 300);
  }
  hamburger.querySelectorAll('span').forEach((s, i) => {
    if (menuOpen) {
      if (i === 0) s.style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      if (i === 1) s.style.opacity = '0';
      if (i === 2) s.style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      s.style.cssText = '';
    }
  });
});

// Close menu on nav link click
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (menuOpen) { menuOpen = false; navLinksEl.style.display = 'none'; hamburger.querySelectorAll('span').forEach(s => s.style.cssText = ''); }
  });
});

/* ══════════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════════ */

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
});

/* ══════════════════════════════════════════
   TESTIMONIALS SLIDER
══════════════════════════════════════════ */

(function initTestimonials() {
  const track    = document.getElementById('testiTrack');
  const dotsEl   = document.getElementById('testiDots');
  const cards    = track.querySelectorAll('.testi-card');
  let current    = 0;
  let visible    = window.innerWidth > 1200 ? 3 : window.innerWidth > 768 ? 2 : 1;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function cardWidth() {
    return cards[0].offsetWidth + 28;
  }

  function goTo(idx) {
    const max = cards.length - visible;
    current   = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1 > cards.length - visible ? 0 : current + 1), 5000);
  }

  document.getElementById('testiPrev').addEventListener('click', () => { clearInterval(autoTimer); goTo(current - 1); startAuto(); });
  document.getElementById('testiNext').addEventListener('click', () => { clearInterval(autoTimer); goTo(current + 1); startAuto(); });

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { clearInterval(autoTimer); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  // Pause on hover
  const slider = document.getElementById('testiSlider');
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    visible = window.innerWidth > 1200 ? 3 : window.innerWidth > 768 ? 2 : 1;
    goTo(0);
  });

  startAuto();
})();

/* ══════════════════════════════════════════
   BACKGROUND ORBS MOUSE PARALLAX
══════════════════════════════════════════ */

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelectorAll('.orb').forEach((orb, i) => {
    orb.style.transform = `translate(${x * (i + 1) * 0.4}px, ${y * (i + 1) * 0.4}px)`;
  });
}, { passive: true });

/* ══════════════════════════════════════════
   CATEGORY CARD TILT
══════════════════════════════════════════ */

document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-8px) scale(1.03) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ══════════════════════════════════════════
   NEWSLETTER FORM
══════════════════════════════════════════ */

document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn   = e.target.querySelector('.btn-primary');
  const input = e.target.querySelector('.nl-input');
  btn.querySelector('span').textContent = 'Subscribed! 🌸';
  btn.style.background = 'linear-gradient(135deg, #4caf84, #2e9e6b)';
  input.style.borderColor = '#4caf84';
  showToast('Welcome to the Aura Circle! 🌸', '✦');
  setTimeout(() => {
    btn.querySelector('span').textContent = 'Subscribe';
    btn.style.background = '';
    input.value = '';
    input.style.borderColor = '';
  }, 3000);
});

/* ══════════════════════════════════════════
   INJECT FUNCTIONAL STYLES (additions only)
══════════════════════════════════════════ */

const functionalStyles = document.createElement('style');
functionalStyles.textContent = `
/* ─ Ripple animation ─ */
@keyframes ripple { to { transform: scale(4); opacity: 0; } }

/* ─ Product emoji display ─ */
.prod-emoji { font-size: 52px; line-height: 1; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1)); }

/* ─ Search bar ─ */
.search-bar-wrap { position:fixed; top:70px; left:0; right:0; z-index:998; background:rgba(253,246,240,0.97); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); opacity:0; pointer-events:none; transform:translateY(-16px); transition:opacity 0.35s ease, transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94); padding:18px 60px; border-bottom:1px solid rgba(244,167,195,0.3); box-shadow:0 8px 30px rgba(212,97,138,0.1); }
.search-bar-wrap.active { opacity:1; pointer-events:all; transform:translateY(0); }
.search-bar-inner { display:flex; align-items:center; gap:14px; max-width:600px; margin:0 auto; }
.search-bar-inner svg { color:var(--text-light); flex-shrink:0; }
  #searchInput { flex:1; border:none; background:transparent; font-family:'Jost',sans-serif; font-size:16px; font-weight:300; color:var(--text-dark); outline:none; }
  #searchInput::placeholder { color:var(--text-light); }
  #searchCloseBtn { border:none; background:none; font-size:14px; color:var(--text-light); cursor:pointer; padding:4px 8px; transition:color 0.2s; }
  #searchCloseBtn:hover { color:var(--rose); }

/* ─ Auth nav ─ */
.auth-nav-btns { display:flex; gap:8px; align-items:center; }
.btn-auth-nav { padding:8px 16px; border:1.5px solid var(--blush); background:transparent; border-radius:100px; font-family:'Jost',sans-serif; font-size:12px; font-weight:300; letter-spacing:1px; color:var(--text-mid); cursor:pointer; transition:all 0.2s; }
.btn-auth-nav:hover { border-color:var(--rose); color:var(--rose); }
.btn-auth-register { background:linear-gradient(135deg,var(--rose),var(--purple-soft)); border-color:transparent; color:white; }
.btn-auth-register:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(212,97,138,0.3); }
.auth-user-area { display:flex; align-items:center; gap:10px; }
.user-avatar-nav { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--rose),var(--purple-soft)); color:white; font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:600; display:flex; align-items:center; justify-content:center; }
.user-name-nav { font-size:13px; font-weight:300; color:var(--text-mid); }
.btn-logout { padding:7px 14px; border:1px solid var(--blush); background:transparent; border-radius:100px; font-family:'Jost',sans-serif; font-size:11px; letter-spacing:1px; color:var(--text-light); cursor:pointer; transition:all 0.2s; }
.btn-logout:hover { border-color:var(--rose); color:var(--rose); }
.wishlist-count { position:absolute; top:-4px; right:-4px; width:16px; height:16px; background:linear-gradient(135deg,var(--rose),var(--purple-soft)); color:white; font-size:9px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.nav-wishlist-btn { position:relative; }

/* ─ Backdrop ─ */
.modal-backdrop { position:fixed; inset:0; background:rgba(45,31,46,0.5); backdrop-filter:blur(4px); z-index:2000; opacity:0; pointer-events:none; transition:opacity 0.3s; }
.modal-backdrop.active { opacity:1; pointer-events:all; }

/* ─ Modals ─ */
.modal { position:fixed; inset:0; z-index:2001; display:flex; align-items:center; justify-content:center; padding:20px; pointer-events:none; }
.modal.active { pointer-events:all; }
.modal-card { background:white; border-radius:28px; padding:48px 44px; max-width:440px; width:100%; position:relative; transform:translateY(30px) scale(0.96); opacity:0; transition:all 0.4s cubic-bezier(0.25,0.46,0.45,0.94); box-shadow:0 30px 80px rgba(45,31,46,0.2); max-height:90vh; overflow-y:auto; }
.modal.active .modal-card { transform:translateY(0) scale(1); opacity:1; }
.modal-wide .modal-card { max-width:900px; }
.product-modal-card { max-width:800px; padding:40px; }
.checkout-modal-card { max-width:960px; padding:48px; }
.orders-modal-card { max-width:720px; }
.modal-close { position:absolute; top:20px; right:20px; width:34px; height:34px; border:1.5px solid var(--blush); background:white; border-radius:50%; font-size:13px; color:var(--text-light); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; z-index:1; }
.modal-close:hover { background:var(--rose); border-color:var(--rose); color:white; }
.modal-header { text-align:center; margin-bottom:32px; }
.modal-logo-script { font-family:'Great Vibes',cursive; font-size:36px; color:var(--rose); display:block; margin-bottom:8px; }
.modal-header h2 { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:400; color:var(--text-dark); margin-bottom:6px; }
.modal-header p { font-size:14px; font-weight:300; color:var(--text-light); }
.modal-form { display:flex; flex-direction:column; gap:20px; }
.form-group { display:flex; flex-direction:column; gap:7px; }
.form-group label { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-light); font-weight:400; }
.form-group input { padding:13px 18px; border:1.5px solid var(--blush); border-radius:100px; font-family:'Jost',sans-serif; font-size:14px; font-weight:300; color:var(--text-dark); outline:none; transition:border-color 0.2s; background:white; }
.form-group input:focus { border-color:var(--pink); }
.input-pw-wrap { position:relative; }
.input-pw-wrap input { width:100%; padding-right:48px; }
.pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); border:none; background:none; cursor:pointer; font-size:16px; line-height:1; }
.form-error { font-size:11px; color:#e86060; font-weight:300; min-height:14px; }
.form-error-general { color:#e86060; font-size:13px; text-align:center; font-weight:300; }
.modal-submit { width:100%; justify-content:center; padding:15px; font-size:13px; margin-top:4px; }
.modal-switch { text-align:center; font-size:13px; font-weight:300; color:var(--text-light); margin-top:20px; }
.modal-switch a { color:var(--rose); text-decoration:none; font-weight:400; }

/* ─ Drawers ─ */
.drawer { position:fixed; top:0; right:0; height:100vh; width:400px; max-width:100vw; background:white; z-index:2002; transform:translateX(100%); transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); display:flex; flex-direction:column; box-shadow:-10px 0 60px rgba(45,31,46,0.15); }
.drawer.open { transform:translateX(0); }
.drawer-header { display:flex; justify-content:space-between; align-items:center; padding:28px 28px 20px; border-bottom:1px solid var(--blush); flex-shrink:0; }
.drawer-header h3 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:var(--text-dark); }
.drawer-count { font-family:'Jost',sans-serif; font-size:14px; font-weight:300; color:var(--text-light); }
.drawer-close { width:36px; height:36px; border:1.5px solid var(--blush); background:white; border-radius:50%; font-size:13px; cursor:pointer; color:var(--text-light); display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.drawer-close:hover { background:var(--rose); border-color:var(--rose); color:white; }
.drawer-body { flex:1; overflow-y:auto; padding:20px 28px; }
.drawer-footer { padding:20px 28px 28px; border-top:1px solid var(--blush); flex-shrink:0; }
.drawer-empty { text-align:center; padding:60px 20px; }
.drawer-empty-icon { font-size:48px; margin-bottom:16px; opacity:0.4; }
.drawer-empty p { font-size:16px; font-weight:300; color:var(--text-mid); margin-bottom:8px; }
.drawer-empty small { font-size:12px; color:var(--text-light); }

/* ─ Cart / Wishlist Items ─ */
.cart-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid rgba(247,202,216,0.4); position:relative; }
.cart-item-img { width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
.cart-item-info { flex:1; min-width:0; }
.cart-item-name { font-size:14px; font-weight:400; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cart-item-cat { font-size:11px; color:var(--text-light); letter-spacing:0.5px; margin-top:2px; }
.cart-item-price { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:var(--rose); margin-top:4px; }
.cart-item-controls { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.qty-btn { width:26px; height:26px; border:1.5px solid var(--blush); background:white; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; color:var(--text-mid); transition:all 0.2s; }
.qty-btn:hover { background:var(--rose); border-color:var(--rose); color:white; }
.qty-display { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:var(--text-dark); min-width:20px; text-align:center; }
.cart-remove { width:24px; height:24px; border:none; background:none; font-size:12px; color:var(--text-light); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color 0.2s; flex-shrink:0; }
.cart-remove:hover { color:#e86060; }
.cart-summary-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:14px; font-weight:300; color:var(--text-mid); }
.cart-total-row { border-top:1px solid var(--blush); margin-top:8px; padding-top:14px; }
.cart-total-row strong { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; color:var(--text-dark); }
.cart-free { color:#4caf84; font-weight:400; }
.clear-cart-btn { width:100%; justify-content:center; margin-top:10px; padding:11px; font-size:12px; }
.wl-actions { display:flex; gap:8px; }
.btn-mini { width:32px; height:32px; border:1.5px solid var(--blush); background:white; border-radius:50%; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.btn-mini:hover { background:var(--pink-light); }

/* ─ Product Detail ─ */
.product-detail { display:flex; gap:36px; }
.pd-img-col { flex:0 0 300px; }
.pd-main-img { width:100%; height:320px; border-radius:24px; display:flex; align-items:center; justify-content:center; font-size:80px; position:relative; overflow:hidden; }
.pd-emoji { font-size:80px; filter:drop-shadow(0 8px 20px rgba(0,0,0,0.1)); }
.pd-info-col { flex:1; }
.pd-name { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:400; color:var(--text-dark); margin-bottom:12px; line-height:1.2; }
.pd-price { margin-bottom:20px; display:flex; align-items:center; gap:12px; }
.pd-description { font-size:14px; font-weight:300; line-height:1.8; color:var(--text-mid); margin-bottom:20px; }
.pd-tags { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px; }
.pd-tag { padding:4px 14px; background:var(--pink-light); border-radius:100px; font-size:11px; letter-spacing:1px; color:var(--rose); font-weight:400; }
.pd-actions { display:flex; gap:12px; }
.pd-wish-btn { padding:14px 20px; font-size:13px; }
.pd-wish-btn.wishlisted { color:var(--rose); border-color:var(--pink); }
.pd-related { margin-top:36px; padding-top:28px; border-top:1px solid var(--blush); }
.pd-related-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:var(--text-dark); margin-bottom:20px; }
.pd-related-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.pd-related-card { border-radius:16px; overflow:hidden; cursor:pointer; transition:all 0.3s; background:white; box-shadow:0 2px 12px rgba(180,80,120,0.08); }
.pd-related-card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(180,80,120,0.16); }
.pd-related-img { width:100%; height:90px; display:flex; align-items:center; justify-content:center; font-size:32px; }
.pd-related-name { font-size:12px; font-weight:400; color:var(--text-dark); padding:8px 10px 2px; }
.pd-related-price { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:600; color:var(--rose); padding:0 10px 10px; }

/* ─ Search results ─ */
.search-results-notice { display:flex; align-items:center; gap:16px; margin-bottom:24px; padding:12px 20px; background:var(--pink-light); border-radius:100px; font-size:13px; font-weight:300; color:var(--text-mid); }
#clearSearchBtn { border:none; background:none; font-size:12px; color:var(--rose); cursor:pointer; font-family:'Jost',sans-serif; text-decoration:underline; }
.no-results { grid-column:1/-1; text-align:center; padding:80px 20px; font-size:15px; color:var(--text-light); font-weight:300; }
.no-results div { font-size:48px; margin-bottom:16px; }
.no-results p { font-size:18px; margin-bottom:8px; }

/* ─ Checkout ─ */
.checkout-layout { display:flex; gap:48px; }
.checkout-form-col { flex:1; }
.checkout-summary-col { flex:0 0 300px; }
.checkout-section-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; color:var(--text-dark); margin-bottom:18px; padding-bottom:10px; border-bottom:1px solid var(--blush); }
.form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.checkout-items-list { display:flex; flex-direction:column; gap:12px; margin-bottom:20px; max-height:300px; overflow-y:auto; }
.checkout-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(247,202,216,0.3); }
.checkout-item-img { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.checkout-item-info { flex:1; }
.checkout-item-name { font-size:13px; font-weight:400; color:var(--text-dark); }
.checkout-item-qty { font-size:11px; color:var(--text-light); }
.checkout-item-price { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:600; color:var(--rose); flex-shrink:0; }
.checkout-totals { margin-bottom:24px; }
.promo-input-row { display:flex; gap:10px; margin-top:16px; }
.promo-input-row input { flex:1; }
.promo-msg { font-size:12px; margin-top:8px; font-weight:300; }
.promo-success { color:#4caf84; }
.promo-error { color:#e86060; }
.secure-note { font-size:11px; color:var(--text-light); text-align:center; margin-top:12px; font-weight:300; }
.discount-row span:last-child { color:#4caf84; }

/* ─ Order Success ─ */
.success-card { text-align:center; padding:52px 44px; }
.success-icon { font-size:64px; margin-bottom:20px; animation:successBounce 0.6s cubic-bezier(0.36,0.07,0.19,0.97); }
@keyframes successBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
.success-card h2 { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:400; color:var(--text-dark); margin-bottom:12px; }
.success-card p { font-size:15px; font-weight:300; color:var(--text-mid); margin-bottom:20px; line-height:1.7; }
.success-order-id { background:var(--pink-light); padding:10px 24px; border-radius:100px; font-size:14px; font-weight:400; color:var(--rose); display:inline-block; margin-bottom:28px; }
.success-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }

/* ─ Orders ─ */
.orders-empty { text-align:center; padding:60px 40px; }
.orders-empty-icon { font-size:56px; margin-bottom:16px; opacity:0.5; }
.orders-empty h3 { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:400; color:var(--text-dark); margin-bottom:8px; }
.orders-empty p { font-size:14px; color:var(--text-light); font-weight:300; }
.order-card { border:1.5px solid var(--blush); border-radius:20px; margin-bottom:20px; overflow:hidden; }
.order-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:var(--pink-light); gap:16px; flex-wrap:wrap; }
.order-id { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; color:var(--rose); }
.order-date { font-size:12px; color:var(--text-light); font-weight:300; margin-top:2px; }
.order-status { background:linear-gradient(135deg,var(--rose),var(--purple-soft)); color:white; font-size:11px; padding:5px 14px; border-radius:100px; letter-spacing:1px; }
.order-total-display { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:var(--text-dark); }
.order-items-list { padding:16px 24px; display:flex; flex-direction:column; gap:12px; }
.order-item { display:flex; align-items:center; gap:12px; }
.order-item-img { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.order-item-details { flex:1; }
.order-item-name { font-size:14px; font-weight:400; color:var(--text-dark); }
.order-item-meta { font-size:11px; color:var(--text-light); }
.order-item-price { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:600; color:var(--rose); }
.order-card-footer { padding:12px 24px; border-top:1px solid var(--blush); font-size:12px; color:var(--text-light); font-weight:300; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.promo-used { color:var(--rose); font-weight:400; }

/* ─ Wishlist button states ─ */
.wish-btn.wishlisted { color:var(--rose) !important; background:var(--pink-light) !important; }

/* ─ Responsive additions ─ */
@media (max-width: 768px) {
  .product-detail { flex-direction:column; }
  .pd-img-col { flex:none; }
  .pd-related-grid { grid-template-columns:repeat(2,1fr); }
  .checkout-layout { flex-direction:column; }
  .checkout-summary-col { flex:none; }
  .auth-nav-btns { display:none; }
  .user-name-nav { display:none; }
  .search-bar-wrap { padding:14px 20px; top:60px !important; }
  .drawer { width:100vw; }
  .modal-card { padding:32px 24px; }
  .checkout-modal-card { padding:28px 20px; }
  .form-row-2 { grid-template-columns:1fr; }
}
`;
document.head.appendChild(functionalStyles);

/* ══════════════════════════════════════════
   INITIALISE ALL MODULES
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  AuthUI.init();
  CartUI.init();
  WishlistUI.init();
  CheckoutUI.init();
  OrdersUI.init();
  ProductsUI.init();

  // Re-observe static reveal elements (categories, hero, etc.)
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));

  console.log('%c✦ AURA BOUTIQUE ✦', 'color:#d4618a;font-size:20px;font-family:Georgia,serif;font-style:italic;');
  console.log('%cFull frontend e-commerce app running 🌸', 'color:#9b7ec8;font-size:12px;');
});