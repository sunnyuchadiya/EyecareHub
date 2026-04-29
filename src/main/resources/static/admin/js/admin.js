/**
 * Admin Panel JavaScript
 * Handles all admin operations using Backend API
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is admin
    checkAdminAccess();

    // Load appropriate page content
    if (document.getElementById('total-users')) {
        loadDashboardStats();
        loadRecentOrders();
        loadRecentUsers();
        loadTopProducts();
    }
    if (document.getElementById('users-table-body')) loadUsersTable();
    if (document.getElementById('products-table-body')) loadProductsTable();
    if (document.getElementById('coupons-table-body')) loadCouponsTable();
    if (document.getElementById('orders-table-body')) loadOrdersTable();

    if (document.getElementById('coupon-form')) {
        document.getElementById('coupon-form').addEventListener('submit', handleCouponSubmit);
    }
});

/**
 * Check if user is authenticated and has admin role
 */
function checkAdminAccess() {
    if (!isAuthenticated()) {
        window.location.href = '../pages/login.html';
        return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);
        if (!user.roles || !user.roles.includes('ROLE_ADMIN')) {
            alert('Access denied. Admin role required.');
            window.location.href = '../index.html';
        }
    } catch (e) {
        window.location.href = '../pages/login.html';
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        // Try to call backend logout endpoint if available
        try {
            await apiCall('/auth/logout', 'POST');
        } catch (e) {
            console.log('Backend logout not available, clearing local session');
        }
    } catch (error) {
        console.log('Logout error:', error);
    } finally {
        // Clear all authentication data from localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        
        // Add small delay to ensure cleanup completes
        setTimeout(() => {
            // Redirect to login page
            window.location.href = '../pages/login.html';
        }, 300);
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '₹' + (amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * Animate counter values
 */
function animateValue(id, start, end, duration, prefix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = prefix + value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ============ DASHBOARD FUNCTIONS ============

async function loadDashboardStats() {
    try {
        const response = await apiCall('/admin/dashboard-stats', 'GET');
        // Parse the response
        const stats = {};
        const parts = response.message.split(',');
        parts.forEach(part => {
            const [key, value] = part.split(':');
            stats[key] = parseInt(value);
        });

        const totalProducts = stats.totalProducts || 0;
        animateValue('total-users', 0, stats.totalUsers || 0, 1000);
        animateValue('total-products', 0, totalProducts, 1500);
        animateValue('total-orders', 0, stats.totalOrders || 0, 2000);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        const totalUsersEl = document.getElementById('total-users');
        const totalProductsEl = document.getElementById('total-products');
        const totalOrdersEl = document.getElementById('total-orders');
        if (totalUsersEl) totalUsersEl.innerText = '0';
        if (totalProductsEl) totalProductsEl.innerText = '0';
        if (totalOrdersEl) totalOrdersEl.innerText = '0';
    }
}

// Load recent orders for dashboard
async function loadRecentOrders() {
    try {
        const orders = await apiCall('/admin/orders', 'GET');
        const container = document.getElementById('recent-orders-container');
        if (!container) return;

        // Get last 5 orders
        const recentOrders = (Array.isArray(orders) ? orders : []).slice(0, 5);
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="empty-state">No orders yet</td></tr>';
            return;
        }

        container.innerHTML = '';
        recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            const orderId = order.id || order._id || 'N/A';
            const customerName = order.customerName || order.userName || 'Guest';
            const amount = order.totalPrice || order.amount || 0;
            const status = (order.status || 'PENDING').toUpperCase();
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A';
            const shortId = String(orderId).slice(-8);

            // Determine status badge class
            let statusClass = 'pending';
            if (status === 'DELIVERED') statusClass = 'delivered';
            else if (status === 'CANCELLED') statusClass = 'cancelled';

            tr.innerHTML = `
                <td>#${shortId}</td>
                <td>${escapeHtml(customerName)}</td>
                <td>${formatCurrency(amount)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${date}</td>
            `;
            container.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent orders:', error);
        const container = document.getElementById('recent-orders-container');
        if (container) {
            container.innerHTML = '<tr><td colspan="5" class="empty-state error">Error loading orders</td></tr>';
        }
    }
}

// Load recent users for dashboard
async function loadRecentUsers() {
    try {
        const users = await apiCall('/admin/users', 'GET');
        const container = document.getElementById('recent-users-container');
        if (!container) return;

        // Get last 5 users
        const recentUsers = (Array.isArray(users) ? users : []).slice(0, 5);
        
        if (recentUsers.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="empty-state">No users found</td></tr>';
            return;
        }

        container.innerHTML = '';
        recentUsers.forEach(user => {
            const tr = document.createElement('tr');
            const username = user.username || 'Unknown';
            const email = user.email || 'N/A';
            const isBlocked = user.blocked === true || user.isBlocked === true;
            const status = isBlocked ? 'BLOCKED' : 'ACTIVE';
            const statusClass = isBlocked ? 'blocked' : 'active';
            const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A';

            tr.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                        ${escapeHtml(username)}
                    </div>
                </td>
                <td>${escapeHtml(email)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>${joinedDate}</td>
            `;
            container.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent users:', error);
        const container = document.getElementById('recent-users-container');
        if (container) {
            container.innerHTML = '<tr><td colspan="4" class="empty-state error">Error loading users</td></tr>';
        }
    }
}

// Load top products for dashboard
async function loadTopProducts() {
    try {
        const products = await apiCall('/admin/products', 'GET');
        const container = document.getElementById('top-products-container');
        if (!container) return;

        // Get first 5 products
        const topProducts = (Array.isArray(products) ? products : []).slice(0, 5);
        
        if (topProducts.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="empty-state">No products found</td></tr>';
            return;
        }

        container.innerHTML = '';
        topProducts.forEach(product => {
            const tr = document.createElement('tr');
            const productName = product.name || 'Unknown';
            const price = product.price || 0;
            const stock = product.stock !== undefined ? product.stock : (product.quantity || 0);
            const category = product.category || 'Uncategorized';

            tr.innerHTML = `
                <td>${escapeHtml(productName)}</td>
                <td>${formatCurrency(price)}</td>
                <td><span style="color: ${stock > 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">${stock}</span></td>
                <td>${escapeHtml(category)}</td>
            `;
            container.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading top products:', error);
        const container = document.getElementById('top-products-container');
        if (container) {
            container.innerHTML = '<tr><td colspan="4" class="empty-state error">Error loading products</td></tr>';
        }
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ USERS MANAGEMENT ============

let adminUsersCache = [];

async function loadUsersTable() {
    try {
        const users = await apiCall('/admin/users', 'GET');
        adminUsersCache = users;
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        bindUserFilterEvents();
        renderUserRows(adminUsersCache, tbody);
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('users-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Error loading users</td></tr>';
    }
}

function renderUserRows(userList, tbody) {
    tbody.innerHTML = '';
    
    userList.forEach(user => {
        const tr = document.createElement('tr');
        const userId = user.id || user._id || '';
        const isBlocked = user.blocked === true || user.isBlocked === true;
        const shortId = userId ? String(userId).slice(-8) : '-';
        const statusLabel = isBlocked
            ? '<span class="user-status-badge blocked">Blocked</span>'
            : '<span class="user-status-badge active">Active</span>';

        tr.innerHTML = `
            <td style="font-family: monospace; color: #bbb;">${shortId}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 30px; height: 30px; background: linear-gradient(135deg, var(--accent-color), #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-size: 0.8rem; font-weight: 600;">
                        ${user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    ${user.username || 'Unknown'}
                </div>
            </td>
            <td>${user.email}</td>
            <td>${statusLabel}</td>
            <td class="user-actions-cell">
                ${isBlocked
                    ? `<button class="action-btn user-action-btn unblock" onclick="toggleUserBlock('${userId}', false)" title="Unblock User"><i class="fa-solid fa-unlock"></i><span>Unblock</span></button>`
                    : `<button class="action-btn user-action-btn block" onclick="toggleUserBlock('${userId}', true)" title="Block User"><i class="fa-solid fa-lock"></i><span>Block</span></button>
                    <button class="action-btn user-action-btn delete" onclick="deleteUser('${userId}')" title="Delete User"><i class="fa-solid fa-trash"></i></button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (userList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No users found matching search criteria</td></tr>';
    }
}

function applyUserFilters() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const searchEl = document.getElementById('user-search');
    const searchValue = (searchEl?.value || '').trim().toLowerCase();

    const filtered = adminUsersCache.filter(user => {
        const name = (user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const id = ((typeof user.id === 'string' ? user.id : String(user.id)) || '').toLowerCase();

        return !searchValue || name.includes(searchValue) || email.includes(searchValue) || id.includes(searchValue);
    });

    renderUserRows(filtered, tbody);
}

function bindUserFilterEvents() {
    const searchEl = document.getElementById('user-search');
    if (searchEl && !searchEl.dataset.bound) {
        searchEl.addEventListener('input', applyUserFilters);
        searchEl.dataset.bound = '1';
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await apiCall(`/admin/users/${userId}`, 'DELETE');
        alert('User deleted successfully');
        loadUsersTable();
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

async function toggleUserBlock(userId, block) {
    const action = block ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        try {
            await apiCall(`/admin/users/${userId}/block?block=${block}`, 'PUT');
        } catch (primaryError) {
            // Fallback endpoint for older/newer backend route variants
            await apiCall(`/admin/users/${userId}/blocked`, 'PATCH', { blocked: block });
        }

        // Refresh from backend so UI always shows actual saved status
        await loadUsersTable();
        alert(`User ${action}ed successfully`);
    } catch (error) {
        alert(`Error trying to ${action} user: ` + error.message);
    }
}

// ============ PRODUCTS MANAGEMENT ============

let adminProductsCache = [];
let isDbBackedProducts = true;
const PRODUCT_API_BASE = '/products';
const PRODUCT_ADMIN_API_BASE = '/admin/products';

async function apiCallWithFallback(primaryPath, method, data = null, fallbackPath = null) {
    try {
        return await apiCall(primaryPath, method, data);
    } catch (primaryError) {
        if (!fallbackPath) {
            throw primaryError;
        }
        try {
            return await apiCall(fallbackPath, method, data);
        } catch (fallbackError) {
            throw fallbackError;
        }
    }
}

function getFallbackProducts() {
    if (typeof products !== 'undefined' && Array.isArray(products)) {
        return products;
    }
    if (Array.isArray(window.products)) {
        return window.products;
    }
    return [];
}

function renderProductRows(productList, tbody) {
    tbody.innerHTML = '';

    if (!productList || productList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No products found</td></tr>';
        return;
    }

    productList.forEach(product => {
        const productId = product._id || product.id;
        const actionsHtml = isDbBackedProducts
            ? `
                <button class="action-btn" onclick="editProduct('${productId}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" onclick="deleteProduct('${productId}')"><i class="fa-solid fa-trash"></i></button>
            `
            : '<span style="font-size: 0.8rem; color: #999;">Import required</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.imageUrl || product.image || 'https://via.placeholder.com/40'}" alt="${product.name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
            <td>${product.name || product.title}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock || 0}</td>
            <td>${actionsHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function applyProductFilters() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    const searchEl = document.getElementById('product-search');
    const categoryEl = document.getElementById('product-category-filter');

    const searchValue = (searchEl?.value || '').trim().toLowerCase();
    const categoryValue = categoryEl?.value || '';

    const filtered = adminProductsCache.filter(product => {
        const name = (product.name || product.title || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const category = product.category || '';

        const matchesSearch = !searchValue || name.includes(searchValue) || brand.includes(searchValue);
        const matchesCategory = !categoryValue || category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    renderProductRows(filtered, tbody);
}

function bindProductFilterEvents() {
    const searchEl = document.getElementById('product-search');
    const categoryEl = document.getElementById('product-category-filter');

    if (searchEl && !searchEl.dataset.bound) {
        searchEl.addEventListener('input', applyProductFilters);
        searchEl.dataset.bound = '1';
    }

    if (categoryEl && !categoryEl.dataset.bound) {
        categoryEl.addEventListener('change', applyProductFilters);
        categoryEl.dataset.bound = '1';
    }
}

async function seedProductsFromDataJsIfNeeded() {
    const fallbackProducts = getFallbackProducts();
    if (fallbackProducts.length === 0) return false;

    for (const p of fallbackProducts) {
        try {
            await apiCallWithFallback(
                `${PRODUCT_API_BASE}`,
                'POST',
                {
                name: p.name,
                category: p.category,
                price: Number(p.price) || 0,
                stock: 15,
                imageUrl: p.image || '',
                description: p.desc || p.name,
                brand: p.brand || 'EyeCareHub Generic',
                gender: 'Unisex',
                discount: 0,
                rating: Number(p.rating) || 4.5
                },
                `${PRODUCT_ADMIN_API_BASE}`
            );
        } catch (e) {
            // Ignore individual insert failures (e.g. duplicates) and continue.
            console.log('Seed product skipped:', p.name, e.message || e);
        }
    }

    return true;
}

async function loadProductsTable() {
    try {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        bindProductFilterEvents();

        let dbProducts = await apiCallWithFallback(
            `${PRODUCT_API_BASE}`,
            'GET',
            null,
            `${PRODUCT_ADMIN_API_BASE}`
        );

        if (dbProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No products in DB. Importing from data.js...</td></tr>';

            const seeded = await seedProductsFromDataJsIfNeeded();
            if (seeded) {
                dbProducts = await apiCallWithFallback(
                    `${PRODUCT_API_BASE}`,
                    'GET',
                    null,
                    `${PRODUCT_ADMIN_API_BASE}`
                );
            }
        }

        if (dbProducts.length > 0) {
            isDbBackedProducts = true;
            adminProductsCache = dbProducts;
            applyProductFilters();
            loadDashboardStats();
            return;
        }

        const fallbackProducts = getFallbackProducts().map(p => ({
            ...p,
            stock: 15,
            imageUrl: p.image
        }));

        isDbBackedProducts = false;
        adminProductsCache = fallbackProducts;
        applyProductFilters();

        if (fallbackProducts.length > 0) {
            tbody.innerHTML = tbody.innerHTML.replace(
                '</td></tr>',
                ' (DB permission issue or API error)</td></tr>'
            );
        }
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.getElementById('products-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">Error loading products</td></tr>';
    }
}

function openAddProductModal() {
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal-title').innerText = 'Add New Product';
    document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
}

// Setup product form submission
if (document.getElementById('product-form')) {
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('product-id').value;
    const name = (document.getElementById('product-name').value || '').trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value, 10);
    const imageInput = (document.getElementById('product-image').value || '').trim();

    if (!name) {
        alert('Product name is required');
        return;
    }

    if (Number.isNaN(price) || price < 0) {
        alert('Valid product price is required');
        return;
    }

    if (Number.isNaN(stock) || stock < 0) {
        alert('Valid stock is required');
        return;
    }

    const normalizedImage = imageInput
        ? (imageInput.startsWith('http://') || imageInput.startsWith('https://')
            ? imageInput
            : `https://${imageInput}`)
        : 'https://via.placeholder.com/120';

    const productData = {
        name,
        category,
        price,
        stock,
        imageUrl: normalizedImage,
        description: document.getElementById('product-description')?.value || name,
        brand: 'EyeCareHub Generic', // Validated attribute required by backend
        gender: 'Unisex',            // Validated attribute required by backend
        rating: 5,
        discount: 0
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';
    }

    try {
        if (productId) {
            // Update existing product
            await apiCallWithFallback(
                `${PRODUCT_API_BASE}/${productId}`,
                'PUT',
                productData,
                `${PRODUCT_ADMIN_API_BASE}/${productId}`
            );
            alert('Product updated successfully');
        } else {
            // Create new product
            await apiCallWithFallback(
                `${PRODUCT_API_BASE}`,
                'POST',
                productData,
                `${PRODUCT_ADMIN_API_BASE}`
            );
            alert('Product created successfully');
        }
        closeProductModal();
        loadProductsTable();
    } catch (error) {
        alert('Error saving product: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
}

async function editProduct(productId) {
    if (!isDbBackedProducts) {
        alert('Products are not imported into DB yet. Please refresh and allow import first.');
        return;
    }

    try {
        const product = await apiCallWithFallback(
            `${PRODUCT_API_BASE}/${productId}`,
            'GET',
            null,
            `${PRODUCT_ADMIN_API_BASE}/${productId}`
        );
        document.getElementById('product-id').value = product._id || product.id;
        document.getElementById('product-name').value = product.name || product.title;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.imageUrl || product.image || '';
        if (document.getElementById('product-description')) {
            document.getElementById('product-description').value = product.description || '';
        }
        document.getElementById('product-modal-title').innerText = 'Edit Product';
        document.getElementById('product-modal').classList.add('open');
    } catch (error) {
        alert('Error loading product: ' + error.message);
    }
}

async function deleteProduct(productId) {
    if (!isDbBackedProducts) {
        alert('Products are not imported into DB yet. Please refresh and allow import first.');
        return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await apiCallWithFallback(
            `${PRODUCT_API_BASE}/${productId}`,
            'DELETE',
            null,
            `${PRODUCT_ADMIN_API_BASE}/${productId}`
        );
        alert('Product deleted successfully');
        loadProductsTable();
    } catch (error) {
        alert('Error deleting product: ' + error.message);
    }
}

// ============ COUPONS MANAGEMENT ============

let adminCouponsCache = [];

function formatDateTime(dateValue) {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN');
}

function getCouponStatus(coupon) {
    if (!coupon.active) return { label: 'Inactive', color: '#999' };
    const now = Date.now();
    const startsAt = coupon.startDate ? new Date(coupon.startDate).getTime() : null;
    const expiresAt = coupon.expiryDate ? new Date(coupon.expiryDate).getTime() : null;
    const isOutOfStock = (coupon.usedCount || 0) >= (coupon.maxUses || 0);

    if (isOutOfStock) return { label: 'Used Up', color: '#f44336' };
    if (startsAt && now < startsAt) return { label: 'Scheduled', color: '#2196f3' };
    if (expiresAt && now > expiresAt) return { label: 'Expired', color: '#ff9800' };
    return { label: 'Active', color: '#4caf50' };
}

function renderCouponRows(couponList, tbody) {
    tbody.innerHTML = '';

    couponList.forEach(coupon => {
        const couponId = coupon.id || coupon._id;
        const status = getCouponStatus(coupon);
        const usedCount = coupon.usedCount || 0;
        const maxUses = coupon.maxUses || 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: monospace; color: #ddd;">${coupon.code || '-'}</td>
            <td>${formatCurrency(coupon.discountAmount || 0)}</td>
            <td>${usedCount} / ${maxUses}</td>
            <td>${formatDateTime(coupon.startDate)}</td>
            <td>${formatDateTime(coupon.expiryDate)}</td>
            <td><span style="color: ${status.color}; font-weight: 600;">${status.label}</span></td>
            <td>
                <button class="action-btn" onclick="editCoupon('${couponId}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" onclick="deleteCoupon('${couponId}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (couponList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No coupons found</td></tr>';
    }
}

function applyCouponFilters() {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    const searchEl = document.getElementById('coupon-search');
    const statusEl = document.getElementById('coupon-status-filter');
    const searchValue = (searchEl?.value || '').trim().toLowerCase();
    const statusValue = statusEl?.value || '';

    const filtered = adminCouponsCache.filter(coupon => {
        const code = (coupon.code || '').toLowerCase();
        const status = getCouponStatus(coupon).label;
        const matchesSearch = !searchValue || code.includes(searchValue);
        const matchesStatus = !statusValue || status === statusValue;
        return matchesSearch && matchesStatus;
    });

    renderCouponRows(filtered, tbody);
}

function bindCouponFilterEvents() {
    const searchEl = document.getElementById('coupon-search');
    const statusEl = document.getElementById('coupon-status-filter');

    if (searchEl && !searchEl.dataset.bound) {
        searchEl.addEventListener('input', applyCouponFilters);
        searchEl.dataset.bound = '1';
    }

    if (statusEl && !statusEl.dataset.bound) {
        statusEl.addEventListener('change', applyCouponFilters);
        statusEl.dataset.bound = '1';
    }
}

async function loadCouponsTable() {
    try {
        const coupons = await apiCall('/admin/coupons', 'GET');
        adminCouponsCache = Array.isArray(coupons) ? coupons : [];
        bindCouponFilterEvents();
        applyCouponFilters();
    } catch (error) {
        console.error('Error loading coupons:', error);
        const tbody = document.getElementById('coupons-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Error loading coupons</td></tr>';
    }
}

function openAddCouponModal() {
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-used-count').value = '0';
    document.getElementById('coupon-active').checked = true;
    document.getElementById('coupon-modal-title').innerText = 'Add New Coupon';
    document.getElementById('coupon-modal').classList.add('open');
}

function closeCouponModal() {
    document.getElementById('coupon-modal').classList.remove('open');
}

function toDateTimeLocalValue(dateValue) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeDateTimeForApi(value) {
    if (!value || value.trim() === '') return null;
    // Handle both formats: yyyy-MM-ddTHH:mm and yyyy-MM-ddTHH:mm:ss
    // Custom backend deserializer will handle both
    return value.trim();
}

async function editCoupon(couponId) {
    try {
        const coupon = await apiCall(`/admin/coupons/${couponId}`, 'GET');
        document.getElementById('coupon-id').value = coupon.id || coupon._id;
        document.getElementById('coupon-code').value = coupon.code || '';
        document.getElementById('coupon-discount').value = coupon.discountAmount || 0;
        document.getElementById('coupon-max-uses').value = coupon.maxUses || 1;
        document.getElementById('coupon-used-count').value = coupon.usedCount || 0;
        document.getElementById('coupon-start-date').value = toDateTimeLocalValue(coupon.startDate);
        document.getElementById('coupon-expiry-date').value = toDateTimeLocalValue(coupon.expiryDate);
        document.getElementById('coupon-active').checked = coupon.active !== false;
        document.getElementById('coupon-modal-title').innerText = 'Edit Coupon';
        document.getElementById('coupon-modal').classList.add('open');
    } catch (error) {
        alert('Error loading coupon: ' + error.message);
    }
}

async function handleCouponSubmit(e) {
    e.preventDefault();
    const couponId = document.getElementById('coupon-id').value;
    const code = (document.getElementById('coupon-code').value || '').trim().toUpperCase();
    const discountAmount = parseFloat(document.getElementById('coupon-discount').value);
    const maxUses = parseInt(document.getElementById('coupon-max-uses').value, 10);
    const usedCount = parseInt(document.getElementById('coupon-used-count').value, 10);
    const startDate = document.getElementById('coupon-start-date').value;
    const expiryDate = document.getElementById('coupon-expiry-date').value;
    const active = document.getElementById('coupon-active').checked;

    if (!code) {
        alert('Coupon code is required');
        return;
    }

    if (Number.isNaN(discountAmount) || discountAmount <= 0) {
        alert('Discount amount must be greater than 0');
        return;
    }

    if (Number.isNaN(maxUses) || maxUses <= 0) {
        alert('Max uses must be at least 1');
        return;
    }

    if (Number.isNaN(usedCount) || usedCount < 0) {
        alert('Used count cannot be negative');
        return;
    }

    if (startDate && expiryDate && new Date(startDate).getTime() > new Date(expiryDate).getTime()) {
        alert('Start date must be before expiry date');
        return;
    }

    const couponPayload = {
        code,
        discountAmount,
        maxUses,
        usedCount,
        startDate: normalizeDateTimeForApi(startDate),
        expiryDate: normalizeDateTimeForApi(expiryDate),
        active
    };

    console.log('Coupon Payload:', couponPayload);
    console.log('Start Date Raw:', startDate, 'Normalized:', couponPayload.startDate);
    console.log('Expiry Date Raw:', expiryDate, 'Normalized:', couponPayload.expiryDate);

    try {
        if (couponId) {
            await apiCall(`/admin/coupons/${couponId}`, 'PUT', couponPayload);
            alert('Coupon updated successfully');
        } else {
            await apiCall('/admin/coupons', 'POST', couponPayload);
            alert('Coupon created successfully');
        }

        closeCouponModal();
        loadCouponsTable();
    } catch (error) {
        console.error('Coupon save error:', error);
        alert('Error saving coupon: ' + error.message);
    }
}

async function deleteCoupon(couponId) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
        await apiCall(`/admin/coupons/${couponId}`, 'DELETE');
        alert('Coupon deleted successfully');
        loadCouponsTable();
    } catch (error) {
        alert('Error deleting coupon: ' + error.message);
    }
}

// ============ ORDERS MANAGEMENT ============

let adminOrdersCache = [];

async function loadOrdersTable() {
    try {
        const orders = await apiCall('/admin/orders', 'GET');
        adminOrdersCache = orders;
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        bindOrderFilterEvents();
        renderOrderRows(adminOrdersCache, tbody);
    } catch (error) {
        console.error('Error loading orders:', error);
        const tbody = document.getElementById('orders-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Error loading orders</td></tr>';
    }
}

function renderOrderRows(orderList, tbody) {
    tbody.innerHTML = '';

    orderList.forEach(order => {
        const tr = document.createElement('tr');
        const date = new Date(order.orderDate || order.date).toLocaleDateString();
        const status = order.status || 'Pending';
        const statusColor = {
            'PENDING': '#ff9800',
            'PROCESSING': '#2196f3',
            'SHIPPED': '#4caf50',
            'CANCELLED': '#f44336'
        }[status] || '#999';
        
        const shortId = typeof (order._id || order.id) === 'string' ? (order._id || order.id).substring(0, 8) : (order._id || order.id);

        tr.innerHTML = `
            <td style="color: #999;">#${shortId}</td>
            <td>${order.userId || 'User'}</td>
            <td>${date}</td>
            <td>
                <div>${formatCurrency(order.totalPrice || order.total)}</div>
                <div style="font-size: 0.8rem; color: #888;">${order.items ? order.items.length : 0} items</div>
            </td>
            <td>
                <select onchange="updateOrderStatus('${order._id || order.id}', this.value)" style="padding: 5px 10px; background: #222; border: 1px solid #333; color: ${statusColor}; border-radius: 4px; cursor: pointer;">
                    <option value="PENDING" ${status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="PROCESSING" ${status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
                    <option value="SHIPPED" ${status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                    <option value="DELIVERED" ${status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                    <option value="CANCELLED" ${status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteOrder('${order._id || order.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (orderList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No orders found matching search criteria</td></tr>';
    }
}

function applyOrderFilters() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    const searchEl = document.getElementById('order-search');
    const statusEl = document.getElementById('order-status-filter');

    const searchValue = (searchEl?.value || '').trim().toLowerCase();
    const statusValue = statusEl?.value || '';

    const filtered = adminOrdersCache.filter(order => {
        const id = ((order._id || order.id || '')).toLowerCase();
        const customer = (order.userId || '').toLowerCase();
        const status = order.status || 'PENDING';

        const matchesSearch = !searchValue || id.includes(searchValue) || customer.includes(searchValue);
        const matchesStatus = !statusValue || status === statusValue;
        
        return matchesSearch && matchesStatus;
    });

    renderOrderRows(filtered, tbody);
}

function bindOrderFilterEvents() {
    const searchEl = document.getElementById('order-search');
    const statusEl = document.getElementById('order-status-filter');

    if (searchEl && !searchEl.dataset.bound) {
        searchEl.addEventListener('input', applyOrderFilters);
        searchEl.dataset.bound = '1';
    }

    if (statusEl && !statusEl.dataset.bound) {
        statusEl.addEventListener('change', applyOrderFilters);
        statusEl.dataset.bound = '1';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiCall(`/admin/orders/${orderId}/status?status=${status}`, 'PUT');
        alert('Order status updated');
        loadOrdersTable();
    } catch (error) {
        alert('Error updating order: ' + error.message);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        await apiCall(`/admin/orders/${orderId}`, 'DELETE');
        alert('Order deleted successfully');
        loadOrdersTable();
    } catch (error) {
        alert('Error deleting order: ' + error.message);
    }
}

// Logout function
function logout() {
    authAPI.logout();
    window.location.href = '../pages/login.html';
}

function animateValue(id, start, end, duration, prefix = "") {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = prefix + value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

