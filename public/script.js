// Load products from API
let products = [];

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

// App State
let cart = JSON.parse(localStorage.getItem('shopease_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('shopease_wishlist')) || [];
let currentTheme = localStorage.getItem('shopease_theme') || 'light';
let currentPage = 1;
const ITEMS_PER_PAGE = 24;
let currentFilteredProducts = [];

// DOM Elements
const cartCountElement = document.getElementById('cart-count');
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    initTheme();
    updateAuthUI();

    // Fetch products first
    await fetchProducts();

    // Fetch wishlist from server if logged in
    const user = JSON.parse(localStorage.getItem('shopease_user'));
    if (user) {
        try {
            const response = await fetch(`/api/wishlist/${user.id}`);
            const serverWishlist = await response.json();
            wishlist = serverWishlist.map(p => p.id);
            localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    }

    // Setup Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Setup Mobile Menu Toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Render logic based on page
    const productsGrid = document.getElementById('featured-products') || document.getElementById('all-products');
    if (productsGrid) {
        const isFeaturedContainer = productsGrid.id === 'featured-products';
        const displayProducts = isFeaturedContainer ? products.slice(0, 4) : products;
        
        // Simulating network request for loading animation
        productsGrid.innerHTML = '<div class="loader-container"><span class="loader"></span></div>';
        
        setTimeout(() => {
            renderProducts(displayProducts, productsGrid);
            
            // Setup Search and Filter if on products page
            if (document.getElementById('all-products')) {
                setupFilters();
            }
        }, 300); // Reduced delay since we already fetched
    }
    
    // Render Recommended Carousel if exists
    if (document.getElementById('recommended-products')) {
        renderRecommended('recommended-products');
    }

    // Product Details Page logic
    if (document.getElementById('product-details-view')) {
        renderProductDetails();
    }
});

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('shopease_user'));
    const navLinks = document.getElementById('nav-links');
    
    if(navLinks) {
        // Clear existing dynamic items if any
        const existingAuth = document.getElementById('auth-nav-item');
        const existingAdmin = document.getElementById('admin-nav-item');
        if(existingAuth) existingAuth.remove();
        if(existingAdmin) existingAdmin.remove();

        // 1. Add Admin Link if applicable
        if (user && user.email === 'admin@shopease.com') {
            const adminLi = document.createElement('li');
            adminLi.id = 'admin-nav-item';
            adminLi.innerHTML = '<a href="admin.html" style="color: var(--accent-color); font-weight: 700;"><i class="fa-solid fa-shield-halved"></i> Admin Panel</a>';
            navLinks.appendChild(adminLi);
        }

        // 2. Add Login/Profile Link
        const li = document.createElement('li');
        li.id = 'auth-nav-item';
        li.innerHTML = user 
            ? '<a href="profile.html">Profile</a>'
            : '<a href="login.html">Login</a>';
        navLinks.appendChild(li);
    }
}

// Theme Management
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('shopease_theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (currentTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// Product Rendering
function renderProducts(productsToRender, container) {
    container.innerHTML = '';
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No products found matching your criteria.</div>';
        return;
    }

    const isAllProductsPage = container.id === 'all-products';
    let displayList = productsToRender;

    if (isAllProductsPage) {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        displayList = productsToRender.slice(start, start + ITEMS_PER_PAGE);
    }

    displayList.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        
        let badgeHtml = '';
        if (product.id % 7 === 0) badgeHtml = '<span class="product-badge badge-sale">-20% OFF</span>';
        else if (product.id % 5 === 0) badgeHtml = '<span class="product-badge badge-best">Bestseller</span>';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${badgeHtml}
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id}, this)">
                <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.title}" class="product-image" onclick="goToDetails(${product.id})">
            <div class="product-category">${product.category}</div>
            <div class="product-title" onclick="goToDetails(${product.id})">${product.title}</div>
            <div class="product-rating">
                ${generateStars(product.rating)} <span>(${product.rating})</span>
            </div>
            <div class="product-footer">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    if (isAllProductsPage && productsToRender.length > ITEMS_PER_PAGE) {
        renderPagination(productsToRender.length, container);
    }
}

function renderPagination(totalItems, container) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pagContainer = document.createElement('div');
    pagContainer.style.gridColumn = '1/-1';
    pagContainer.style.textAlign = 'center';
    pagContainer.style.marginTop = '40px';
    
    let html = '';
    for(let i=1; i<=totalPages; i++) {
        if(i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            var activeClass = i === currentPage ? '' : 'btn-outline';
            html += '<button class="btn ' + activeClass + '" style="margin: 0 5px; padding: 8px 16px;" onclick="changePage(' + i + ')">' + i + '</button>';
        } else if(i === currentPage - 2 || i === currentPage + 2) {
            html += '<span style="margin: 0 5px; color: var(--text-secondary);">...</span>';
        }
    }
    
    pagContainer.innerHTML = html;
    container.appendChild(pagContainer);
}

window.changePage = function(page) {
    currentPage = page;
    const container = document.getElementById('all-products');
    document.querySelector('.filters-bar').scrollIntoView({ behavior: 'smooth' });
    renderProducts(currentFilteredProducts, container);
}

function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="fa-regular fa-star"></i>';
    }
    return starsHtml;
}

// Wishlist Logic
async function toggleWishlist(productId, btnElement) {
    const icon = btnElement.querySelector('i');
    const user = JSON.parse(localStorage.getItem('shopease_user'));
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        // Remove logic
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        showToast('Removed from wishlist');
        
        if (user) {
            try {
                await fetch(`/api/wishlist/${user.id}/${productId}`, { method: 'DELETE' });
            } catch (error) { console.error("Wishlist sync error:", error); }
        }
    } else {
        // Add logic
        wishlist.push(productId);
        btnElement.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        showToast('Added to wishlist', 'success');
        
        if (user) {
            try {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, productId })
                });
            } catch (error) { console.error("Wishlist sync error:", error); }
        } else {
            showToast('Login to save your wishlist permanently!', 'info');
        }
    }
    
    localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
}

// Navigation
function goToDetails(productId) {
    window.location.href = 'product-details.html?id=' + productId;
}

// Cart Logic (Global)
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    localStorage.setItem('shopease_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.title} added to cart!`, 'success');
}

function updateCartCount() {
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        // Animation effect on count change
        cartCountElement.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--success-color)"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger-color)"></i>';
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// --- Products Page Filters Logic ---
function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const container = document.getElementById('all-products');

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortMode = sortFilter.value;

        // Filter
        let filtered = products.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || p.category === category;
            return matchesSearch && matchesCategory;
        });

        // Sort
        if (sortMode === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortMode === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        }

        currentFilteredProducts = filtered;
        currentPage = 1; // Reset to page 1 on filter change
        renderProducts(currentFilteredProducts, container);
    }

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    
    // Initial run to set state
    applyFilters();
}

// --- Product Details Page Logic ---
function renderProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    let productId = parseInt(urlParams.get('id'));
    
    // Fallback if the URL parameter is completely missing, broken, or cached as ${productId}
    if (isNaN(productId)) {
        productId = 1;
    }
    
    const container = document.getElementById('product-details-view');
    const product = products.find(p => p.id === productId);
    
    // Simulating loading
    container.innerHTML = '<div class="loader-container" style="padding: 100px 0;"><span class="loader"></span></div>';

    setTimeout(() => {
        if (!product) {
            container.innerHTML = '<div style="padding: 100px; text-align: center;"><h2>Product not found (Searched ID: ' + productId + ', Total Products: ' + products.length + ')</h2><a href="products.html" class="btn" style="margin-top: 20px;">Return to Shop</a></div>';
            return;
        }

        const listPrice = (product.price * 1.35).toFixed(2);

        container.innerHTML = `
            <div class="amazon-details-layout">
                <div class="amazon-gallery">
                    <div class="gallery-thumbnails">
                        <img src="${product.image}" class="thumb active" onclick="swapImage(this, '${product.image}')">
                        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600" class="thumb" onclick="swapImage(this, this.src)">
                        <img src="https://images.unsplash.com/photo-1512496015851-a1dc8a477d48?auto=format&fit=crop&q=80&w=600" class="thumb" onclick="swapImage(this, this.src)">
                        <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600" class="thumb" onclick="swapImage(this, this.src)">
                    </div>
                    <div class="main-image-view">
                        <img id="main-product-img" src="${product.image}" alt="${product.title}">
                    </div>
                </div>

                <div class="amazon-info">
                    <div class="product-category" style="margin-bottom: 5px;">${product.category.toUpperCase()}</div>
                    <h1 style="font-size: 1.8rem; line-height: 1.2; margin-bottom: 10px;">${product.title} - Quality Guaranteed, Premium Finish</h1>
                    
                    <div class="review-block" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px;">
                        <span class="product-rating" style="display:inline-block; margin-right: 15px;">${generateStars(product.rating)} <span>${product.rating}</span></span>
                        <a href="#" style="color: var(--accent-color); text-decoration: none;">1,245 ratings</a>
                        <div style="font-weight: 600; color: #c45500; font-size: 0.9rem; margin-top: 5px;">
                            <i class="fa-solid fa-arrow-trend-up"></i> 4K+ bought in past month
                        </div>
                    </div>

                    <div class="amazon-pricing" style="margin-bottom: 20px;">
                        <div style="color: var(--text-secondary); text-decoration: line-through; font-size: 0.9rem;">List Price: $${listPrice}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: var(--danger-color); font-size: 2rem; font-weight: 400;">-<span style="font-size: 1.2rem;">26%</span></span>
                            <span style="font-size: 2.2rem; font-weight: 500; color: var(--text-primary);">$${product.price.toFixed(2)}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Offer Applied. Returns policy eligible.</div>
                    </div>

                    <div style="font-weight: 600; margin-bottom: 10px; color: var(--text-primary);">About this item:</div>
                    <ul style="padding-left: 20px; line-height: 1.6; color: var(--text-secondary); font-size: 0.95rem;">
                        <li>${product.description}</li>
                        <li>Dermatologist tested and formulated for all skin types.</li>
                        <li>Cruelty-free and never tested on animals.</li>
                        <li>Long-lasting formula ensures you stay glowing all day.</li>
                    </ul>
                </div>

                <div class="amazon-buy-box glass-panel" style="border-radius: 12px; padding: 25px;">
                    <h3 style="font-size: 1.8rem; margin-bottom: 10px; color: var(--text-primary);">$${product.price.toFixed(2)}</h3>
                    
                    <div class="amazon-delivery" style="margin-bottom: 20px; font-size: 0.95rem;">
                        <div style="color: var(--accent-color); font-weight: 600;"><i class="fa-solid fa-truck-fast"></i> Premium Shipping</div>
                        <div style="margin-top: 8px; color: var(--text-primary);">Estimated Delivery: <span style="font-weight:700;">Tomorrow</span></div>
                    </div>
                    
                    <div style="color: var(--success-color); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-check"></i> In Stock
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 5px;">Quantity</label>
                        <select style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-family: inherit;">
                            <option>1</option><option>2</option><option>3</option>
                        </select>
                    </div>

                    <button class="btn" onclick="addToCart(${product.id})" style="width: 100%; border-radius: 12px; padding: 16px; margin-bottom: 12px; font-weight: 700; box-shadow: 0 4px 15px var(--accent-soft);">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-outline" onclick="toggleWishlistDetails(${product.id}, this)" style="width: 100%; border-radius: 12px; padding: 16px; font-weight: 600;">
                        <i class="${wishlist.includes(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i> Add to Wishlist
                    </button>
                    
                    <div style="margin-top: 25px; font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Ships from</span>
                            <span style="color: var(--text-primary); font-weight: 500;">ShopEase Logistics</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Sold by</span>
                            <span style="color: var(--text-primary); font-weight: 500;">ShopEase Beauty</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }, 400);
}

function toggleWishlistDetails(productId, btnElement) {
    toggleWishlist(productId, btnElement);
    // Extra visual update for details page since UI is different
    const isWishlisted = wishlist.includes(productId);
    btnElement.innerHTML = `<i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart" ></i>`;
}

// --- Recommended Carousel Logic ---
function renderRecommended(containerId) {
    const container = document.getElementById(containerId);
    if (!container || products.length === 0) return;

    // Grab 8 random products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);
    
    container.innerHTML = '';
    selected.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        
        let badgeHtml = '';
        if (product.id % 7 === 0) badgeHtml = '<span class="product-badge badge-sale">-20% OFF</span>';
        else if (product.id % 5 === 0) badgeHtml = '<span class="product-badge badge-best">Bestseller</span>';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${badgeHtml}
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id}, this)">
                <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.title}" class="product-image" onclick="goToDetails(${product.id})">
            <div class="product-category">${product.category}</div>
            <div class="product-title" onclick="goToDetails(${product.id})">${product.title}</div>
            <div class="product-rating">
                ${generateStars(product.rating)} <span>(${product.rating})</span>
            </div>
            <div class="product-footer">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Gallery image swapping
window.swapImage = function(thumbElement, src) {
    const mainImg = document.getElementById('main-product-img');
    mainImg.src = src;
    
    document.querySelectorAll('.gallery-thumbnails .thumb').forEach(el => {
        el.classList.remove('active');
    });
    thumbElement.classList.add('active');
}
