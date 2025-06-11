// Realistic product images from Unsplash (free)
const products = [
  {
    id: 1,
    name: 'Smartphone',
    price: 299.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'T-Shirt',
    price: 19.99,
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: 'Laptop',
    price: 799.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: 'Jeans',
    price: 39.99,
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'
  },
];

// Save products in localStorage for detail page
localStorage.setItem('products', JSON.stringify(products));

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

function renderProducts(list) {
  if (!productList) return;
  productList.innerHTML = '';
  list.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <p>${product.category}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
      <a href="product.html?id=${product.id}">View Details</a>
    `;
    productList.appendChild(div);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('Added to cart!');
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartCount.textContent = cart.length;
}

function filterProducts() {
  let filtered = products;

  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  if (searchText) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchText)
    );
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  renderProducts(filtered);
}

searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

// Initialize
renderProducts(products);
updateCartCount();

