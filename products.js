/**
 * products.js — Product Rendering, Filtering & Search
 * Renders product cards from PRODUCTS data, handles filter/search, opens detail modal
 */

const ProductsUI = (() => {
  let currentFilter = 'All';
  let currentSearch = '';

  /* ─── Render stars ─── */
  function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
  }

  /* ─── Build product card HTML ─── */
  function buildCard(product) {
    const wishlisted = Wishlist.isWishlisted(product.id);
    const badge = product.badge
      ? `<div class="product-badge ${product.badge === 'Hot' || product.badge === 'Sale' ? 'badge-hot' : ''}">${product.badge}</div>`
      : '';

    return `
      <div class="product-card" data-product-id="${product.id}" data-category="${product.category}">
        <div class="product-img-wrap">
          <div class="product-img" style="background:${product.gradient}">
            <div class="prod-emoji">${product.emoji}</div>
          </div>
          <div class="product-overlay">
            <button class="add-cart-btn" data-id="${product.id}">Add to Cart</button>
            <button class="wish-btn ${wishlisted ? 'wishlisted' : ''}" data-id="${product.id}" title="Wishlist">${wishlisted ? '♥' : '♡'}</button>
          </div>
          ${badge}
        </div>
        <div class="product-info" data-id="${product.id}" style="cursor:pointer">
          <div class="product-category">${product.category}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            <span class="stars">${renderStars(product.rating)}</span>
            <span class="rating-count">(${product.reviews})</span>
          </div>
          <div class="product-price">
            <span class="price-current">$${product.price}</span>
            ${product.oldPrice ? `<span class="price-old">$${product.oldPrice}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ─── Filtered product list ─── */
  function getFiltered() {
    return PRODUCTS.filter(p => {
      const matchCat    = currentFilter === 'All' || p.category === currentFilter;
      const matchSearch = !currentSearch || p.name.toLowerCase().includes(currentSearch) || p.category.toLowerCase().includes(currentSearch) || (p.tags && p.tags.some(t => t.includes(currentSearch)));
      return matchCat && matchSearch;
    });
  }

  /* ─── Render product grid ─── */
  function render() {
    const grid    = document.getElementById('productsGrid');
    const notice  = document.getElementById('searchResultsNotice');
    const noticeText = document.getElementById('searchResultsText');
    const filtered = getFiltered();

    if (currentSearch) {
      notice.style.display = 'flex';
      noticeText.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${currentSearch}"`;
    } else {
      notice.style.display = 'none';
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="no-results"><div>🔍</div><p>No products found</p><small>Try a different search or category</small></div>`;
      return;
    }

    grid.innerHTML = filtered.map(buildCard).join('');

    // Animate cards in with a slight stagger — don't rely on revealObserver
    // since cards are injected after observer setup
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.transitionDelay = `${i * 0.06}s`;
      // Use rAF to ensure styles are applied before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card.classList.add('visible');
        });
      });
    });

    attachCardEvents();
  }

  /* ─── Card event delegation ─── */
  function attachCardEvents() {
    const grid = document.getElementById('productsGrid');

    // Delegated click handler
    grid.addEventListener('click', (e) => {
      // Add to cart button
      const cartBtn = e.target.closest('.add-cart-btn');
      if (cartBtn) {
        e.stopPropagation();
        const id = Number(cartBtn.dataset.id);
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;
        Cart.addToCart(product);
        showToast(`"${product.name}" added to cart! 🛍️`, '✓');
        cartBtn.textContent = '✓ Added';
        cartBtn.style.background = 'linear-gradient(135deg, #d4618a, #9b7ec8)';
        cartBtn.style.color = 'white';
        setTimeout(() => { cartBtn.textContent = 'Add to Cart'; cartBtn.style.background = ''; cartBtn.style.color = ''; }, 2000);
        return;
      }

      // Wishlist button
      const wishBtn = e.target.closest('.wish-btn');
      if (wishBtn) {
        e.stopPropagation();
        const id = Number(wishBtn.dataset.id);
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;
        const added = Wishlist.toggle(product);
        wishBtn.textContent = added ? '♥' : '♡';
        wishBtn.classList.toggle('wishlisted', added);
        wishBtn.style.transform = 'scale(1.4)';
        setTimeout(() => wishBtn.style.transform = '', 300);
        showToast(added ? `"${product.name}" added to wishlist 🌸` : 'Removed from wishlist', added ? '♥' : '✕');
        return;
      }

      // Product card info (open detail)
      const infoEl = e.target.closest('.product-info, .product-img-wrap:not(.add-cart-btn):not(.wish-btn)');
      if (infoEl) {
        const id = Number(infoEl.closest('[data-product-id]')?.dataset.productId || infoEl.dataset.id);
        if (id) openProductDetail(id);
      }
    }, { capture: false });
  }

  /* ─── Product Detail Modal ─── */
  function openProductDetail(productId) {
    const product  = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const related  = getRelatedProducts(product, 4);
    const wishlisted = Wishlist.isWishlisted(product.id);

    document.getElementById('productModalContent').innerHTML = `
      <div class="product-detail">
        <div class="pd-img-col">
          <div class="pd-main-img" style="background:${product.gradient}">
            <div class="pd-emoji">${product.emoji}</div>
            ${product.badge ? `<div class="product-badge ${product.badge === 'Hot' || product.badge === 'Sale' ? 'badge-hot' : ''}">${product.badge}</div>` : ''}
          </div>
        </div>
        <div class="pd-info-col">
          <div class="product-category">${product.category}</div>
          <h2 class="pd-name">${product.name}</h2>
          <div class="product-rating" style="margin-bottom:16px">
            <span class="stars">${renderStars(product.rating)}</span>
            <span class="rating-count">(${product.reviews} reviews)</span>
          </div>
          <div class="pd-price">
            <span class="price-current" style="font-size:32px">$${product.price}</span>
            ${product.oldPrice ? `<span class="price-old" style="font-size:18px">$${product.oldPrice}</span>` : ''}
          </div>
          <p class="pd-description">${product.description}</p>
          <div class="pd-tags">${product.tags.map(t => `<span class="pd-tag">${t}</span>`).join('')}</div>
          <div class="pd-actions">
            <button class="btn-primary" id="pdAddCartBtn" style="flex:1" data-id="${product.id}">
              <span>Add to Cart</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
            <button class="btn-ghost pd-wish-btn ${wishlisted ? 'wishlisted' : ''}" id="pdWishBtn" data-id="${product.id}">
              ${wishlisted ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>
      ${related.length > 0 ? `
      <div class="pd-related">
        <h3 class="pd-related-title">You Might Also Love ✦</h3>
        <div class="pd-related-grid">
          ${related.map(rp => `
            <div class="pd-related-card" data-id="${rp.id}">
              <div class="pd-related-img" style="background:${rp.gradient}">${rp.emoji}</div>
              <div class="pd-related-name">${rp.name}</div>
              <div class="pd-related-price">$${rp.price}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    `;

    // Bind detail modal actions
    document.getElementById('pdAddCartBtn').addEventListener('click', () => {
      Cart.addToCart(product);
      showToast(`"${product.name}" added to cart! 🛍️`, '✓');
    });

    document.getElementById('pdWishBtn').addEventListener('click', (e) => {
      const added = Wishlist.toggle(product);
      e.target.textContent = added ? '♥ Saved' : '♡ Save';
      e.target.classList.toggle('wishlisted', added);
      showToast(added ? 'Saved to wishlist 🌸' : 'Removed from wishlist', added ? '♥' : '✕');
      // Update grid card too
      const gridWishBtn = document.querySelector(`.wish-btn[data-id="${product.id}"]`);
      if (gridWishBtn) { gridWishBtn.textContent = added ? '♥' : '♡'; gridWishBtn.classList.toggle('wishlisted', added); }
    });

    // Related product clicks
    document.querySelectorAll('.pd-related-card').forEach(card => {
      card.addEventListener('click', () => openProductDetail(Number(card.dataset.id)));
    });

    openModal('productModal');
  }

  /* ─── Filter buttons ─── */
  function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
      });
    });

    // Category cards also filter
    document.querySelectorAll('.cat-card[data-cat]').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.cat;
        currentFilter = cat;
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.filter === cat);
        });
        document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(render, 400);
      });
    });
  }

  /* ─── Search ─── */
  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchToggle = document.getElementById('searchToggleBtn');
    const searchWrap  = document.getElementById('searchBarWrap');
    const searchClose = document.getElementById('searchCloseBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    searchToggle.addEventListener('click', () => {
      searchWrap.classList.toggle('active');
      if (searchWrap.classList.contains('active')) {
        setTimeout(() => searchInput.focus(), 200);
      }
    });

    searchClose.addEventListener('click', () => {
      searchWrap.classList.remove('active');
      searchInput.value = '';
      currentSearch = '';
      render();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      searchWrap.classList.remove('active');
      render();
    });

    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.toLowerCase().trim();
      // Scroll to products and render
      if (currentSearch.length > 0) {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
      }
      render();
    });

    // Keyboard close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchWrap.classList.contains('active')) {
        searchWrap.classList.remove('active');
        searchInput.value = '';
        currentSearch = '';
        render();
      }
    });
  }

  /* ─── View All ─── */
  function initViewAll() {
    document.getElementById('viewAllBtn').addEventListener('click', () => {
      currentFilter = 'All';
      currentSearch = '';
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'All'));
      render();
    });

    document.getElementById('promoCTABtn').addEventListener('click', () => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ─── Init ─── */
  function init() {
    initFilters();
    initSearch();
    initViewAll();
    render();
  }

  return { init, render, openProductDetail };
})();