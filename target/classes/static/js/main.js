/* 
   Main JS - Global Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    updateCartCount();
    initTheme();
    initSearch();
});

// Theme Logic
function initTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    }

    // Insert toggle button if not exists (usually in nav)
    // For now assuming we might add a toggle button or just expose function
    // Let's add a floating toggle for demo
    const toggle = document.createElement('button');
    toggle.className = 'icon-btn theme-toggle-btn';
    toggle.id = 'theme-toggle-btn';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle theme');
    toggle.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    toggle.style.position = 'fixed';
    toggle.style.bottom = '20px';
    toggle.style.right = '20px';
    toggle.style.background = 'var(--bg-card)';
    toggle.style.color = 'var(--text-main)';
    toggle.style.padding = '15px';
    toggle.style.borderRadius = '50%';
    toggle.style.zIndex = '9999';
    toggle.style.border = '1px solid var(--border-color)';
    toggle.style.cursor = 'pointer';

    toggle.onclick = () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        toggle.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    };

    document.body.appendChild(toggle);
}

// Search Logic
function initSearch() {
    // Create Modal
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="close-search"><i class="fa-solid fa-xmark"></i></div>
        <div class="search-box">
            <input type="text" class="search-input" placeholder="Search products..." id="searchInput">
        </div>
    `;
    document.body.appendChild(modal);

    const triggers = document.querySelectorAll('.search-trigger'); // Add this class to nav search icon
    const close = modal.querySelector('.close-search');
    const input = modal.querySelector('searchInput');

    // Just inject user icon since api.js is loaded statically
    injectUserIcon();

    triggers.forEach(t => t.addEventListener('click', () => {
        modal.classList.add('active');
        setTimeout(() => document.getElementById('searchInput').focus(), 100);
    }));

    close.addEventListener('click', () => modal.classList.remove('active'));

    // Search functionality
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            // Redirect to category page with search (simulated)
            // Ideally we'd filter by name, but for now just redirect
            if (window.location.href.includes('pages/')) {
                window.location.href = `categories.html?search=${query}`;
            } else {
                window.location.href = `pages/categories.html?search=${query}`;
            }
        }
    });

    // Handle Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('active');
    });
}


// Navbar Scroll Effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function injectUserIcon() {
    const navIcons = document.querySelector('.nav-icons');
    if (!navIcons) return;
    
    // Remove any existing hardcoded User icon to prevent duplicates
    const existingIcons = navIcons.querySelectorAll('.icon-btn');
    existingIcons.forEach(icon => {
        if (icon.innerHTML.includes('fa-user')) {
            icon.remove();
        }
    });

    // Check if dynamic user icon already exists
    if (document.getElementById('user-nav-action')) return;

    const prefix = window.location.href.includes('/pages/') || window.location.href.includes('/admin/') ? '' : 'pages/';
    
    let linkHref = prefix + 'login.html';
    let iconClass = 'fa-regular fa-user';
    let label = 'Login';
    
    if (isAuthenticated()) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.roles && user.roles.includes('ROLE_ADMIN')) {
                    linkHref = window.location.href.includes('/pages/') ? '../admin/index.html' : window.location.href.includes('/admin/') ? 'index.html' : 'admin/index.html';
                } else {
                    linkHref = prefix + 'dashboard.html';
                }
            } catch(e) {}
        } else {
            label = 'Dashboard';
            linkHref = prefix + 'dashboard.html';
        }
        iconClass = 'fa-solid fa-user';
    }

    const userLink = document.createElement('a');
    userLink.href = linkHref;
    userLink.className = 'icon-btn';
    userLink.id = 'user-nav-action';
    userLink.title = label;
    userLink.innerHTML = `<i class="${iconClass}"></i>`;
    
    // Insert before search or cart
    navIcons.insertBefore(userLink, navIcons.firstChild);
}

// API Cart Logic for badge
async function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    if (typeof isAuthenticated !== 'undefined' && isAuthenticated()) {
        try {
            const cartResponse = await cartAPI.getCart();
            const count = cartResponse.items ? cartResponse.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
            cartCount.innerText = count;
        } catch (error) {
            console.log('Error fetching cart:', error);
            cartCount.innerText = '0';
        }
    } else {
        // Fallback for non-logged in users ? They don't have a backend cart.
        cartCount.innerText = '0';
    }
}

// Sample Product Data handled in data.js
