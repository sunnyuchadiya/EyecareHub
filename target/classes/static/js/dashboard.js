/* 
   Dashboard Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    loadProfile();
    loadOrders();
});

async function loadProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        document.getElementById('profileName').innerText = user.username || 'User';
        document.getElementById('profileEmail').innerText = user.email || 'user@example.com';

        // Initials
        const initials = (user.username || 'U').charAt(0).toUpperCase();
        document.getElementById('profileInitials').innerText = initials;

        // Form inputs
        const nameInput = document.getElementById('editName');
        const emailInput = document.getElementById('editEmail');
        if (nameInput) nameInput.value = user.username || '';
        if (emailInput) emailInput.value = user.email || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadOrders() {
    const list = document.getElementById('order-list');
    if (!list) return;

    try {
        // Fetch orders from backend
        const orders = await apiCall('/orders');
        
        if (!orders || orders.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">No orders yet</p>';
            return;
        }

        list.innerHTML = orders.map(order => `
            <div class="order-card fade-in">
                <div class="order-header">
                    <div>
                        <strong>#${order._id}</strong>
                        <div style="font-size: 0.85rem; color: #888;">${new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600;">$${order.totalPrice || 0}</div>
                        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items && order.items.length > 0 
                        ? order.items.slice(0, 3).map(item => `
                            <img src="${item.imageUrl || 'https://via.placeholder.com/80'}" 
                                 class="order-thumb" 
                                 alt="${item.name}">
                          `).join('')
                        : '<p style="font-size: 0.9rem; color: #999;">No items</p>'
                    }
                </div>
                <button class="btn btn-outline btn-sm" onclick="viewOrder('${order._id}')">View Details</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        list.innerHTML = '<p style="text-align: center; color: red;">Error loading orders</p>';
    }
}

function switchTab(tabId, link) {
    // Hide all tabs
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));

    // Show target
    const target = document.getElementById(tabId);
    target.classList.remove('hidden');
    target.classList.add('active');

    // Update nav
    document.querySelectorAll('.dash-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
}

window.logout = function () {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function loadWishlist() {
    const list = document.getElementById('wishlist-grid');
    if (!list) return;

    // Mock Wishlist Items
    const wishlistItems = [
        { id: 2, name: "Apple Watch Ultra", price: 799, image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=1740&auto=format&fit=crop" },
        { id: 5, name: "MacBook Pro 16", price: 2499, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1626&auto=format&fit=crop" }
    ];

    list.innerHTML = wishlistItems.map(item => `
        <div class="product-card" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; position: relative;">
            <div style="height: 180px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); padding: 20px;">
                <img src="${item.image}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                <button onclick="removeFromWishlist(this)" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div style="padding: 15px;">
                <h4 style="font-size: 1rem; margin-bottom: 5px;">${item.name}</h4>
                <div style="font-weight: 600; margin-bottom: 10px;">$${item.price}</div>
                <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="addToCartDetail(${item.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Remove wishlist item dom only for demo
window.removeFromWishlist = function (btn) {
    const card = btn.closest('.product-card');
    card.style.opacity = '0';
    setTimeout(() => card.remove(), 300);
}

// Add Address Modal
window.openAddressModal = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal(this)"><i class="fa-solid fa-xmark"></i></span>
            <h2 style="margin-bottom: 20px;">Add New Address</h2>
            <form id="addAddressForm">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #888;">Address Label</label>
                    <input type="text" class="form-input" placeholder="e.g. Work" required>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #888;">Street Address</label>
                    <input type="text" class="form-input" placeholder="123 Street..." required>
                </div>
                <div class="flex" style="gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">City</label>
                        <input type="text" class="form-input" required>
                    </div>
                     <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Zip</label>
                        <input type="text" class="form-input" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Save Address</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Handle close inside
    modal.querySelector('.modal-close').onclick = () => document.body.removeChild(modal);

    // Handle Submit
    document.getElementById('addAddressForm').onsubmit = (e) => {
        e.preventDefault();
        document.body.removeChild(modal);
        // Toast
        alert("Address saved successfully!");
    }
}

// View Order Details
window.viewOrder = function (id) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()"><i class="fa-solid fa-xmark"></i></span>
            <h2 style="margin-bottom: 20px;">Order Details #${id}</h2>
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #333;">
                <div class="flex justify-between" style="margin-bottom: 10px;">
                    <span style="color: #888;">Status</span>
                    <span class="order-status processing">Processing</span>
                </div>
                <div class="flex justify-between" style="margin-bottom: 10px;">
                    <span style="color: #888;">Date</span>
                    <span>Oct 24, 2025</span>
                </div>
                <div class="flex justify-between">
                    <span style="color: #888;">Payment Method</span>
                    <span>Visa ending in 4242</span>
                </div>
            </div>
            
            <h4 style="margin-bottom: 15px;">Items</h4>
            <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
                 <div class="flex justify-between" style="margin-bottom: 10px;">
                    <span>Sony WH-1000XM5 (x1)</span>
                    <span>$349</span>
                </div>
            </div>
            
            <div class="flex justify-between" style="margin-top: 20px; font-size: 1.2rem; font-weight: 700;">
                <span>Total</span>
                <span>$349</span>
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">Download Invoice</button>
        </div>
    `;
    document.body.appendChild(modal);
}
