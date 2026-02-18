/**
 * Admin Panel - EyeCareHub
 * Real-time backend integration for CRUD operations
 */

const API_BASE = 'http://localhost:8080/api';

// Check if user is admin
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.roles || !user.roles.includes('ROLE_ADMIN')) {
        alert('Access denied! Admin privileges required.');
        window.location.href = '../pages/login.html';
        return false;
    }
    return true;
}

// Display admin username
function displayAdminInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminName = document.querySelector('.admin-user-name');
    if (adminName) {
        adminName.textContent = user.username || 'Admin';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    displayAdminInfo();
    
    // Load page-specific data
    if (document.getElementById('total-users')) loadDashboardStats();
    if (document.getElementById('users-table-body')) loadUsersTable();
    if (document.getElementById('products-table-body')) loadProductsTable();
    if (document.getElementById('orders-table-body')) loadOrdersTable();
});

// ========== DASHBOARD STATS ==========
async function loadDashboardStats() {
    try {
        const [users, orders] = await Promise.all([
            apiCall('/admin/users', 'GET'),
            apiCall('/orders/all', 'GET')
        ]);
        
        document.getElementById('total-users').textContent = users?.length || 0;
        document.getElementById('total-orders').textContent = orders?.length || 0;
        
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;
        document.getElementById('total-revenue').textContent = '₹' + totalRevenue.toFixed(2);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// ========== USERS MANAGEMENT ==========
let currentUsers = [];

async function loadUsersTable() {
    try {
        currentUsers = await apiCall('/admin/users', 'GET');
        const tbody = document.getElementById('users-table-body');
        
        if (!currentUsers || currentUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentUsers.map(user => `
            <tr>
                <td>#${user.id?.substring(0, 8) || 'N/A'}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 30px; height: 30px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
                            ${(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        ${user.username || 'N/A'}
                    </div>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td>
                    <span style="padding: 5px 10px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 0.8rem;">
                        ${user.roles?.join(', ').replace('ROLE_', '') || 'USER'}
                    </span>
                </td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="alert('Delete feature temporarily disabled. Please use MongoDB Compass to manage users directly.')" title="Delete (Disabled)">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align:center;color:#ff4444;">Failed to load users</td></tr>';
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        await apiCall(`/admin/users/${userId}`, 'DELETE');
        showToast('User deleted successfully!');
        loadUsersTable();
    } catch (error) {
        showToast('Failed to delete user: ' + error.message, true);
    }
}

// ========== PRODUCTS MANAGEMENT ==========
let currentProducts = [];

async function loadProductsTable() {
    try {
        // For now, use data.js products (you can add backend API later)
        currentProducts = typeof products !== 'undefined' ? products : [];
        const tbody = document.getElementById('products-table-body');
        
        if (!currentProducts || currentProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentProducts.map(product => `
            <tr>
                <td><img src="${product.image}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
                <td>${product.title || product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock || Math.floor(Math.random() * 50) + 1}</td>
                <td>
                    <button class="action-btn" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function editProduct(productId) {
    showToast('Edit product feature - Coming soon!');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    showToast('Delete product feature - Coming soon!');
}

// ========== ORDERS MANAGEMENT ==========
let currentOrders = [];

async function loadOrdersTable() {
    try {
        currentOrders = await apiCall('/orders/all', 'GET');
        const tbody = document.getElementById('orders-table-body');
        
        if (!currentOrders || currentOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentOrders.map(order => {
            const statusColors = {
                'PENDING': 'background: rgba(255,255,0,0.2); color: #facc15;',
                'PROCESSING': 'background: rgba(0,0,255,0.2); color: #60a5fa;',
                'SHIPPED': 'background: rgba(0,200,255,0.2); color: #00d4ff;',
                'DELIVERED': 'background: rgba(0,255,0,0.2); color: #4ade80;',
                'CANCELLED': 'background: rgba(255,0,0,0.2); color: #ff4444;'
            };
            
            return `
                <tr>
                    <td>#${order.id?.substring(0, 8) || 'N/A'}</td>
                    <td>${order.userId?.substring(0, 8) || 'N/A'}</td>
                    <td>${order.items?.length || 0} items</td>
                    <td>₹${order.totalPrice?.toFixed(2) || '0.00'}</td>
                    <td>
                        <span style="padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; ${statusColors[order.status] || statusColors['PENDING']}">
                            ${order.status || 'Pending'}
                        </span>
                    </td>
                    <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" 
                                style="background: #222; color: #fff; border: 1px solid #333; padding: 5px; border-radius: 5px;">
                            <option value="">Change Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-table-body').innerHTML = 
            '<tr><td colspan="7" style="text-align:center;color:#ff4444;">Failed to load orders</td></tr>';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    try {
        await apiCall(`/orders/${orderId}/status?status=${newStatus}`, 'PUT');
        showToast('Order status updated successfully!');
        loadOrdersTable();
    } catch (error) {
        showToast('Failed to update order status: ' + error.message, true);
    }
}

// ========== UTILITY FUNCTIONS ==========
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        background: ${isError ? '#ff4444' : 'var(--accent-color)'};
        color: ${isError ? '#fff' : '#000'};
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .action-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        color: #fff;
        transition: all 0.3s;
    }
    .action-btn:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
    }
    .btn-delete:hover {
        background: rgba(255,0,0,0.2);
        border-color: #ff4444;
    }
`;
document.head.appendChild(style);
