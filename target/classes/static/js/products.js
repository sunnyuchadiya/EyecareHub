/*
   Products.js - Category & Filtering Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    initShop();
});

let currentProducts = [...products]; // Copy of global data

function initShop() {
    // 1. First fetch products from real DB to keep Store and Admin panel synchronized!
    try {
        productAPI.getAll().then(dbProducts => {
            if (dbProducts && dbProducts.length > 0) {
                // Map the DB backend models strictly securely over to Frontend array models
                window.products = dbProducts.map(p => ({
                    id: p.id || p._id,
                    name: p.name,
                    category: p.category,
                    brand: p.brand,
                    price: p.price,
                    rating: p.rating || 4.5,
                    image: p.imageUrl || p.image,
                    desc: p.description
                }));
                currentProducts = [...window.products];
                
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                if (categoryParam) {
                    const checkboxes = document.querySelectorAll(`input[name="category"][value="${capitalize(categoryParam)}"]`);
                    checkboxes.forEach(cb => { cb.checked = true; });
                    filterProducts();
                } else {
                    renderProducts(currentProducts);
                }
            }
        });
    } catch(e) { console.error("Could not sync with Backend. Using local Fallback data.", e); }

    // Check for URL query params (e.g. ?category=electronics)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
        // Pre-check the checkbox
        const checkboxes = document.querySelectorAll(`input[name="category"][value="${capitalize(categoryParam)}"]`);
        checkboxes.forEach(cb => {
            cb.checked = true;
            // Also simpler logic to just filter immediately
        });
        filterProducts();
    } else {
        renderProducts(currentProducts);
    }

    // Event Listeners
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.addEventListener('change', filterProducts);
    });

    document.getElementById('priceRange').addEventListener('input', (e) => {
        document.getElementById('priceValue').innerText = `₹${e.target.value}`;
        filterProducts();
    });

    document.getElementById('sort').addEventListener('change', sortProducts);
}

function filterProducts() {
    // 1. Get Categories
    const checkedCats = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);

    // 2. Get Price
    const maxPrice = parseInt(document.getElementById('priceRange').value);

    // 3. Filter
    currentProducts = products.filter(p => {
        const catMatch = checkedCats.length === 0 || checkedCats.includes(p.category);
        const priceMatch = p.price <= maxPrice;
        return catMatch && priceMatch;
    });

    // 4. Sort (maintain current sort order)
    sortProducts(false); // don't trigger event, just reuse logic
}

function sortProducts(isEvent = true) {
    const sortValue = document.getElementById('sort').value;

    if (sortValue === 'low-high') {
        currentProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'high-low') {
        currentProducts.sort((a, b) => b.price - a.price);
    }
    // 'default' leaves it as filtered order (or id based if stable)

    renderProducts(currentProducts);
}

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    const countLabel = document.getElementById('result-count');

    if (!grid) return;

    grid.innerHTML = '';
    countLabel.innerText = `Showing ${items.length} products`;

    if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found.</p>';
        return;
    }

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
            <div class="product-img-wrapper" onclick="window.location.href='product.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <div class="product-actions">
                    <button class="action-btn" onclick="addToCart(event, '${product.id}')" title="Add to Cart"><i class="fa-solid fa-plus"></i></button>
                    <button class="action-btn" onclick="window.location.href='product.html?id=${product.id}'" title="View Details"><i class="fa-regular fa-eye"></i></button>
                </div>
            </div>
            <div class="product-info" style="padding: 15px;">
                <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${product.name}</h3>
                <div class="flex justify-between" style="margin-bottom: 10px;">
                    <span class="product-price">₹${product.price}</span>
                    <span style="font-size: 0.8rem; color: #666;">${product.rating} <i class="fa-solid fa-star" style="color: gold;"></i></span>
                </div>
                <button class="btn-buy-now" onclick="buyNow('${product.id}')">Buy Now</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function findProductById(id) {
    const allProducts = (Array.isArray(currentProducts) && currentProducts.length > 0)
        ? currentProducts
        : (Array.isArray(window.products) ? window.products : products);

    return allProducts.find(p => String(p.id) === String(id));
}

// Add to Cart global function
window.addToCart = async function (e, id) {
    if (e) e.stopPropagation(); // Prevent card click

    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        const product = findProductById(id);
        if (product) {
            localStorage.setItem('pendingCartAction', JSON.stringify({
                productId: id,
                name: product.name,
                price: product.price,
                image: product.image,
                redirect: window.location.pathname + window.location.search
            }));
        }
        window.location.href = `login.html`;
        return;
    }

    const product = findProductById(id);
    if (!product) return;

    try {
        await cartAPI.addToCart(id, 1, product.name, product.price, product.image);

        // Update UI
        updateCartCount(); // key function in main.js

        // Show Toast
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = `Added ${product.name} to cart`;
            toast.classList.remove('hidden');
            toast.style.opacity = 1;
            setTimeout(() => {
                toast.style.opacity = 0;
                setTimeout(() => toast.classList.add('hidden'), 300);
            }, 3000);
        }
    } catch(err) {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart');
    }
}

// Buy Now function
window.buyNow = async function (id) {
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        const product = findProductById(id);
        if (product) {
            localStorage.setItem('pendingCartAction', JSON.stringify({
                productId: id,
                name: product.name,
                price: product.price,
                image: product.image,
                redirect: 'checkout.html'
            }));
        }
        window.location.href = `login.html`;
        return;
    }

    const product = findProductById(id);
    if (!product) return;

    try {
        document.body.style.cursor = 'wait';
        await cartAPI.addToCart(id, 1, product.name, product.price, product.image);
        window.location.href = 'checkout.html';
    } catch(err) {
        document.body.style.cursor = 'default';
        console.error('Buy Now error:', err);
        alert('Failed to proceed to checkout');
    }
}
