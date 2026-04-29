/* 
   Auth Logic - Proper JWT Authentication
*/

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }

    // Google OAuth is handled inline in login.html and register.html

    // Check if already logged in
    if (isAuthenticated() && localStorage.getItem('user')) {
        // Redirect to home if on login/register pages
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            window.location.href = '../index.html';
        }
    } else if (isAuthenticated() && !localStorage.getItem('user')) {
        authAPI.logout();
    }
});

/**
 * Handle LOGIN - Call real backend API
 */
async function handleLogin(e) {
    e.preventDefault();
    let isValid = true;

    // Email validation
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email);
    }

    // Password validation
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
            // Call backend API
            const response = await authAPI.login(email.value, password.value);
            
            // Store JWT token and user info
            storeToken(response.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles
            }));

            // Show success message and redirect directly (no OTP needed)
            showSuccessMessage('Login successful! Redirecting...');

            setTimeout(() => {
                const isAdmin = response.roles && response.roles.includes('ROLE_ADMIN');
                if (isAdmin) {
                    window.location.href = '../admin/index.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1200);
        } catch (error) {
            btn.innerText = originalText;
            btn.disabled = false;
            showError(password, error.message || 'Login failed. Please try again.');
            console.error('Login error:', error);
        }
    }
}


/**
 * Handle REGISTER - Call real backend API
 */
async function handleRegister(e) {
    e.preventDefault();
    let isValid = true;

    // Name validation
    const name = document.getElementById('name');
    if (name.value.trim().length < 2) {
        showError(name, 'Name is required');
        isValid = false;
    } else {
        clearError(name);
    }

    // Email validation
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
    } else {
        clearError(email);
    }

    // Mobile validation
    const mobile = document.getElementById('mobile');
    if (mobile.value.trim().length < 10) {
        showError(mobile, 'Enter valid mobile number');
        isValid = false;
    } else {
        clearError(mobile);
    }

    // Password validation
    const password = document.getElementById('password');
    if (!validateStrongPassword(password.value)) {
        showError(password, 'Weak password (Min 8 chars, 1 Uppercase, 1 Number)');
        isValid = false;
    } else {
        clearError(password);
    }

    // Confirm password validation
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
            // Call backend API to register
            const response = await authAPI.signup(name.value, email.value, password.value);
            
            showSuccessMessage('Account created successfully! Redirecting to login...');
            
            // Redirect directly to login (no OTP needed)
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
        } catch (error) {
            btn.innerText = originalText;
            btn.disabled = false;
            showError(confirm, error.message || 'Registration failed. Please try again.');
            console.error('Registration error:', error);
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

function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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

/**
 * Logout function
 */
function logout() {
    authAPI.logout();
    window.location.href = './login.html';
}

async function handleForgotPassword(e) {
    e.preventDefault();

    const emailInput = document.getElementById('fpEmail');
    const email = (emailInput.value || '').trim();

    if (!validateEmail(email)) {
        alert('Please enter a valid email.');
        return;
    }

    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Sending OTP...';
    btn.disabled = true;

    try {
        await authAPI.forgotPassword(email);
        showSuccessMessage('OTP sent to your email.');

        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.style.display = 'block';
        }
    } catch (error) {
        alert(error.message || 'Failed to send OTP. Please try again.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function handleResetPassword(e) {
    e.preventDefault();

    const email = (document.getElementById('fpEmail').value || '').trim();
    const otp = (document.getElementById('fpOtp').value || '').trim();
    const newPassword = document.getElementById('fpNewPassword').value || '';
    const confirmPassword = document.getElementById('fpConfirmPassword').value || '';

    if (!validateEmail(email)) {
        alert('Please enter a valid email.');
        return;
    }

    if (otp.length !== 6) {
        alert('Please enter a valid 6-digit OTP.');
        return;
    }

    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Resetting...';
    btn.disabled = true;

    try {
        await authAPI.resetPassword(email, otp, newPassword);
        showSuccessMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1200);
    } catch (error) {
        alert(error.message || 'Failed to reset password.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
