/**
 * API Utility - Handles all API calls with JWT authentication
 * Stores JWT token in localStorage and includes it in all requests
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Store JWT token in localStorage
 */
function storeToken(token) {
    localStorage.setItem('jwtToken', token);
}

/**
 * Get JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem('jwtToken');
}

/**
 * Remove JWT token from localStorage
 */
function removeToken() {
    localStorage.removeItem('jwtToken');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Get Authorization header value
 */
function getAuthHeader() {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
}

/**
 * Helper function for all API calls
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body (optional)
 * @returns {Promise} - Response data
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // If unauthorized (401), clear token and redirect to login
        if (response.status === 401) {
            removeToken();
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (_) {
                try {
                    const errorText = await response.text();
                    if (errorText && errorText.trim()) {
                        errorMessage = errorText.trim();
                    }
                } catch (_) {
                    // Keep fallback message
                }
            }

            if (response.status === 403) {
                errorMessage = 'Access denied. Admin role required.';
            } else if (response.status === 404) {
                // 404 Not Found - specific handling
                if (endpoint.includes('/coupons/validate')) {
                    throw new Error('Invalid coupon code.');
                }
                errorMessage = 'Resource not found.';
            }

            throw new Error(errorMessage);
        }

        // For DELETE requests with no content response
        if (response.status === 204 || method === 'DELETE' && response.status === 200) {
            return { success: true, message: 'Operation successful' };
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Authentication API Calls
 */
const authAPI = {
    login: async (email, password) => {
        return await apiCall('/auth/signin', 'POST', { email, password });
    },

    signup: async (username, email, password) => {
        return await apiCall('/auth/signup', 'POST', { username, email, password, roles: ['user'] });
    },

    googleLogin: async (googleToken) => {
        return await apiCall('/auth/google/login', 'POST', { token: googleToken });
    },

    googleSignup: async (googleToken) => {
        return await apiCall('/auth/google/signup', 'POST', { token: googleToken });
    },

    verifyOTP: async (email, otp) => {
        return await apiCall('/auth/verify-otp', 'POST', { email, otp });
    },

    resendOTP: async (email) => {
        return await apiCall('/auth/resend-otp', 'POST', { email });
    },

    forgotPassword: async (email) => {
        return await apiCall('/auth/forgot-password', 'POST', { email });
    },

    resetPassword: async (email, otp, newPassword) => {
        return await apiCall('/auth/reset-password', 'POST', { email, otp, newPassword });
    },

    getCurrentUser: async () => {
        return await apiCall('/auth/me', 'GET');
    },

    logout: async () => {
        removeToken();
        localStorage.removeItem('user');
    },
};

/**
 * Product API Calls
 */
const productAPI = {
    getAll: async () => {
        return await apiCall('/products', 'GET');
    },

    getById: async (id) => {
        return await apiCall(`/products/${id}`, 'GET');
    },

    getByCategory: async (category) => {
        return await apiCall(`/products/category/${category}`, 'GET');
    },

    create: async (product) => {
        return await apiCall('/products', 'POST', product);
    },

    update: async (id, product) => {
        return await apiCall(`/products/${id}`, 'PUT', product);
    },

    delete: async (id) => {
        return await apiCall(`/products/${id}`, 'DELETE');
    },

    search: async (name) => {
        return await apiCall(`/products/search?name=${encodeURIComponent(name)}`, 'GET');
    },

    filterByPrice: async (min, max) => {
        return await apiCall(`/products/filter?min=${min}&max=${max}`, 'GET');
    },
};

/**
 * Order API Calls
 */
const orderAPI = {
    placeOrder: async (paymentType, couponCode = '') => {
        const couponQuery = couponCode ? `&couponCode=${encodeURIComponent(couponCode)}` : '';
        return await apiCall(`/orders?paymentType=${paymentType}${couponQuery}`, 'POST');
    },

    getUserOrders: async () => {
        return await apiCall('/orders', 'GET');
    },

    getAllOrders: async () => {
        return await apiCall('/orders/all', 'GET');
    },

    getOrderById: async (id) => {
        return await apiCall(`/orders/${id}`, 'GET');
    },

    updateOrderStatus: async (id, status) => {
        return await apiCall(`/orders/${id}/status`, 'PUT', { status });
    },
};

const couponAPI = {
    validate: async (code) => {
        try {
            return await apiCall(`/coupons/validate?code=${encodeURIComponent(code)}`, 'GET');
        } catch (error) {
            // Provide user-friendly error messages
            if (error.message.includes('404')) {
                throw new Error('❌ Invalid coupon code. Please check and try again.');
            }
            if (error.message.includes('expired') || error.message.includes('Expired')) {
                throw new Error('❌ This coupon code has expired.');
            }
            if (error.message.includes('limit') || error.message.includes('Limit')) {
                throw new Error('❌ Coupon usage limit has been reached.');
            }
            // For any other error, provide a generic message but keep the original error as fallback
            throw new Error(error.message || '❌ Unable to apply coupon. Please try again.');
        }
    },
};

/**
 * Cart API Calls
 */
const cartAPI = {
    getCart: async () => {
        return await apiCall('/cart', 'GET');
    },

    addToCart: async (productId, quantity = 1, name = '', price = 0, imageUrl = '') => {
        return await apiCall('/cart/add', 'POST', { productId, name, price, quantity, imageUrl });
    },

    removeFromCart: async (productId) => {
        return await apiCall(`/cart/remove/${productId}`, 'DELETE');
    },

    updateQuantity: async (productId, quantity) => {
        return await apiCall(`/cart/update/${productId}?quantity=${quantity}`, 'PUT');
    },
};

/**
 * Admin API Calls
 */
const adminAPI = {
    getAllUsers: async () => {
        return await apiCall('/admin/users', 'GET');
    },

    deleteUser: async (userId) => {
        return await apiCall(`/admin/users/${userId}`, 'DELETE');
    },

    getAllOrders: async () => {
        return await apiCall('/admin/orders', 'GET');
    },

    updateOrderStatus: async (id, status) => {
        return await apiCall(`/admin/orders/${id}/status`, 'PUT', { status });
    },
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        authAPI,
        productAPI,
        orderAPI,
        cartAPI,
        couponAPI,
        adminAPI,
        storeToken,
        getToken,
        removeToken,
        isAuthenticated,
        getAuthHeader,
    };
}
