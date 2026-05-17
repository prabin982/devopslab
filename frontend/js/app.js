const API_URL = '/api';

const state = {
    user: null,
    cart: [],
    products: [],
    orders: []
};

// --- API Utilities ---
const fetchAPI = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API request failed');
        return data;
    } catch (err) {
        console.error(err);
        alert(err.message);
        throw err;
    }
};

// --- Auth Functions ---
const login = async (email, password) => {
    const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', data.token);
    state.user = data.user;
    navigateTo('/');
};

const register = async (username, email, password) => {
    await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    alert('Registration successful! Please login.');
    navigateTo('/login');
};

const logout = () => {
    localStorage.removeItem('token');
    state.user = null;
    navigateTo('/login');
};

const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            state.user = await fetchAPI('/auth/profile');
            updateNav();
        } catch (err) {
            localStorage.removeItem('token');
        }
    }
};

// --- Render Functions ---
const updateNav = () => {
    const authLinks = document.getElementById('auth-links');
    const guestLinks = document.getElementById('guest-links');
    if (state.user) {
        authLinks.classList.remove('hidden');
        guestLinks.classList.add('hidden');
        document.getElementById('username-display').innerText = state.user.username;
    } else {
        authLinks.classList.add('hidden');
        guestLinks.classList.remove('hidden');
    }
};

const renderProducts = async (category = '') => {
    const container = document.getElementById('main-content');
    container.innerHTML = '<h2>Loading products...</h2>';

    const products = await fetchAPI(`/products${category ? `?category=${category}` : ''}`);
    state.products = products;

    container.innerHTML = `
    <div class="category-filters" style="margin-bottom: 2rem;">
      <button class="btn btn-outline" onclick="renderProducts('')">All</button>
      <button class="btn btn-outline" onclick="renderProducts('Electronics')">Electronics</button>
      <button class="btn btn-outline" onclick="renderProducts('Clothing')">Clothing</button>
      <button class="btn btn-outline" onclick="renderProducts('Books')">Books</button>
      <button class="btn btn-outline" onclick="renderProducts('Home & Kitchen')">Home & Kitchen</button>
    </div>
    <div class="product-grid">
      ${products.map(p => `
        <div class="card">
          <img src="${p.image_url}" alt="${p.name}">
          <div class="card-content">
            <h3 class="card-title">${p.name}</h3>
            <p class="text-muted">${p.description.substring(0, 50)}...</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
              <span class="card-price">$${p.price}</span>
              <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

const renderCart = async () => {
    const container = document.getElementById('main-content');
    const items = await fetchAPI('/cart');
    state.cart = items;

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    container.innerHTML = `
    <h2>Your Shopping Cart</h2>
    <div style="margin-top: 2rem;">
      ${items.length === 0 ? '<p>Your cart is empty.</p>' : `
        ${items.map(item => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong><br>
              <span class="text-muted">$${item.price} x ${item.quantity}</span>
            </div>
            <button class="btn btn-error" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        `).join('')}
        <div style="margin-top: 2rem; text-align: right;">
          <h3>Total: $${total.toFixed(2)}</h3>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="placeOrder()">Place Order</button>
        </div>
      `}
    </div>
  `;
};

const renderOrders = async () => {
    const container = document.getElementById('main-content');
    const orders = await fetchAPI('/orders/history');

    container.innerHTML = `
    <h2>Order History</h2>
    <div style="margin-top: 2rem;">
      ${orders.length === 0 ? '<p>No orders found.</p>' : `
        ${orders.map(order => `
          <div class="order-card" style="flex-direction: column; align-items: flex-start; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1rem; padding: 1rem;">
            <div style="width: 100%; display: flex; justify-content: space-between;">
              <strong>Order #${order.id}</strong>
              <span class="text-muted">${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div style="margin-top: 1rem;">
              ${order.items.map(item => `<div>${item.name} x ${item.quantity} ($${item.price})</div>`).join('')}
            </div>
            <div style="margin-top: 1rem; font-weight: 700;">Total: $${order.total_price.toFixed(2)}</div>
            <div style="color: var(--primary);">Status: ${order.status.toUpperCase()}</div>
          </div>
        `).join('')}
      `}
    </div>
  `;
};

const renderLoginForm = () => {
    const container = document.getElementById('main-content');
    container.innerHTML = `
    <div class="form-container">
      <h2>Login</h2>
      <form onsubmit="event.preventDefault(); login(this.email.value, this.password.value)">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
      </form>
      <p style="margin-top: 1rem; text-align: center;">Don't have an account? <a href="#" onclick="navigateTo('/register')" style="color: var(--primary);">Register</a></p>
    </div>
  `;
};

const renderRegisterForm = () => {
    const container = document.getElementById('main-content');
    container.innerHTML = `
    <div class="form-container">
      <h2>Register</h2>
      <form onsubmit="event.preventDefault(); register(this.username.value, this.email.value, this.password.value)">
        <div class="form-group">
          <label>Username</label>
          <input type="text" name="username" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
      </form>
      <p style="margin-top: 1rem; text-align: center;">Already have an account? <a href="#" onclick="navigateTo('/login')" style="color: var(--primary);">Login</a></p>
    </div>
  `;
};

// --- Actions ---
const addToCart = async (productId) => {
    if (!state.user) return navigateTo('/login');
    await fetchAPI('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
    });
    alert('Added to cart!');
};

const removeFromCart = async (cartItemId) => {
    await fetchAPI(`/cart/${cartItemId}`, { method: 'DELETE' });
    renderCart();
};

const placeOrder = async () => {
    const data = await fetchAPI('/orders/place', { method: 'POST' });
    alert('Order placed successfully! ID: ' + data.orderId);
    navigateTo('/orders');
};

// --- Router ---
const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    handleRoute();
};

const handleRoute = () => {
    const path = window.location.pathname;
    updateNav();

    if (path === '/login') renderLoginForm();
    else if (path === '/register') renderRegisterForm();
    else if (path === '/cart') renderCart();
    else if (path === '/orders') renderOrders();
    else if (path === '/profile') {
        if (!state.user) navigateTo('/login');
        else {
            document.getElementById('main-content').innerHTML = `
            <div class="form-container">
                <h2>User Profile</h2>
                <p><strong>Username:</strong> ${state.user.username}</p>
                <p><strong>Email:</strong> ${state.user.email}</p>
                <p><strong>Role:</strong> ${state.user.role}</p>
                <button class="btn btn-error" style="margin-top: 1rem; width:100%" onclick="logout()">Logout</button>
            </div>
          `;
        }
    }
    else renderProducts();
};

// Init
window.addEventListener('popstate', handleRoute);
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    handleRoute();
});
