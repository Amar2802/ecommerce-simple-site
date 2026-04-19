const API_URL = 'https://fakestoreapi.com/products';
const CART_KEY = 'cart';
const PRODUCTS_KEY = 'products';
const ORDERS_KEY = 'orders';
const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 80;
const SHIPPING_FEE = 6.99;

const fallbackProducts = [
  {
    id: 101,
    title: 'Everyday Canvas Backpack',
    price: 48.5,
    category: 'bags',
    description: 'A durable everyday backpack with padded storage and water-resistant canvas.',
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=700&q=80',
    rating: { rate: 4.7, count: 128 },
  },
  {
    id: 102,
    title: 'Wireless Desk Speaker',
    price: 79,
    category: 'electronics',
    description: 'Compact stereo speaker with warm sound, Bluetooth pairing, and USB-C charging.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80',
    rating: { rate: 4.5, count: 86 },
  },
  {
    id: 103,
    title: 'Soft Cotton Overshirt',
    price: 36,
    category: 'fashion',
    description: 'Relaxed-fit overshirt made with breathable brushed cotton for daily layering.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
    rating: { rate: 4.4, count: 94 },
  },
  {
    id: 104,
    title: 'Minimal Ceramic Watch',
    price: 92,
    category: 'jewelery',
    description: 'Slim ceramic watch with scratch-resistant glass and a clean matte finish.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    rating: { rate: 4.8, count: 211 },
  },
];

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const normalizeProduct = (product) => ({
  id: product.id,
  title: product.title || product.name,
  price: Number(product.price),
  category: product.category || 'general',
  description: product.description || 'A customer favorite selected for quality and daily use.',
  image: product.image,
  rating: product.rating || { rate: 4.4, count: 50 },
});

const read = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function getCart() {
  return read(CART_KEY).map((item) => ({
    ...item,
    quantity: Number(item.quantity) || 1,
  }));
}

function saveCart(cart) {
  write(CART_KEY, cart);
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count], #cart-count').forEach((node) => {
    node.textContent = count;
  });
}

function setAuthStatus() {
  const authStatus = document.getElementById('auth-status');
  if (!authStatus) return;

  const user = localStorage.getItem('loggedInUser');
  authStatus.innerHTML = user
    ? `<span>Hi, ${user}</span><button class="link-button" type="button" onclick="logout()">Logout</button>`
    : `<a href="login.html">Login</a><a href="signup.html">Sign up</a>`;
}

function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
}

async function loadProducts() {
  const cached = read(PRODUCTS_KEY);
  renderLoading();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Product API unavailable');
    const products = (await response.json()).map(normalizeProduct);
    write(PRODUCTS_KEY, products);
    return products;
  } catch {
    const products = cached.length ? cached.map(normalizeProduct) : fallbackProducts;
    write(PRODUCTS_KEY, products);
    showNotice('Using saved products while the product API is unavailable.');
    return products;
  }
}

function renderLoading() {
  const list = document.getElementById('product-list');
  if (list) {
    list.innerHTML = '<div class="empty-state">Loading fresh products...</div>';
  }
}

function showNotice(message) {
  const notice = document.getElementById('notice');
  if (!notice) return;
  notice.textContent = message;
  notice.hidden = false;
}

function cartTotals(cart = getCart()) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  return {
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
  };
}

function addToCart(productId, quantity = 1) {
  const products = read(PRODUCTS_KEY).map(normalizeProduct);
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);
  showNotice(`${product.title} added to cart.`);
}

function updateQuantity(productId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity));
  const cart = getCart().map((item) =>
    item.id === Number(productId) ? { ...item, quantity: nextQuantity } : item
  );
  saveCart(cart);
  renderCart();
}

function removeItem(productId) {
  saveCart(getCart().filter((item) => item.id !== Number(productId)));
  renderCart();
}

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  if (!products.length) {
    productList.innerHTML = '<div class="empty-state">No products match your filters.</div>';
    return;
  }

  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product">
          <a class="product-image-link" href="product.html?id=${product.id}" aria-label="View ${product.title}">
            <img src="${product.image}" alt="${product.title}" loading="lazy" />
          </a>
          <div class="product-content">
            <span class="badge">${product.category}</span>
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
              <strong>${money.format(product.price)}</strong>
              <span>${product.rating.rate.toFixed(1)} stars (${product.rating.count})</span>
            </div>
          </div>
          <div class="product-actions">
            <button type="button" onclick="addToCart(${product.id})">Add to cart</button>
            <a class="btn ghost" href="product.html?id=${product.id}">Details</a>
          </div>
        </article>
      `
    )
    .join('');
}

function setupCatalog(products) {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  const categories = ['all', ...new Set(products.map((product) => product.category))].sort();
  categoryFilter.innerHTML = categories
    .map((category) => `<option value="${category}">${category === 'all' ? 'All categories' : category}</option>`)
    .join('');

  const filterProducts = () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    let filtered = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'rating') return b.rating.rate - a.rating.rate;
      return a.title.localeCompare(b.title);
    });

    renderProducts(filtered);
  };

  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
  sortFilter.addEventListener('change', filterProducts);
  filterProducts();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  if (!container || !summary) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<div class="empty-state">Your cart is empty. Add a few products to start checkout.</div>';
    summary.innerHTML = '';
    updateCartCount();
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.title}" />
          <div class="cart-item-info">
            <h3>${item.title}</h3>
            <p>${item.category}</p>
            <strong>${money.format(item.price)}</strong>
          </div>
          <label class="qty-control">
            <span>Qty</span>
            <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)" />
          </label>
          <strong>${money.format(item.price * item.quantity)}</strong>
          <button type="button" class="btn-remove" onclick="removeItem(${item.id})">Remove</button>
        </article>
      `
    )
    .join('');

  const totals = cartTotals(cart);
  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${money.format(totals.subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>${totals.shipping ? money.format(totals.shipping) : 'Free'}</strong></div>
    <div class="summary-row"><span>Estimated tax</span><strong>${money.format(totals.tax)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${money.format(totals.total)}</strong></div>
    <a class="btn wide" href="checkout.html">Checkout</a>
  `;
  updateCartCount();
}

function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const productId = Number(new URLSearchParams(window.location.search).get('id'));
  const product = read(PRODUCTS_KEY).map(normalizeProduct).find((item) => item.id === productId);

  if (!product) {
    container.innerHTML = '<div class="empty-state">Product not found. Go back to the shop and choose another item.</div>';
    return;
  }

  const related = read(PRODUCTS_KEY)
    .map(normalizeProduct)
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  container.innerHTML = `
    <section class="detail-layout">
      <div class="detail-media"><img src="${product.image}" alt="${product.title}" /></div>
      <div class="detail-copy">
        <span class="badge">${product.category}</span>
        <h2>${product.title}</h2>
        <p>${product.description}</p>
        <div class="detail-price">${money.format(product.price)}</div>
        <p class="muted">${product.rating.rate.toFixed(1)} stars from ${product.rating.count} shoppers</p>
        <button type="button" onclick="addToCart(${product.id})">Add to cart</button>
      </div>
    </section>
    ${
      related.length
        ? `<section><h2>Similar picks</h2><div class="product-grid compact">${related
            .map(
              (item) => `
                <article class="product">
                  <img src="${item.image}" alt="${item.title}" loading="lazy" />
                  <div class="product-content"><h3>${item.title}</h3><strong>${money.format(item.price)}</strong></div>
                  <button type="button" onclick="addToCart(${item.id})">Add to cart</button>
                </article>
              `
            )
            .join('')}</div></section>`
        : ''
    }
  `;
}

function setupCheckout() {
  const form = document.getElementById('checkout-form');
  const review = document.getElementById('checkout-review');
  if (!form || !review) return;

  const cart = getCart();
  if (!cart.length) {
    review.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    form.hidden = true;
    return;
  }

  const totals = cartTotals(cart);
  review.innerHTML = `
    ${cart
      .map(
        (item) => `
          <div class="summary-row"><span>${item.quantity} x ${item.title}</span><strong>${money.format(
          item.price * item.quantity
        )}</strong></div>
        `
      )
      .join('')}
    <div class="summary-row"><span>Shipping</span><strong>${totals.shipping ? money.format(totals.shipping) : 'Free'}</strong></div>
    <div class="summary-row"><span>Estimated tax</span><strong>${money.format(totals.tax)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${money.format(totals.total)}</strong></div>
  `;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const order = {
      id: `FW-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer: data.get('name'),
      email: data.get('email'),
      address: `${data.get('address')}, ${data.get('city')} ${data.get('zip')}`,
      paymentMethod: data.get('payment'),
      items: cart,
      totals,
      status: 'Processing',
    };

    write(ORDERS_KEY, [order, ...read(ORDERS_KEY)]);
    localStorage.removeItem(CART_KEY);
    window.location.href = `order.html?id=${order.id}`;
  });
}

function renderOrder() {
  const container = document.getElementById('order-detail');
  if (!container) return;

  const orderId = new URLSearchParams(window.location.search).get('id');
  const order = read(ORDERS_KEY).find((item) => item.id === orderId);

  if (!order) {
    container.innerHTML = '<div class="empty-state">Order not found.</div>';
    return;
  }

  container.innerHTML = `
    <section class="success-panel">
      <span class="badge">Payment authorized</span>
      <h2>Thanks, ${order.customer}. Your order is confirmed.</h2>
      <p>Order ${order.id} is ${order.status.toLowerCase()} and will be sent to ${order.address}.</p>
      <div class="summary-row total"><span>Total paid</span><strong>${money.format(order.totals.total)}</strong></div>
      <a class="btn" href="index.html">Continue shopping</a>
    </section>
  `;
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', async () => {
  setAuthStatus();
  updateCartCount();

  if (document.getElementById('product-list')) {
    const products = await loadProducts();
    setupCatalog(products);
  }

  if (document.getElementById('product-detail') && !read(PRODUCTS_KEY).length) {
    await loadProducts();
  }

  renderCart();
  renderProductDetail();
  setupCheckout();
  renderOrder();
});
