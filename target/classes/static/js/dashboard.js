/* 
   Dashboard Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    checkUser();
    loadProfile();
    loadOrders();
    loadWishlist();
    renderAddresses();
});

const ADDRESS_STORAGE_KEY = 'userAddresses';

function checkUser() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
    }
}

function formatCurrency(amount) {
    return '₹' + (amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    document.getElementById('profileName').innerText = user.name || user.username || 'User';
    document.getElementById('profileEmail').innerText = user.email || 'user@example.com';

    // Initials
    const initials = (user.name || user.username || 'U').charAt(0).toUpperCase();
    document.getElementById('profileInitials').innerText = initials;

    // Form inputs
    const nameInput = document.getElementById('editName');
    const emailInput = document.getElementById('editEmail');
    const phoneInput = document.getElementById('editPhone');
    if (nameInput) nameInput.value = user.name || user.username || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
}

window.saveProfile = function () {
    const nameInput = document.getElementById('editName');
    const phoneInput = document.getElementById('editPhone');
    const msgEl = document.getElementById('profile-save-msg');

    const name = (nameInput ? nameInput.value : '').trim();
    if (!name) {
        if (msgEl) {
            msgEl.innerText = 'Name cannot be empty.';
            msgEl.style.color = '#ff7f7f';
        }
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = name;
    user.username = name;
    if (phoneInput) user.phone = phoneInput.value.trim();
    localStorage.setItem('user', JSON.stringify(user));

    // Refresh sidebar display
    document.getElementById('profileName').innerText = name;
    document.getElementById('profileInitials').innerText = name.charAt(0).toUpperCase();

    if (msgEl) {
        msgEl.innerText = 'Profile saved successfully!';
        msgEl.style.color = '#76d77d';
        setTimeout(() => { msgEl.innerText = ''; }, 3000);
    }
};

async function loadOrders() {
    const list = document.getElementById('order-list');
    if (!list) return;

    try {
        const orders = await apiCall('/orders', 'GET');
        
        if (!orders || orders.length === 0) {
            list.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No orders found. Start shopping!</div>';
            return;
        }

        list.innerHTML = orders.map(order => {
            const date = new Date(order.createdAt || order.date).toLocaleDateString();
            const status = order.status || 'PENDING';
            const total = formatCurrency(order.totalPrice || order.total || 0);
            
            // Extract image logic - handle dynamic items
            let imagesHtml = '';
            if (order.items && order.items.length > 0) {
                const maxImgs = Math.min(order.items.length, 3);
                for (let i = 0; i < maxImgs; i++) {
                    const item = order.items[i];
                    const src = item.imageUrl || item.image || 'https://via.placeholder.com/40';
                    imagesHtml += `<img src="${src}" class="order-thumb" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; margin-right: -10px; border: 2px solid #111;">`;
                }
                if (order.items.length > 3) {
                    imagesHtml += `<div style="display: inline-flex; width: 40px; height: 40px; border-radius: 8px; background: #333; color: #fff; align-items: center; justify-content: center; font-size: 0.8rem; border: 2px solid #111; z-index: 1; position: relative; margin-left: 5px;">+${order.items.length - 3}</div>`;
                }
            }
            
            return `
            <div class="order-card fade-in">
                <div class="order-header">
                    <div>
                        <strong>#${(order.id || order._id || '').substring(0, 8)}</strong>
                        <div style="font-size: 0.85rem; color: #888;">${date}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600;">${total}</div>
                        <span class="order-status ${status.toLowerCase()}">${status}</span>
                    </div>
                </div>
                <div class="order-items" style="display: flex; align-items: center; margin: 15px 0;">
                    ${imagesHtml}
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load orders:', error);
        list.innerHTML = '<div style="color: #f44336; text-align: center; padding: 20px;">Failed to load orders.</div>';
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

    if (tabId === 'address') {
        renderAddresses();
    }
}

window.logout = function () {
    authAPI.logout();
    window.location.href = 'login.html';
}

function loadWishlist() {
    const list = document.getElementById('wishlist-grid');
    if (!list) return;

    let wishlistItems = [];
    try {
        wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    } catch (_) {
        wishlistItems = [];
    }

    if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) {
        list.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">Your wishlist is empty. Add products using the heart icon.</div>';
        return;
    }

    list.innerHTML = wishlistItems.map(item => `
        <div class="product-card" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; position: relative;">
            <div style="height: 180px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); padding: 20px;">
                <img src="${item.image}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                <button onclick="removeFromWishlist('${item.id}')" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div style="padding: 15px;">
                <h4 style="font-size: 1rem; margin-bottom: 5px;">${item.name}</h4>
                <div style="font-weight: 600; margin-bottom: 10px;">₹${item.price}</div>
                <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="window.location.href='product.html?id=${item.id}'">View Product</button>
            </div>
        </div>
    `).join('');
}

window.removeFromWishlist = function (productId) {
    let wishlistItems = [];
    try {
        wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    } catch (_) {
        wishlistItems = [];
    }

    const updated = (Array.isArray(wishlistItems) ? wishlistItems : []).filter(item => String(item.id) !== String(productId));
    localStorage.setItem('wishlistItems', JSON.stringify(updated));
    loadWishlist();
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getAddresses() {
    try {
        const stored = JSON.parse(localStorage.getItem(ADDRESS_STORAGE_KEY) || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
    } catch (_) {
        // Fall through to default seed.
    }

    return [
        {
            label: 'Home',
            street: '123 Tech Street',
            city: 'Silicon Valley',
            zip: '94000',
            isDefault: true
        }
    ];
}

function saveAddresses(addresses) {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
}

function renderAddresses() {
    const list = document.getElementById('address-list');
    if (!list) return;

    const addresses = getAddresses();
    saveAddresses(addresses);

    list.innerHTML = addresses.map((address, index) => `
        <div class="order-card" style="margin-bottom: 12px;">
            <div style="margin-bottom: 10px;">
                <strong>${escapeHtml(address.label)}</strong>
                ${address.isDefault ? '<span style="font-size: 0.8rem; background: #333; padding: 2px 6px; border-radius: 4px; margin-left: 10px;">Default</span>' : ''}
            </div>
            <p style="color: #aaa; font-size: 0.9rem;">${escapeHtml(address.street)}, ${escapeHtml(address.city)}, ${escapeHtml(address.zip)}</p>
            <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
                <button class="btn btn-outline btn-sm" onclick="editAddress(${index})">Edit</button>
                <button class="remove-btn" onclick="deleteAddress(${index})">Delete</button>
                ${address.isDefault ? '' : `<button class="btn btn-sm" style="border: 1px solid #444; background: transparent; color: #fff;" onclick="setDefaultAddress(${index})">Set Default</button>`}
            </div>
        </div>
    `).join('');
}

window.openAddressModal = function (index = null) {
    const addresses = getAddresses();
    const editing = index !== null && index >= 0 && index < addresses.length;
    const current = editing ? addresses[index] : { label: '', street: '', city: '', zip: '' };

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close"><i class="fa-solid fa-xmark"></i></span>
            <h2 style="margin-bottom: 20px;">${editing ? 'Edit Address' : 'Add New Address'}</h2>
            <form id="addressForm">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #888;">Address Label</label>
                    <input id="address-label" type="text" class="form-input" placeholder="e.g. Work" value="${escapeHtml(current.label)}" required>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #888;">Street Address</label>
                    <input id="address-street" type="text" class="form-input" placeholder="123 Street..." value="${escapeHtml(current.street)}" required>
                </div>
                <div class="flex" style="gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">City</label>
                        <input id="address-city" type="text" class="form-input" value="${escapeHtml(current.city)}" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #888;">Zip</label>
                        <input id="address-zip" type="text" class="form-input" value="${escapeHtml(current.zip)}" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">${editing ? 'Update Address' : 'Save Address'}</button>
            </form>
        </div>
    `;

    const closeModal = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };

    modal.querySelector('.modal-close').onclick = closeModal;
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.body.appendChild(modal);

    document.getElementById('addressForm').onsubmit = (event) => {
        event.preventDefault();

        const payload = {
            label: document.getElementById('address-label').value.trim(),
            street: document.getElementById('address-street').value.trim(),
            city: document.getElementById('address-city').value.trim(),
            zip: document.getElementById('address-zip').value.trim(),
            isDefault: false
        };

        if (!payload.label || !payload.street || !payload.city || !payload.zip) {
            alert('Please fill all address fields.');
            return;
        }

        if (editing) {
            payload.isDefault = !!addresses[index].isDefault;
            addresses[index] = payload;
        } else {
            payload.isDefault = addresses.length === 0;
            addresses.push(payload);
        }

        if (!addresses.some(item => item.isDefault) && addresses.length > 0) {
            addresses[0].isDefault = true;
        }

        saveAddresses(addresses);
        renderAddresses();
        closeModal();
    };
};

window.editAddress = function (index) {
    openAddressModal(index);
};

window.deleteAddress = function (index) {
    const addresses = getAddresses();
    if (index < 0 || index >= addresses.length) return;

    const removedDefault = !!addresses[index].isDefault;
    addresses.splice(index, 1);

    if (addresses.length > 0 && (removedDefault || !addresses.some(item => item.isDefault))) {
        addresses.forEach((item, idx) => {
            item.isDefault = idx === 0;
        });
    }

    saveAddresses(addresses);
    renderAddresses();
};

window.setDefaultAddress = function (index) {
    const addresses = getAddresses();
    addresses.forEach((item, idx) => {
        item.isDefault = idx === index;
    });
    saveAddresses(addresses);
    renderAddresses();
};

// View Order Details
window.viewOrder = function (id) {
    // Currently disabled for active DB fetch
    console.log("View order", id);
}
