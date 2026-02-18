/* 
   Auth Logic
*/

const API_URL = 'http://localhost:8080/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    let isValid = true;

    // Email
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email);
    }

    // Password
    const password = document.getElementById('password');
    if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError(password);
    }

    if (isValid) {
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Signing In...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            if (!response.ok) {
                const error = await response.json();
                showError(email, error.message || 'Login failed');
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }

            const data = await response.json();
            
            // Store user data and JWT token
            const user = {
                id: data.id,
                username: data.username,
                email: data.email,
                roles: data.roles
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', data.token);
            
            // Set token in cookie for persistence
            setCookie('jwtToken', data.token, 7); // 7 day expiry

            // Check if user is admin and redirect accordingly
            setTimeout(() => {
                if (data.roles && data.roles.includes('ROLE_ADMIN')) {
                    window.location.href = '../admin/index.html';
                } else {
                    window.location.href = '../pages/dashboard.html';
                }
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            showError(email, 'Network error. Please try again.');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    let isValid = true;

    // Username (using name field for username)
    const name = document.getElementById('name');
    if (name.value.trim().length < 2) {
        showError(name, 'Name is required');
        isValid = false;
    } else {
        clearError(name);
    }

    // Email
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email);
    }

    // Mobile - just validate, not sending to backend
    const mobile = document.getElementById('mobile');
    if (mobile.value.trim().length < 10) {
        showError(mobile, 'Enter valid mobile number');
        isValid = false;
    } else {
        clearError(mobile);
    }

    // Password
    const password = document.getElementById('password');
    if (!validateStrongPassword(password.value)) {
        showError(password, 'Weak password (Min 8 chars, 1 Uppercase, 1 Number)');
        isValid = false;
    } else {
        clearError(password);
    }

    // Confirm
    const confirm = document.getElementById('confirmPassword');
    if (confirm.value !== password.value) {
        showError(confirm, 'Passwords do not match');
        isValid = false;
    } else {
        clearError(confirm);
    }

    if (isValid) {
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Creating Account...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: name.value,
                    email: email.value,
                    password: password.value,
                    roles: ['user']
                })
            });

            if (!response.ok) {
                const error = await response.json();
                showError(email, error.message || 'Registration failed');
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }

            // Registration successful, redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            showError(email, 'Network error. Please try again.');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

// Helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateStrongPassword(password) {
    // Min 8, 1 Upper, 1 Number
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

function showError(input, message) {
    input.classList.add('error');
    const msgDiv = input.parentElement.querySelector('.error-msg');
    if (msgDiv) {
        msgDiv.innerText = message;
        msgDiv.style.display = 'block';
    }
}

function clearError(input) {
    input.classList.remove('error');
    const msgDiv = input.parentElement.querySelector('.error-msg');
    if (msgDiv) {
        msgDiv.style.display = 'none';
    }
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.parentElement.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
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

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'jwtToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    window.location.href = '../pages/login.html';
}
