/**
 * orders.js — Orders History Module
 */

const OrdersUI = (() => {
  function open() {
    if (!Auth.isLoggedIn()) {
      openModal('loginModal');
      showToast('Please sign in to view your orders 🌸', '💌');
      return;
    }
    render();
    openModal('ordersModal');
  }

  function render() {
    const orders = Checkout.getOrders();
    const container = document.getElementById('ordersListContainer');

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="orders-empty">
          <div class="orders-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <button class="btn-primary" data-close="ordersModal" style="margin-top:20px">
            <span>Start Shopping ✦</span>
          </button>
        </div>
      `;
      // Rebind close for button inside
      container.querySelector('[data-close]')?.addEventListener('click', () => closeModal('ordersModal'));
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-id">${order.id}</div>
            <div class="order-date">${order.date}</div>
          </div>
          <div class="order-status">${order.status}</div>
          <div class="order-total-display">$${order.total.toFixed(2)}</div>
        </div>
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item">
              <div class="order-item-img" style="background:${item.gradient}">${item.emoji}</div>
              <div class="order-item-details">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-meta">${item.category} &middot; Qty: ${item.quantity}</span>
              </div>
              <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-card-footer">
          <span>Shipped to: ${order.shipping.firstName} ${order.shipping.lastName}, ${order.shipping.city}</span>
          ${order.promoCode ? `<span class="promo-used">Promo: ${order.promoCode}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  function init() {
    document.getElementById('ordersNavBtn').addEventListener('click', open);
    document.getElementById('footerOrdersLink').addEventListener('click', (e) => { e.preventDefault(); open(); });
  }

  return { init, open, render };
})();
