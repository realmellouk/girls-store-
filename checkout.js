/**
 * checkout.js — Checkout Flow
 * Handles: form validation, promo codes, order placement, order saving
 * Storage key: aura_orders
 */

const PROMO_CODES = {
  AURA20: 0.20,
  ROSE10: 0.10,
  GLAM15: 0.15,
};

const Checkout = (() => {
  const ORDERS_KEY = 'aura_orders';

  function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order); // newest first
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function generateOrderId() {
    return '#AURA-' + Date.now().toString().slice(-6);
  }

  function placeOrder({ shipping, cart, total, discount, promoCode }) {
    const order = {
      id: generateOrderId(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      timestamp: Date.now(),
      shipping,
      items: cart,
      subtotal: Cart.calculateTotal(),
      discount: discount || 0,
      total,
      promoCode: promoCode || null,
      status: 'Confirmed',
    };
    saveOrder(order);
    Cart.clearCart();
    return order;
  }

  return { getOrders, placeOrder, generateOrderId };
})();

/* ─── Checkout UI ─── */
const CheckoutUI = (() => {
  let appliedDiscount = 0;
  let appliedPromo    = '';

  function open() {
    if (Cart.getCart().length === 0) {
      showToast('Your cart is empty!', '🛒');
      return;
    }
    renderSummary();
    prefillFromSession();
    openModal('checkoutModal');
  }

  /* Pre-fill email if logged in */
  function prefillFromSession() {
    const user = Auth.currentUser();
    if (user) {
      document.getElementById('chkEmail').value = user.email;
      const nameParts = user.name.split(' ');
      document.getElementById('chkFirstName').value = nameParts[0] || '';
      document.getElementById('chkLastName').value  = nameParts.slice(1).join(' ') || '';
    }
  }

  function renderSummary() {
    const cart = Cart.getCart();
    const subtotal = Cart.calculateTotal();
    const discount = subtotal * appliedDiscount;
    const total    = subtotal - discount;

    document.getElementById('checkoutItemsList').innerHTML = cart.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-img" style="background:${item.gradient}">${item.emoji}</div>
        <div class="checkout-item-info">
          <span class="checkout-item-name">${item.name}</span>
          <span class="checkout-item-qty">× ${item.quantity}</span>
        </div>
        <span class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    document.getElementById('chkSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('chkTotal').textContent    = `$${total.toFixed(2)}`;

    const discRow = document.getElementById('chkDiscountRow');
    if (appliedDiscount > 0) {
      discRow.style.display = 'flex';
      document.getElementById('chkDiscount').textContent = `-$${discount.toFixed(2)}`;
    } else {
      discRow.style.display = 'none';
    }
  }

  function validateForm() {
    let valid = true;
    const fields = [
      { id: 'chkFirstName', errId: 'chkFirstNameErr', msg: 'First name is required.' },
      { id: 'chkEmail',     errId: 'chkEmailErr',     msg: 'Valid email is required.', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: 'chkAddress',   errId: 'chkAddressErr',   msg: 'Address is required.' },
      { id: 'chkCard',      errId: 'chkCardErr',      msg: 'Enter a valid card number.', check: v => v.replace(/\s/g, '').length >= 16 },
    ];

    // Clear
    fields.forEach(f => { const e = document.getElementById(f.errId); if (e) e.textContent = ''; });

    fields.forEach(f => {
      const val = document.getElementById(f.id).value.trim();
      const ok  = f.check ? f.check(val) : val.length > 0;
      if (!ok) {
        const errEl = document.getElementById(f.errId);
        if (errEl) errEl.textContent = f.msg;
        valid = false;
      }
    });
    return valid;
  }

  function init() {
    // Promo code
    document.getElementById('applyPromoBtn').addEventListener('click', () => {
      const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
      const msgEl = document.getElementById('promoMsg');

      if (PROMO_CODES[code]) {
        appliedDiscount = PROMO_CODES[code];
        appliedPromo    = code;
        msgEl.textContent = `✓ "${code}" applied — ${(appliedDiscount * 100).toFixed(0)}% off!`;
        msgEl.className   = 'promo-msg promo-success';
        renderSummary();
      } else {
        msgEl.textContent = '✕ Invalid promo code.';
        msgEl.className   = 'promo-msg promo-error';
        appliedDiscount   = 0;
        appliedPromo      = '';
        renderSummary();
      }
    });

    // Format card number
    document.getElementById('chkCard').addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    });

    // Format expiry
    document.getElementById('chkExpiry').addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
    });

    // Place order
    document.getElementById('placeOrderBtn').addEventListener('click', () => {
      if (!validateForm()) return;

      const cart     = Cart.getCart();
      const subtotal = Cart.calculateTotal();
      const discount = subtotal * appliedDiscount;
      const total    = subtotal - discount;

      const shipping = {
        firstName : document.getElementById('chkFirstName').value,
        lastName  : document.getElementById('chkLastName').value,
        email     : document.getElementById('chkEmail').value,
        address   : document.getElementById('chkAddress').value,
        city      : document.getElementById('chkCity').value,
        zip       : document.getElementById('chkZip').value,
      };

      const order = Checkout.placeOrder({ shipping, cart, total, discount, promoCode: appliedPromo });

      // Reset
      appliedDiscount = 0;
      appliedPromo    = '';
      document.getElementById('checkoutForm').reset();
      document.getElementById('promoMsg').textContent = '';

      closeModal('checkoutModal');

      // Show success
      document.getElementById('successOrderId').textContent = order.id;
      openModal('orderSuccessModal');

      // View orders button
      document.getElementById('viewOrderBtn').onclick = () => {
        closeModal('orderSuccessModal');
        OrdersUI.open();
      };
    });
  }

  return { init, open, renderSummary };
})();
