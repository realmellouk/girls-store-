/**
 * cart.js — Cart Module
 * Handles: add, remove, update quantity, totals, UI drawer
 * Storage key: aura_cart
 */

const Cart = (() => {
  const CART_KEY = 'aura_cart';

  /* ─── Storage ─── */
  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    CartUI.render();
    CartUI.updateBadge();
  }

  /* ─── Core functions ─── */
  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, gradient: product.gradient, category: product.category, quantity: 1 });
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
  }

  function updateQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      saveCart(cart.filter(i => i.id !== productId));
    } else {
      saveCart(cart);
    }
  }

  function clearCart() {
    saveCart([]);
  }

  function calculateTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  return { getCart, addToCart, removeFromCart, updateQuantity, clearCart, calculateTotal, getCount };
})();

/* ─── Cart UI Controller ─── */
const CartUI = (() => {
  function init() {
    // Open/close
    document.getElementById('cartNavBtn').addEventListener('click', () => openDrawer('cartDrawer'));
    document.getElementById('cartDrawerClose').addEventListener('click', () => closeDrawer('cartDrawer'));
    document.getElementById('clearCartBtn').addEventListener('click', () => {
      Cart.clearCart();
      showToast('Cart cleared', '🗑️');
    });
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      if (!Auth.isLoggedIn()) {
        closeDrawer('cartDrawer');
        openModal('loginModal');
        showToast('Please sign in to checkout 🌸', '💌');
        return;
      }
      closeDrawer('cartDrawer');
      CheckoutUI.open();
    });

    // Event delegation for cart drawer quantity/remove
    document.getElementById('cartDrawerBody').addEventListener('click', (e) => {
      const id = Number(e.target.closest('[data-id]')?.dataset.id);
      if (!id) return;
      if (e.target.classList.contains('qty-plus'))  Cart.updateQuantity(id, +1);
      if (e.target.classList.contains('qty-minus')) Cart.updateQuantity(id, -1);
      if (e.target.classList.contains('cart-remove')) {
        Cart.removeFromCart(id);
        showToast('Item removed from cart', '✕');
      }
    });

    render();
    updateBadge();
  }

  function render() {
    const cart    = Cart.getCart();
    const body    = document.getElementById('cartDrawerBody');
    const footer  = document.getElementById('cartDrawerFooter');
    const count   = document.getElementById('cartDrawerCount');
    const subtotal = document.getElementById('cartSubtotal');
    const total    = document.getElementById('cartTotal');

    count.textContent = `(${Cart.getCount()})`;

    if (cart.length === 0) {
      body.innerHTML = `<div class="drawer-empty"><div class="drawer-empty-icon">🛍️</div><p>Your cart is empty</p><small>Add some beautiful pieces to get started ✦</small></div>`;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    const fmt = (n) => `$${n.toFixed(2)}`;
    const totalVal = Cart.calculateTotal();
    subtotal.textContent = fmt(totalVal);
    total.textContent = fmt(totalVal);

    body.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img" style="background:${item.gradient}">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-price">${fmt(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
        </div>
        <button class="cart-remove" data-id="${item.id}" title="Remove">✕</button>
      </div>
    `).join('');
  }

  function updateBadge() {
    const count = Cart.getCount();
    const badge = document.getElementById('cartCount');
    badge.textContent = count;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = 'scale(1)', 300);
  }

  return { init, render, updateBadge };
})();
