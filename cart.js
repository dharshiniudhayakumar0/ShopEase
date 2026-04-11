// Cart Page Specific Logic

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the cart page
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartPage();
    }
});

function renderCartPage() {
    const cartContainer = document.getElementById('cart-items-container');
    const orderSubtotalEl = document.getElementById('order-subtotal');
    const orderTotalEl = document.getElementById('order-total');
    
    cartContainer.innerHTML = '';
    
    // Always fetch latest from localStorage
    cart = JSON.parse(localStorage.getItem('shopease_cart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <tr>
                <td colspan="4" style="border: none;">
                    <div class="empty-cart-msg" style="padding: 100px 0; text-align: center; animation: blurIn 0.8s ease-out;">
                        <div style="font-size: 5rem; color: var(--accent-soft); margin-bottom: 20px;">
                            <i class="fa-solid fa-cart-shopping"></i>
                        </div>
                        <h2 style="font-size: 2rem; margin-bottom: 10px;">Your cart feels lonely</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 1.1rem;">Explore our premium collection and find your next favorite beauty product.</p>
                        <a href="products.html" class="btn" style="padding: 16px 40px; border-radius: 12px; font-size: 1.1rem;">Discover Products</a>
                    </div>
                </td>
            </tr>
        `;
        orderSubtotalEl.textContent = '$0.00';
        orderTotalEl.textContent = '$0.00';
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <td>
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div>
                        <h4 style="margin-bottom: 5px;">${item.title}</h4>
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">Category: ${item.category}</span>
                        <!-- Hidden on desktop, shown on mobile logic if implemented -->
                        <div style="font-weight: bold; margin-top: 5px;" class="mobile-price-disp d-none-desktop">$${item.price.toFixed(2)}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span style="width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </td>
            <td><strong>$${item.price.toFixed(2)}</strong></td>
            <td>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>$${itemTotal.toFixed(2)}</strong>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove Item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        cartContainer.appendChild(row);
    });

    // Tax/Shipping calculation could go here. For now, flat rate or zero.
    const shipping = subtotal > 0 ? 15.00 : 0;
    const documentShippingTotal = document.getElementById('order-shipping');
    if(documentShippingTotal && subtotal > 0){
        documentShippingTotal.textContent = `$${shipping.toFixed(2)}`;
    } else if (documentShippingTotal) {
        documentShippingTotal.textContent = `$0.00`;
    }
    
    // Discount logic
    const discountEl = document.getElementById('order-discount');
    let discount = 0;
    if(appliedCoupon === 'SHOPEASE10'){
        discount = subtotal * 0.1;
        if(discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
    }

    const total = subtotal + shipping - discount;

    orderSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    orderTotalEl.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        localStorage.setItem('shopease_cart', JSON.stringify(cart));
        updateCartCount(); // from script.js
        renderCartPage();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('shopease_cart', JSON.stringify(cart));
    updateCartCount(); // from script.js
    renderCartPage();
    showToast('Item removed from cart', 'error'); // using error type for deletion visual
}

// Simple Coupon System logic
let appliedCoupon = null;

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const msgEl = document.getElementById('coupon-msg');
    const code = input.value.trim().toUpperCase();

    if(code === 'SHOPEASE10') {
        appliedCoupon = code;
        msgEl.textContent = '10% Discount applied!';
        msgEl.style.color = 'var(--success-color)';
        renderCartPage();
        showToast('Coupon applied successfully', 'success');
    } else {
        appliedCoupon = null;
        msgEl.textContent = 'Invalid or expired coupon code.';
        msgEl.style.color = 'var(--danger-color)';
        renderCartPage();
    }
}

// Expose to window for inline onclick attributes
window.applyCoupon = applyCoupon;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

function processCheckout() {
    const currentCart = JSON.parse(localStorage.getItem('shopease_cart')) || [];
    if (currentCart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('shopease_user'));
    if (!user) {
        showToast('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout.html';
        }, 1500);
        return;
    }

    // Go to dedicated checkout page
    window.location.href = 'checkout.html';
}
window.processCheckout = processCheckout;
