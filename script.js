const products = [
  { id: 1, name: 'Product A', price: 29.99 },
  { id: 2, name: 'Product B', price: 19.99 },
  { id: 3, name: 'Product C', price: 39.99 },
];

const productList = document.getElementById('product-list');
if (productList) {
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
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
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = cart.length;
}

updateCartCount();


