/*
   Product Detail Logic
*/

const WISHLIST_KEY = 'wishlistItems';
const REVIEW_KEY = 'productReviews_v1';
let availableProducts = [];
let activeProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

function normalizeProduct(p) {
    return {
        id: p.id || p._id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: Number(p.price || 0),
        rating: Number(p.rating || 0),
        image: p.imageUrl || p.image,
        desc: p.description || p.desc || ''
    };
}

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');

    const localProducts = Array.isArray(window.products)
        ? window.products.map(normalizeProduct)
        : (Array.isArray(products) ? products.map(normalizeProduct) : []);

    availableProducts = localProducts;

    let selectedProduct = findProductById(requestedId) || availableProducts[0];

    try {
        const dbProducts = await productAPI.getAll();
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
            const dbNormalized = dbProducts.map(normalizeProduct);
            const dbMatch = dbNormalized.find(p => String(p.id) === String(requestedId));

            // Keep DB as source, but preserve local IDs as fallback for routes like product.html?id=1
            const merged = [...dbNormalized];
            localProducts.forEach(localItem => {
                const exists = merged.some(p => String(p.id) === String(localItem.id));
                if (!exists) {
                    merged.push(localItem);
                }
            });

            availableProducts = merged;
            window.products = merged;

            if (dbMatch) {
                selectedProduct = dbMatch;
            } else {
                selectedProduct = findProductById(requestedId) || selectedProduct;
            }
        }
    } catch (_) {
        // Fall back silently to local data
    }

    const product = selectedProduct || findProductById(requestedId) || availableProducts[0];

    if (!product) {
        document.getElementById('product-container').innerHTML = '<h2>Product not found</h2>';
        return;
    }

    activeProduct = product;
    renderProductView(product);
    renderRelated(product);
    renderReviewsSection(product.id);
    await renderReviewFormEligibility(product.id);
}

function findProductById(id) {
    return availableProducts.find(p => String(p.id) === String(id));
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch (_) {
        return [];
    }
}

function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

function isInWishlist(productId) {
    return getWishlist().some(i => String(i.id) === String(productId));
}

window.toggleWishlistDetail = function (productId) {
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
    }

    const product = findProductById(productId);
    if (!product) return;

    const list = getWishlist();
    const exists = list.some(i => String(i.id) === String(productId));
    let updated;

    if (exists) {
        updated = list.filter(i => String(i.id) !== String(productId));
    } else {
        updated = [
            {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                brand: product.brand,
                category: product.category
            },
            ...list
        ];
    }

    saveWishlist(updated);
    updateWishlistHeartIcon(productId);

    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = exists ? 'Removed from wishlist' : 'Added to wishlist';
        toast.classList.remove('hidden');
        toast.style.opacity = 1;
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }
};

function updateWishlistHeartIcon(productId) {
    const btn = document.getElementById('wishlist-btn');
    if (!btn) return;
    const active = isInWishlist(productId);
    btn.classList.toggle('wishlist-active', active);
    btn.innerHTML = active ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
}

function getAllReviews() {
    try {
        return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}');
    } catch (_) {
        return {};
    }
}

function saveAllReviews(data) {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(data));
}

function getReviewsByProduct(productId) {
    const all = getAllReviews();
    return Array.isArray(all[String(productId)]) ? all[String(productId)] : [];
}

function renderReviewsSection(productId) {
    const listEl = document.getElementById('reviews-list');
    const countEl = document.getElementById('reviews-count');
    if (!listEl) return;

    const reviews = getReviewsByProduct(productId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (countEl) countEl.innerText = reviews.length;

    if (reviews.length === 0) {
        listEl.innerHTML = '<p style="color:#9a9a9a;">No reviews yet. Be the first one to review this product.</p>';
        return;
    }

    listEl.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-head">
                <strong>${r.username || 'User'}</strong>
                <span class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
            </div>
            <p class="review-comment">${r.comment}</p>
            <div class="review-date">${new Date(r.createdAt).toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

async function canUserReviewProduct(productId) {
    if (typeof isAuthenticated === 'undefined' || !isAuthenticated()) {
        return { allowed: false, reason: 'Login required to review this product.' };
    }

    try {
        const orders = await orderAPI.getUserOrders();
        const delivered = (orders || []).filter(o => String(o.status || '').toUpperCase() === 'DELIVERED');

        const hasDeliveredPurchase = delivered.some(order =>
            (order.items || []).some(item => String(item.productId || item.id) === String(productId))
        );

        if (!hasDeliveredPurchase) {
            return { allowed: false, reason: 'You can review only delivered purchases of this product.' };
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const existing = getReviewsByProduct(productId).find(r => String(r.userId) === String(user.id));
        return { allowed: true, existing };
    } catch (_) {
        return { allowed: false, reason: 'Could not verify delivered orders right now.' };
    }
}

async function renderReviewFormEligibility(productId) {
    const wrap = document.getElementById('review-form-wrap');
    if (!wrap) return;

    const eligibility = await canUserReviewProduct(productId);
    if (!eligibility.allowed) {
        wrap.innerHTML = `<div class="review-note">${eligibility.reason}</div>`;
        return;
    }

    const existing = eligibility.existing;
    wrap.innerHTML = `
        <form id="review-form" class="review-form">
            <h4>${existing ? 'Update Your Review' : 'Write a Review'}</h4>
            <div class="review-field-row">
                <label>Rating</label>
                <select id="review-stars" required>
                    <option value="5" ${existing?.stars === 5 ? 'selected' : ''}>5 - Excellent</option>
                    <option value="4" ${existing?.stars === 4 ? 'selected' : ''}>4 - Very Good</option>
                    <option value="3" ${existing?.stars === 3 ? 'selected' : ''}>3 - Good</option>
                    <option value="2" ${existing?.stars === 2 ? 'selected' : ''}>2 - Fair</option>
                    <option value="1" ${existing?.stars === 1 ? 'selected' : ''}>1 - Poor</option>
                </select>
            </div>
            <div class="review-field-row">
                <label>Comment</label>
                <textarea id="review-comment" rows="4" placeholder="Share your experience" required>${existing?.comment || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${existing ? 'Update Review' : 'Submit Review'}</button>
        </form>
    `;

    const form = document.getElementById('review-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitProductReview(productId);
    });
}

async function submitProductReview(productId) {
    const stars = parseInt(document.getElementById('review-stars')?.value || '0', 10);
    const comment = (document.getElementById('review-comment')?.value || '').trim();

    if (!stars || stars < 1 || stars > 5 || !comment) {
        alert('Please add rating and comment.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        alert('Please login first.');
        return;
    }

    const all = getAllReviews();
    const key = String(productId);
    const current = Array.isArray(all[key]) ? all[key] : [];
    const idx = current.findIndex(r => String(r.userId) === String(user.id));

    const payload = {
        userId: user.id,
        username: user.username || user.email || 'User',
        stars,
        comment,
        createdAt: new Date().toISOString()
    };

    if (idx >= 0) {
        current[idx] = payload;
    } else {
        current.push(payload);
    }

    all[key] = current;
    saveAllReviews(all);
    renderReviewsSection(productId);
    await renderReviewFormEligibility(productId);
    alert('Review submitted successfully.');
}

function renderProductView(product) {
    const container = document.getElementById('product-container');
    const reviewCount = getReviewsByProduct(product.id).length;

    container.innerHTML = `
        <div class="product-detail-grid">
            <div class="gallery-wrapper">
                <div class="main-image-box" id="mainImgBox" onmousemove="zoomImage(event)" onmouseleave="resetZoom()">
                    <img src="${product.image}" id="mainImg" class="main-image" alt="${product.name}">
                </div>
                <div class="thumbnails">
                    <button class="thumb-btn active" onclick="changeImage('${product.image}', this)">
                        <img src="${product.image}" alt="View 1">
                    </button>
                    <button class="thumb-btn" onclick="changeImage('${product.image}', this)">
                        <img src="${product.image}" alt="View 2" style="filter: hue-rotate(90deg);">
                    </button>
                    <button class="thumb-btn" onclick="changeImage('${product.image}', this)">
                        <img src="${product.image}" alt="View 3" style="filter: hue-rotate(180deg);">
                    </button>
                </div>
            </div>

            <div class="product-info-col">
                <span class="product-brand">${product.brand || 'EyeCareHub'}</span>
                <h1 class="product-title-large">${product.name}</h1>

                <div class="rating-box">
                    ${getStarRating(product.rating || 4.5)}
                    <span class="rating-text">(${Number(product.rating || 4.5).toFixed(1)} / 5.0) • ${reviewCount} Reviews</span>
                </div>

                <div class="price-box">
                    <span class="current-price">₹${product.price}</span>
                    <span style="text-decoration: line-through; color: var(--text-muted); font-size: 1.2rem;">₹${Math.round(product.price * 1.2)}</span>
                </div>

                <p style="margin-bottom: 30px; color: var(--text-muted);">${product.desc || 'Premium quality product for everyday comfort and style.'}</p>

                <div class="product-controls">
                    <div class="control-group">
                        <span style="min-width: 80px;">Quantity:</span>
                        <div class="quantity-wrapper">
                            <button class="qty-btn" onclick="updateQty(-1)"><i class="fa-solid fa-minus"></i></button>
                            <span class="qty-val" id="qtyVal">1</span>
                            <button class="qty-btn" onclick="updateQty(1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <div class="flex" style="gap: 20px; margin-top: 30px;">
                        <button class="btn btn-primary" onclick="addToCartDetail('${product.id}')" style="flex: 1; background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color);">
                            Add to Cart
                        </button>
                        <button class="btn btn-primary" onclick="buyNowDetail('${product.id}')" style="flex: 1;">
                            Buy Now
                        </button>
                        <button id="wishlist-btn" class="icon-btn" onclick="toggleWishlistDetail('${product.id}')" style="border: 1px solid var(--border-color); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div class="product-tabs">
                    <div class="tab-headers">
                        <button class="tab-link active" onclick="openTab('desc', this)">Description</button>
                        <button class="tab-link" onclick="openTab('reviews', this)">Reviews (<span id="reviews-count">${reviewCount}</span>)</button>
                    </div>
                    <div id="desc-tab" class="tab-pane active">
                        <p>Detailed description of ${product.name}. Features include high durability, premium finish, and ergonomic design.</p>
                        <ul style="list-style: disc; margin-left: 20px; margin-top: 10px; color: #aaa;">
                            <li>Premium build quality</li>
                            <li>Comfort-first design</li>
                            <li>Carefully selected materials</li>
                        </ul>
                    </div>
                    <div id="reviews-tab" class="tab-pane">
                        <div id="review-form-wrap"></div>
                        <div id="reviews-list"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateWishlistHeartIcon(product.id);

    gsap.from('.product-detail-grid > div', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    });
}

function renderRelated(currentProduct) {
    const related = availableProducts
        .filter(p => p.category === currentProduct.category && String(p.id) !== String(currentProduct.id))
        .slice(0, 4);
    const container = document.getElementById('related-products');

    if (related.length === 0) {
        container.innerHTML = '<p>No related products found.</p>';
        return;
    }

    container.innerHTML = '';
    related.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            window.location.href = `product.html?id=${product.id}`;
        };
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="flex justify-between">
                    <span class="product-price">₹${product.price}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function changeImage(src, btn) {
    const mainImg = document.getElementById('mainImg');
    mainImg.style.opacity = 0;
    setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = 1;
    }, 200);

    document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function zoomImage(e) {
    const box = document.getElementById('mainImgBox');
    const img = document.getElementById('mainImg');

    const x = e.clientX - box.getBoundingClientRect().left;
    const y = e.clientY - box.getBoundingClientRect().top;

    img.style.transformOrigin = `${x}px ${y}px`;
    img.style.transform = 'scale(2)';
}

function resetZoom() {
    const img = document.getElementById('mainImg');
    img.style.transform = 'scale(1)';
}

function updateQty(change) {
    const el = document.getElementById('qtyVal');
    let val = parseInt(el.innerText, 10);
    val += change;
    if (val < 1) val = 1;
    el.innerText = val;
}

function openTab(tabName, btn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));

    document.getElementById(`${tabName}-tab`).classList.add('active');
    btn.classList.add('active');
}

function getStarRating(rating) {
    let stars = '';
    const safeRating = Number(rating || 0);
    for (let i = 1; i <= 5; i++) {
        if (i <= safeRating) stars += '<i class="fa-solid fa-star"></i>';
        else if (i - 0.5 <= safeRating) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        else stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

async function addToCartDetail(id) {
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
        window.location.href = 'login.html';
        return;
    }

    const qty = parseInt(document.getElementById('qtyVal').innerText, 10);
    const product = findProductById(id);
    if (!product) return;

    try {
        await cartAPI.addToCart(id, qty, product.name, product.price, product.image);
        updateCartCount();

        const toast = document.getElementById('toast');
        toast.innerText = `Added ${qty} x ${product.name} to cart`;
        toast.classList.remove('hidden');
        toast.style.opacity = 1;
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    } catch (error) {
        console.error('Error adding to backend cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

async function buyNowDetail(id) {
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
        window.location.href = 'login.html';
        return;
    }

    const qty = parseInt(document.getElementById('qtyVal').innerText, 10);
    const product = findProductById(id);
    if (!product) return;

    try {
        document.body.style.cursor = 'wait';
        await cartAPI.addToCart(id, qty, product.name, product.price, product.image);
        window.location.href = 'checkout.html';
    } catch (error) {
        document.body.style.cursor = 'default';
        console.error('Error adding to backend cart for Buy Now:', error);
        alert('Failed to proceed to checkout. Please try again.');
    }
}
