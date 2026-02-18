/**
 * API Client - Handles all API calls with JWT authentication
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Get JWT token from localStorage or cookie
 */
function getAuthToken() {
    // First try localStorage
    let token = localStorage.getItem('token');
    if (token) return token;
    
    // Then try cookie
    token = getCookieToken('jwtToken');
    if (token) {
        // Save to localStorage for future use
        localStorage.setItem('token', token);
        return token;
    }
    
    return null;
}

/**
 * Get cookie by name
 */
function getCookieToken(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

/**
 * Make an API request with JWT token
 */
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add JWT token if authentication is required
    if (requiresAuth) {
        const token = getAuthToken();
        if (!token) {
            console.error('No authentication token found');
            redirectToLogin();
            return null;
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        // If 401 Unauthorized, redirect to login
        if (response.status === 401) {
            console.error('Token expired or invalid');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            redirectToLogin();
            return null;
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API Error: ${response.status}`);
        }

        // Return empty response if no content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/pages/login.html';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return getAuthToken() !== null;
}
