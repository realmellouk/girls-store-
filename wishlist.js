/**
 * wishlist.js — Wishlist Module
 * Handles: toggle wishlist, drawer UI, persistence
 * Storage key: aura_wishlist
 */

const Wishlist = (() => {
  const KEY = 'aura_wishlist';

  function getWishlist() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }
  function saveWishlist(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
    WishlistUI.render();
    WishlistUI.updateBadge();
  }

  function toggle(product) {
    const list = getWishlist();
    const idx  = list.findIndex(item => item.id === product.id);
    if (idx >= 0) {
      list.splice(idx, 1);
      saveWishlist(list);
      return false; // removed
    } else {
      list.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, gradient: product.gradient, category: product.category });
      saveWishlist(list);
      return true; // added
    }
  }

  function isWishlisted(productId) {
    return getWishlist().some(item => item.id === productId);
  }

  function remove(productId) {
    saveWishlist(getWishlist().filter(item => item.id !== productId));
  }

  function getCount() {
    return getWishlist().length;
  }

  return { getWishlist, toggle, isWishlisted, remove, getCount };
})();

/* ─── Wishlist UI ─── */
const WishlistUI = (() => {
  function init() {
    document.getElementById('wishlistNavBtn').addEventListener('click', () => openDrawer('wishlistDrawer'));
    document.getElementById('wishlistDrawerClose').addEventListener('click', () => closeDrawer('wishlistDrawer'));
    document.getElementById('footerWishlistLink').addEventListener('click', (e) => { e.preventDefault(); openDrawer('wishlistDrawer'); });

    // Event delegation for wishlist body
    document.getElementById('wishlistDrawerBody').addEventListener('click', (e) => {
      const id = Number(e.target.closest('[data-id]')?.dataset.id);
      if (!id) return;
      if (e.target.classList.contains('wl-remove')) {
        Wishlist.remove(id);
        // Update heart button in product grid
        const heartBtn = document.querySelector(`.wish-btn[data-id="${id}"]`);
        if (heartBtn) {
          heartBtn.textContent = '♡';
          heartBtn.classList.remove('wishlisted');
        }
        showToast('Removed from wishlist', '✕');
      }
      if (e.target.classList.contains('wl-add-cart')) {
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
          Cart.addToCart(product);
          showToast(`"${product.name}" added to cart! 🛍️`, '✓');
        }
      }
    });

    render();
    updateBadge();
  }

  function render() {
    const list  = Wishlist.getWishlist();
    const body  = document.getElementById('wishlistDrawerBody');
    const count = document.getElementById('wishlistDrawerCount');
    count.textContent = `(${list.length})`;

    if (list.length === 0) {
      body.innerHTML = `<div class="drawer-empty"><div class="drawer-empty-icon">♡</div><p>Your wishlist is empty</p><small>Tap the heart on any product to save it here ✦</small></div>`;
      return;
    }

    body.innerHTML = list.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img" style="background:${item.gradient}">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="wl-actions">
          <button class="wl-add-cart btn-mini" data-id="${item.id}" title="Add to cart">🛍️</button>
          <button class="wl-remove cart-remove" data-id="${item.id}" title="Remove">✕</button>
        </div>
      </div>
    `).join('');
  }

  function updateBadge() {
    const count = Wishlist.getCount();
    const badge = document.getElementById('wishlistCount');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  return { init, render, updateBadge };
})();
