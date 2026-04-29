/*
   Cart & Checkout Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on Cart Page
    if (document.getElementById('cart-container')) {
        renderCart();
    }

    // Check if we are on Checkout Page
    if (document.getElementById('checkout-form')) {
        renderCheckoutSummary();
        initCheckoutForm();
    }
});

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatInr(amount) {
    return `₹${Math.round(toNumber(amount)).toLocaleString('en-IN')}`;
}

const checkoutState = {
    subtotal: 0,
    tax: 0,
    totalBeforeDiscount: 0,
    discountAmount: 0,
    couponCode: ''
};

function updateCheckoutTotals({ subtotal, tax, discountAmount = 0, couponCode = '' }) {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const gstAmountEl = document.getElementById('checkout-gst-amount');
    const totalEl = document.getElementById('checkout-total');
    const discountRowEl = document.getElementById('checkout-discount-row');
    const discountAmountEl = document.getElementById('checkout-discount-amount');
    const couponCodeLabelEl = document.getElementById('checkout-coupon-code-label');

    const amountBeforeDiscount = subtotal + tax;
    const safeDiscount = Math.min(amountBeforeDiscount, Math.max(0, toNumber(discountAmount)));
    const grandTotal = Math.max(0, amountBeforeDiscount - safeDiscount);

    checkoutState.subtotal = subtotal;
    checkoutState.tax = tax;
    checkoutState.totalBeforeDiscount = amountBeforeDiscount;
    checkoutState.discountAmount = safeDiscount;
    checkoutState.couponCode = couponCode;

    if (subtotalEl) subtotalEl.innerText = formatInr(subtotal);
    if (gstAmountEl) gstAmountEl.innerText = formatInr(tax);
    if (totalEl) totalEl.innerText = formatInr(grandTotal);

    if (discountRowEl && discountAmountEl) {
        if (safeDiscount > 0) {
            discountRowEl.style.display = 'flex';
            discountAmountEl.innerText = `- ${formatInr(safeDiscount)}`;
            if (couponCodeLabelEl) {
                couponCodeLabelEl.innerText = couponCode ? ` (${couponCode})` : '';
            }
        } else {
            discountRowEl.style.display = 'none';
            discountAmountEl.innerText = '- ₹0';
            if (couponCodeLabelEl) {
                couponCodeLabelEl.innerText = '';
            }
        }
    }
}

async function applyCouponOnCheckout() {
    const couponInputEl = document.getElementById('checkout-coupon-code');
    const couponMessageEl = document.getElementById('checkout-coupon-message');
    const applyBtn = document.getElementById('checkout-apply-coupon-btn');
    if (!couponInputEl) return;

    const enteredCode = (couponInputEl.value || '').trim();
    if (!enteredCode) {
        if (couponMessageEl) {
            couponMessageEl.innerText = 'Please enter coupon code.';
            couponMessageEl.className = 'coupon-message error';
        }
        return;
    }

    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.innerText = 'Applying...';
    }

    try {
        const result = await couponAPI.validate(enteredCode);

        updateCheckoutTotals({
            subtotal: checkoutState.subtotal,
            tax: checkoutState.tax,
            discountAmount: result.discountAmount,
            couponCode: result.code || enteredCode.toUpperCase()
        });

        if (couponMessageEl) {
            const savings = formatInr(result.discountAmount || 0);
            couponMessageEl.innerText = `Coupon applied! You saved ${savings}.`;
            couponMessageEl.className = 'coupon-message success';
        }
    } catch (error) {
        updateCheckoutTotals({
            subtotal: checkoutState.subtotal,
            tax: checkoutState.tax,
            discountAmount: 0,
            couponCode: ''
        });

        if (couponMessageEl) {
            couponMessageEl.innerText = error.message || 'Invalid coupon code.';
            couponMessageEl.className = 'coupon-message error';
        }
    } finally {
        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerText = 'Apply';
        }
    }
}

async function renderCart() {
    const container = document.getElementById('cart-container');
    
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        container.innerHTML = `
            <div class="empty-cart fade-in" style="text-align: center; padding: 50px;">
                <i class="fa-solid fa-user-lock" style="font-size: 3rem; color: #666; margin-bottom: 20px;"></i>
                <h3 style="font-size: 2rem; margin-bottom: 10px;">Sign in to view cart</h3>
                <p style="color: #888; margin-bottom: 20px;">Login to add items and checkout.</p>
                <a href="login.html?redirect=cart.html" class="btn btn-primary">Login</a>
            </div>
        `;
        return;
    }

    try {
        const cartResponse = await cartAPI.getCart();
        const cart = cartResponse.items || [];

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart fade-in" style="text-align: center; padding: 50px;">
                    <i class="fa-solid fa-cart-arrow-down" style="font-size: 3rem; color: #666; margin-bottom: 20px;"></i>
                    <h3 style="font-size: 2rem; margin-bottom: 10px;">Your cart is empty</h3>
                    <p style="color: #888; margin-bottom: 20px;">Looks like you haven't added anything yet.</p>
                    <a href="categories.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        let subtotal = 0;

        const itemsHtml = cart.map((item) => {
            const unitPrice = toNumber(item.price);
            const quantity = Math.max(1, toNumber(item.quantity));
            subtotal += unitPrice * quantity;
            const itemId = item.productId || item.id;
            const itemName = item.productName || item.name;
            const itemImg = item.imageUrl || item.image;
            return `
                <div class="cart-item fade-in">
                    <img src="${itemImg}" alt="${itemName}" class="cart-img">
                    <div class="cart-details">
                        <h3 class="cart-title">${itemName}</h3>
                        <div class="cart-price">${formatInr(unitPrice)}</div>
                    </div>
                    <div class="cart-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="updateCartQty('${itemId}', -1)">-</button>
                            <span class="qty-input">${quantity}</span>
                            <button class="qty-btn" onclick="updateCartQty('${itemId}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${itemId}')">Remove</button>
                    </div>
                    <div style="font-weight: 600; min-width: 80px; text-align: right;">
                        ${formatInr(unitPrice * quantity)}
                    </div>
                </div>
            `;
        }).join('');

        const tax = Math.round(subtotal * 0.18); // 18% GST
        const total = subtotal + tax;

        container.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items">
                    ${itemsHtml}
                </div>
                <div class="summary-box">
                    <h3 style="margin-bottom: 20px;">Order Summary</h3>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>${formatInr(subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (18%)</span>
                        <span>${formatInr(tax)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>${formatInr(total)}</span>
                    </div>
                    <a href="checkout.html" class="btn btn-primary" style="width: 100%;">Proceed to Checkout</a>
                    <a href="categories.html" style="display: block; text-align: center; margin-top: 15px; font-size: 0.9rem; text-decoration: underline;">Continue Shopping</a>
                </div>
            </div>
        `;
    } catch(err) {
        console.error('Error rendering cart:', err);
    }
}

async function updateCartQty(id, change) {
    try {
        const cartResponse = await cartAPI.getCart();
        const cart = cartResponse.items || [];
        // Support both string IDs from backend and integer IDs from local mocks if mixed
        const item = cart.find(p => p.productId == id || p.id == id);
        
        if (item) {
            let newQty = toNumber(item.quantity) + change;
            if (newQty < 1) newQty = 1;
            await cartAPI.updateQuantity(id, newQty);
            await renderCart();
            updateCartCount();
        }
    } catch(err) {
        console.error('Error updating completely:', err);
    }
}

async function removeFromCart(id) {
    try {
        await cartAPI.removeFromCart(id);
        await renderCart();
        updateCartCount();
    } catch(err) {
        console.error('Error removing from cart:', err);
    }
}

/* CHECKOUT LOGIC */

async function renderCheckoutSummary() {
    const summaryList = document.getElementById('checkout-items');
    const gstRateEl = document.getElementById('checkout-gst-rate');
    const couponInputEl = document.getElementById('checkout-coupon-code');
    const couponMessageEl = document.getElementById('checkout-coupon-message');
    if (!summaryList) return;

    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    try {
        const cartResponse = await cartAPI.getCart();
        const cart = cartResponse.items || [];
        let subtotal = 0;
        const gstRate = 18;

        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        summaryList.innerHTML = cart.map(item => {
            const unitPrice = toNumber(item.price);
            const quantity = Math.max(1, toNumber(item.quantity));
            subtotal += unitPrice * quantity;
            const itemName = item.productName || item.name;
            return `
                <div class="flex justify-between" style="margin-bottom: 10px;">
                    <span>${quantity} x ${itemName}</span>
                    <span>${formatInr(unitPrice * quantity)}</span>
                </div>
            `;
        }).join('');

        const tax = Math.round(subtotal * (gstRate / 100));
        if (gstRateEl) gstRateEl.innerText = String(gstRate);

        updateCheckoutTotals({
            subtotal,
            tax,
            discountAmount: 0,
            couponCode: ''
        });

        if (couponInputEl) {
            couponInputEl.value = '';
        }
        if (couponMessageEl) {
            couponMessageEl.innerText = '';
            couponMessageEl.className = 'coupon-message';
        }
    } catch(err) {
        console.error('Error loading checkout cart:', err);
    }
}

function initCheckoutForm() {
    // Payment Method Toggle
    const methods = document.querySelectorAll('.payment-card');
    methods.forEach(m => {
        m.addEventListener('click', () => {
            methods.forEach(c => c.classList.remove('active'));
            m.classList.add('active');
        });
    });

    // Form Submit
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);

    const applyBtn = document.getElementById('checkout-apply-coupon-btn');
    const couponInputEl = document.getElementById('checkout-coupon-code');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyCouponOnCheckout);
    }

    if (couponInputEl) {
        couponInputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyCouponOnCheckout();
            }
        });
    }
}

/**
 * Handle Checkout - Place order via API
 */
async function handleCheckout(e) {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated()) {
        alert('Please login to place an order');
        window.location.href = './login.html';
        return;
    }

    // Validation
    const inputs = e.target.querySelectorAll('input[required]');
    let valid = true;
    inputs.forEach(i => {
        if (!i.value) {
            i.style.borderColor = 'red';
            valid = false;
        } else {
            i.style.borderColor = 'var(--border-color)';
        }
    });

    if (valid) {
        const activePaymentCard = document.querySelector('.payment-card.active');
        const paymentType = activePaymentCard ? ((activePaymentCard.innerText.includes('PayPal') ? 'PAYPAL' : activePaymentCard.innerText.includes('COD') ? 'COD' : 'CARD')) : 'CARD';
        const totalText = (document.getElementById('checkout-total').innerText || '').replace(/[^\d.]/g, '');
        const totalAmount = parseFloat(totalText) || 0;
        const customerDetails = getCustomerDetailsFromForm(e.target);

        let paymentReference = `${paymentType}_${Date.now()}`;

        if (paymentType === 'CARD' || paymentType === 'PAYPAL') {
            const paymentResult = await simulateGatewayProcessing(paymentType, totalAmount, customerDetails.email);
            if (!paymentResult.success) {
                alert(paymentResult.message || 'Payment failed. Please try again.');
                return;
            }
            paymentReference = paymentResult.reference;
        }

        await finalizePayment(paymentType, customerDetails, paymentReference);
    }
}

function getCustomerDetailsFromForm(formEl) {
    const formInputs = formEl.querySelectorAll('input');
    return {
        firstName: (formInputs[0]?.value || '').trim(),
        lastName: (formInputs[1]?.value || '').trim(),
        email: (formInputs[2]?.value || '').trim(),
        address: (formInputs[3]?.value || '').trim(),
        city: (formInputs[4]?.value || '').trim(),
        zipCode: (formInputs[5]?.value || '').trim()
    };
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateGatewayProcessing(paymentType, amount, email) {
    let methodLabel, paymentRouteLabel, brandHtml, steps, cardStyleClass;
    
    if (paymentType === 'PAYPAL') {
        methodLabel = 'PayPal';
        paymentRouteLabel = 'Secure Checkout';
        cardStyleClass = 'paypal-style';
        brandHtml = `
            <div class="payment-brand-logo" style="background: #fff; width: 40px; height: 40px; border-radius: 5px; color: #003087; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><i class="fa-brands fa-paypal"></i></div>
            <div>
                <div class="payment-brand" style="color: #003087; font-size: 1.1rem; margin-bottom: 2px;">PayPal Processing</div>
                <div class="payment-sub-brand" style="color: #666; font-size: 0.85rem;">Redirecting securely...</div>
            </div>`;
    } else if (paymentType === 'CARD') {
        methodLabel = 'Card';
        paymentRouteLabel = '3D Secure Verified';
        cardStyleClass = 'card-style';
        brandHtml = `
            <div class="payment-brand-logo" style="background: #f1f2f5; width: 45px; height: 35px; border-radius: 5px; color: #1a1f36; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><i class="fa-brands fa-cc-visa"></i><i class="fa-brands fa-cc-mastercard" style="margin-left:4px;"></i></div>
            <div>
                <div class="payment-brand" style="color: #1a1f36; font-size: 1.1rem; margin-bottom: 2px;">Bank Authentication</div>
                <div class="payment-sub-brand" style="color: #666; font-size: 0.85rem;">Secured by Checkout</div>
            </div>`;
    } else {
        methodLabel = 'Razorpay';
        paymentRouteLabel = 'Secure Checkout';
        cardStyleClass = 'razorpay-style';
        brandHtml = `
            <div class="payment-brand-logo"><i class="fa-solid fa-bolt"></i></div>
            <div>
                <div class="payment-brand">Razorpay Secure</div>
                <div class="payment-sub-brand">${paymentRouteLabel}</div>
            </div>`;
    }

    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay active';
    
    let extraContainerStyle = '';
    let textStyle = '';
    let rowStyle = '';
    let strongStyle = '';

    if (paymentType === 'PAYPAL') {
        extraContainerStyle = 'background: #ffffff; color: #333; box-shadow: 0 20px 60px rgba(0,48,135,0.25); border-top: 5px solid #003087; border-radius: 12px; border: none; text-align: left;';
        textStyle = 'color: #555;';
        rowStyle = 'border-bottom: 1px solid #eaeaea; color: #555;';
        strongStyle = 'color: #111; font-weight: 700;';
    } else if (paymentType === 'CARD') {
        extraContainerStyle = 'background: #ffffff; color: #1a1f36; box-shadow: 0 20px 60px rgba(26,31,54,0.3); border-top: 5px solid #1a1f36; border-radius: 12px; border: none; text-align: left;';
        textStyle = 'color: #555;';
        rowStyle = 'border-bottom: 1px solid #eaeaea; color: #555;';
        strongStyle = 'color: #111; font-weight: 700;';
    }

    overlay.innerHTML = `
        <style>
            .paypal-style .payment-step-list li.active { color: #000; font-weight: 600; }
            .paypal-style .payment-step-list li.active::before { background: #0079C1; box-shadow: 0 0 10px rgba(0, 121, 193, 0.65); }
            .paypal-style .payment-step-list li::before { background: #d0d0d0; }
            .card-style .payment-step-list li.active { color: #000; font-weight: 600; }
            .card-style .payment-step-list li.active::before { background: #1a1f36; box-shadow: 0 0 10px rgba(26, 31, 54, 0.65); }
            .card-style .payment-step-list li::before { background: #d0d0d0; }
        </style>
        <div class="payment-processing-card ${cardStyleClass}" style="${extraContainerStyle}">
            <div class="payment-head" style="margin-bottom: 20px; align-items: flex-start;">
                <div class="payment-brand-wrap" style="align-items: center;">
                    ${brandHtml}
                </div>
                <div class="payment-badge" style="margin-top: 5px; ${paymentType === 'PAYPAL' ? 'background:#e5f1ff; color:#0079C1; border-color:rgba(0,121,193,0.3);' : (paymentType === 'CARD' ? 'background:#f0f2f5; color:#1a1f36; border-color:rgba(26,31,54,0.2);' : '')}"><i class="fa-solid fa-shield-halved"></i> Secured</div>
            </div>

            <div class="payment-summary-row" style="${rowStyle}">
                <span style="${textStyle}">Amount</span>
                <strong style="${strongStyle}">${formatInr(amount)}</strong>
            </div>
            <div class="payment-summary-row" style="${rowStyle}">
                <span style="${textStyle}">Method</span>
                <strong style="${strongStyle}">${methodLabel}</strong>
            </div>
            <div class="payment-summary-row email" style="${rowStyle}">
                <span style="${textStyle}">Paying as</span>
                <strong style="${strongStyle}">${email || 'customer@eyecarehub.com'}</strong>
            </div>

            <div class="processing-progress" style="${paymentType === 'PAYPAL' || paymentType === 'CARD' ? 'background: #e0e0e0;' : ''}"><span id="fake-progress-bar" style="${paymentType === 'PAYPAL' ? 'background: #0079C1;' : (paymentType === 'CARD' ? 'background: #1a1f36;' : '')}"></span></div>
            <div class="loader-text" id="fake-progress-text" style="${paymentType === 'PAYPAL' || paymentType === 'CARD' ? 'color: #333;' : ''} font-weight: 500; margin-top: 15px; text-align: left; padding-left: 5px;">Initializing secure channel...</div>
            
            <ul class="payment-step-list" id="payment-step-list" style="${paymentType === 'PAYPAL' || paymentType === 'CARD' ? 'color: #888;' : ''}">
                <li data-step="1"></li>
                <li data-step="2"></li>
                <li data-step="3"></li>
                <li data-step="4"></li>
            </ul>
            
            <div class="pulse-dots" aria-hidden="true" style="margin-top: 20px;">
                <span style="${paymentType === 'PAYPAL' ? 'background: rgba(0, 121, 193, 0.7);' : (paymentType === 'CARD' ? 'background: rgba(26, 31, 54, 0.7);' : '')}"></span>
                <span style="${paymentType === 'PAYPAL' ? 'background: rgba(0, 121, 193, 0.7);' : (paymentType === 'CARD' ? 'background: rgba(26, 31, 54, 0.7);' : '')}"></span>
                <span style="${paymentType === 'PAYPAL' ? 'background: rgba(0, 121, 193, 0.7);' : (paymentType === 'CARD' ? 'background: rgba(26, 31, 54, 0.7);' : '')}"></span>
            </div>
            
            <div class="checkmark-circle" id="fake-checkmark" style="${paymentType === 'PAYPAL' ? 'background: #e5f1ff; color: #0079C1; border: 2px solid #0079C1; box-shadow: 0 0 15px rgba(0,121,193,0.3);' : (paymentType === 'CARD' ? 'background: #f0f2f5; color: #1a1f36; border: 2px solid #1a1f36; box-shadow: 0 0 15px rgba(26,31,54,0.3);' : '')}">
                <i class="fa-solid fa-check"></i>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const progressBar = overlay.querySelector('#fake-progress-bar');
    const progressText = overlay.querySelector('#fake-progress-text');
    const checkmark = overlay.querySelector('#fake-checkmark');
    const stepList = overlay.querySelector('#payment-step-list');
    const liElements = stepList.querySelectorAll('li');

    if (paymentType === 'PAYPAL') {
        steps = [
            { width: '25%', text: 'Connecting to PayPal Servers...', stepNo: 1 },
            { width: '55%', text: 'Verifying PayPal Account...', stepNo: 2 },
            { width: '80%', text: 'Processing Payment via PayPal...', stepNo: 3 },
            { width: '100%', text: 'Redirecting back to Merchant...', stepNo: 4 }
        ];
    } else if (paymentType === 'CARD') {
        steps = [
            { width: '25%', text: 'Contacting Issuing Bank...', stepNo: 1 },
            { width: '55%', text: 'Verifying 3D Secure Credentials...', stepNo: 2 },
            { width: '80%', text: 'Authorizing Transaction...', stepNo: 3 },
            { width: '100%', text: 'Payment Authorized Successfully.', stepNo: 4 }
        ];
    } else {
        steps = [
            { width: '25%', text: 'Verifying payment identity...', stepNo: 1 },
            { width: '55%', text: 'Authenticating secure credentials...', stepNo: 2 },
            { width: '80%', text: 'Authorizing transaction with issuer bank...', stepNo: 3 },
            { width: '100%', text: 'Payment authorized successfully.', stepNo: 4 }
        ];
    }

    liElements[0].innerText = steps[0].text;
    liElements[1].innerText = steps[1].text;
    liElements[2].innerText = steps[2].text;
    liElements[3].innerText = steps[3].text;

    for (const step of steps) {
        progressBar.style.width = step.width;
        progressText.innerText = step.text;
        if (stepList) {
            const activeStep = stepList.querySelector(`li[data-step="${step.stepNo}"]`);
            if (activeStep) activeStep.classList.add('active');
        }
        await wait(820);
    }

    // Hide pulse dots right before showing the checkmark
    const pulseDots = overlay.querySelector('.pulse-dots');
    if (pulseDots) pulseDots.style.display = 'none';

    checkmark.style.display = 'flex';
    if (paymentType === 'PAYPAL') {
        document.querySelector('.paypal-style #fake-progress-text').innerText = 'Payment Authorized Successfully.';
    }
    
    await wait(800);
    document.body.removeChild(overlay);

    return {
        success: true,
        reference: `${paymentType}_${Date.now()}`
    };
}

function buildInvoiceData(orderResponse, customerDetails, paymentType, paymentReference, items) {
    const subtotal = items.reduce((sum, item) => sum + (toNumber(item.price) * Math.max(1, toNumber(item.quantity))), 0);
    const tax = Math.round(subtotal * 0.18);
    const discount = Math.max(0, toNumber(orderResponse.discountAmount || checkoutState.discountAmount || 0));
    const total = Math.max(0, (toNumber(orderResponse.totalPrice) || (subtotal + tax - discount)));
    return {
        invoiceNumber: `ECH-${Date.now()}`,
        orderId: orderResponse.id || orderResponse._id || 'N/A',
        issueDate: new Date().toLocaleString('en-IN'),
        paymentType,
        paymentReference,
        couponCode: orderResponse.couponCode || checkoutState.couponCode || '',
        customer: customerDetails,
        items,
        subtotal,
        tax,
        discount,
        total
    };
}function generateInvoiceHtml(invoice) {
    const money = (amount) => `\u20B9${Math.round(toNumber(amount)).toLocaleString('en-IN')}`;
    const itemRows = invoice.items.map(item => {
        const itemName = item.productName || item.name || 'Item';
        const qty = Math.max(1, toNumber(item.quantity));
        const unit = toNumber(item.price);
        const lineTotal = unit * qty;
        return `
            <tr>
                <td class="td-desc">${itemName}</td>
                <td class="td-right">${qty}</td>
                <td class="td-right">${money(unit)}</td>
                <td class="td-right td-total">${money(lineTotal)}</td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f4f5f7; color: #1a1a2e; padding: 40px 20px; min-height: 100vh; }
        .page { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.10); }
        .inv-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 40px 48px; display: flex; justify-content: space-between; align-items: flex-start; position: relative; overflow: hidden; }
        .inv-header::after { content: ''; position: absolute; right: -60px; top: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(219,242,39,0.12), transparent 70%); }
        .brand-name { font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #fff; }
        .brand-tagline { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
        .inv-badge { text-align: right; z-index: 1; }
        .inv-badge .label { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.4); }
        .inv-badge .number { font-size: 20px; font-weight: 700; color: #dbf227; margin-top: 4px; letter-spacing: 1px; }
        .inv-badge .date { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 6px; }
        .accent-stripe { height: 4px; background: linear-gradient(90deg, #dbf227, #a8c62e, #1a1a2e); }
        .inv-body { padding: 40px 48px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
        .meta-box { background: #f9fafb; border: 1px solid #ebebeb; border-radius: 10px; padding: 20px 22px; }
        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; font-weight: 600; margin-bottom: 12px; }
        .meta-value { font-size: 13.5px; color: #222; line-height: 1.7; }
        .meta-value strong { color: #111; font-weight: 600; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; border-radius: 10px; overflow: hidden; border: 1px solid #ebebeb; }
        .items-table thead tr { background: #1a1a2e; }
        .items-table th { padding: 14px 18px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.7); text-align: left; }
        .items-table th:not(:first-child) { text-align: right; }
        .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
        .items-table tbody tr:last-child { border-bottom: none; }
        .td-desc { padding: 16px 18px; font-size: 14px; color: #1a1a2e; font-weight: 500; }
        .td-right { padding: 16px 18px; font-size: 14px; color: #444; text-align: right; }
        .td-total { font-weight: 600; color: #1a1a2e; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .totals-box { width: 320px; background: #f9fafb; border: 1px solid #ebebeb; border-radius: 10px; overflow: hidden; }
        .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 20px; border-bottom: 1px solid #f0f0f0; font-size: 13.5px; color: #555; }
        .totals-row:last-child { border-bottom: none; }
        .totals-row.grand { background: #1a1a2e; color: #fff; font-size: 16px; font-weight: 700; }
        .totals-row.grand span:last-child { color: #dbf227; }
        .totals-row.discount span { color: #22c55e; }
        .inv-footer { background: #f9fafb; border-top: 1px solid #ebebeb; padding: 22px 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .inv-footer .footer-note { font-size: 12px; color: #999; }
        .inv-footer .footer-auth { font-size: 12px; color: #555; font-weight: 600; }
        @media print { body { background: #fff; padding: 0; } .page { box-shadow: none; border-radius: 0; } }
    </style>
</head>
<body>
    <div class="page">
        <div class="inv-header">
            <div>
                <div class="brand-name">EyeCareHub</div>
                <div class="brand-tagline">Premium Eyewear Collection</div>
            </div>
            <div class="inv-badge">
                <div class="label">Invoice</div>
                <div class="number">${invoice.invoiceNumber}</div>
                <div class="date">${invoice.issueDate}</div>
            </div>
        </div>
        <div class="accent-stripe"></div>
        <div class="inv-body">
            <div class="meta-grid">
                <div class="meta-box">
                    <div class="meta-label">Billed To</div>
                    <div class="meta-value">
                        <strong>${invoice.customer.firstName} ${invoice.customer.lastName}</strong><br>
                        ${invoice.customer.email}<br>
                        ${invoice.customer.address || ''}<br>
                        ${invoice.customer.city || ''} &mdash; ${invoice.customer.zipCode || ''}
                    </div>
                </div>
                <div class="meta-box">
                    <div class="meta-label">Order Details</div>
                    <div class="meta-value">
                        <strong>Order ID:</strong> ${invoice.orderId}<br>
                        <strong>Payment:</strong> ${invoice.paymentType}<br>
                        <strong>Reference:</strong> ${invoice.paymentReference}
                    </div>
                </div>
            </div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align:right">Qty</th>
                        <th style="text-align:right">Unit Price</th>
                        <th style="text-align:right">Amount</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
            <div class="totals-section">
                <div class="totals-box">
                    <div class="totals-row"><span>Subtotal</span><span>${money(invoice.subtotal)}</span></div>
                    <div class="totals-row"><span>GST (18%)</span><span>${money(invoice.tax)}</span></div>
                    ${invoice.discount > 0 ? `<div class="totals-row discount"><span>Discount${invoice.couponCode ? ' (' + invoice.couponCode + ')' : ''}</span><span>- ${money(invoice.discount)}</span></div>` : ''}
                    <div class="totals-row grand"><span>Total</span><span>${money(invoice.total)}</span></div>
                </div>
            </div>
        </div>
        <div class="inv-footer">
            <div class="footer-note">Thank you for shopping with EyeCareHub &mdash; support@eyecarehub.com</div>
            <div class="footer-auth">Authorized by EyeCareHub Billing</div>
        </div>
    </div>
</body>
</html>`;
}

window.downloadInvoice = function () {
    if (!window.__latestInvoiceData) return;
    const invoice = window.__latestInvoiceData;

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF generator not loaded. Opening invoice preview instead.');
        window.previewInvoice();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const formatPdfMoney = (amount) => `Rs. ${Math.round(toNumber(amount)).toLocaleString('en-IN')}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);
    const colProductX = margin + 10;
    const colQtyX = margin + 280;
    const colUnitX = margin + 380;
    const colTotalX = margin + contentWidth - 10;

    let y = 60;

    // Brand and Header
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('EYECAREHUB', margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('PREMIUM EYEWEAR COLLECTION', margin, y + 16);

    // Invoice Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`#${invoice.invoiceNumber}`, pageWidth - margin, y + 16, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invoice.issueDate, pageWidth - margin, y + 30, { align: 'right' });

    // Divider
    y += 50;
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(2);
    doc.line(margin, y, pageWidth - margin, y);

    // Billing details
    y += 35;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('BILLED TO', margin, y);
    doc.text('ORDER DETAILS', margin + 240, y);

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const customerName = `${invoice.customer.firstName} ${invoice.customer.lastName}`.trim();
    doc.text(customerName || 'Customer', margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Order ID: ${invoice.orderId}`, margin + 240, y);
    doc.text(invoice.customer.address || '-', margin, y + 14);
    doc.text(`Payment: ${invoice.paymentType}`, margin + 240, y + 14);
    doc.text(`${invoice.customer.city || '-'} ${invoice.customer.zipCode || '-'}`, margin, y + 28);
    doc.text(`Ref: ${invoice.paymentReference}`, margin + 240, y + 28);
    doc.text(invoice.customer.email || '-', margin, y + 42);

    // Table Header
    y += 85;
    doc.setFillColor(248, 248, 248);
    doc.rect(margin, y, contentWidth, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('DESCRIPTION', colProductX, y + 19);
    doc.text('QTY', colQtyX, y + 19, { align: 'right' });
    doc.text('UNIT PRICE', colUnitX, y + 19, { align: 'right' });
    doc.text('TOTAL', colTotalX, y + 19, { align: 'right' });

    // Table Items
    y += 45;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    invoice.items.forEach(item => {
        const itemName = item.productName || item.name || 'Item';
        const qty = Math.max(1, toNumber(item.quantity));
        const unit = toNumber(item.price);
        const lineTotal = unit * qty;

        if (y > pageHeight - 150) {
            doc.addPage();
            y = 60;
            doc.setFillColor(248, 248, 248);
            doc.rect(margin, y, contentWidth, 30, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text('DESCRIPTION', colProductX, y + 19);
            doc.text('QTY', colQtyX, y + 19, { align: 'right' });
            doc.text('UNIT PRICE', colUnitX, y + 19, { align: 'right' });
            doc.text('TOTAL', colTotalX, y + 19, { align: 'right' });
            y += 45;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(40, 40, 40);
        }

        const safeName = itemName.length > 45 ? `${itemName.slice(0, 45)}...` : itemName;
        doc.text(safeName, colProductX, y);
        doc.text(String(qty), colQtyX, y, { align: 'right' });
        doc.text(formatPdfMoney(unit), colUnitX, y, { align: 'right' });
        doc.text(formatPdfMoney(lineTotal), colTotalX, y, { align: 'right' });
        
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(1);
        doc.line(margin, y + 12, pageWidth - margin, y + 12);
        y += 30;
    });

    // Totals
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const totalsLabelX = pageWidth - margin - 120;
    const totalsAmountX = pageWidth - margin - 10;
    
    doc.text('Subtotal', totalsLabelX, y);
    doc.text(formatPdfMoney(invoice.subtotal), totalsAmountX, y, { align: 'right' });
    
    y += 20;
    doc.text('Tax (18%)', totalsLabelX, y);
    doc.text(formatPdfMoney(invoice.tax), totalsAmountX, y, { align: 'right' });
    
    if (invoice.discount > 0) {
        y += 20;
        doc.text(`Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ''}`, totalsLabelX, y);
        doc.text(`- ${formatPdfMoney(invoice.discount)}`, totalsAmountX, y, { align: 'right' });
    }
    
    y += 25;
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(1.5);
    doc.line(totalsLabelX - 20, y - 14, pageWidth - margin, y - 14);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('Total Amount', totalsLabelX, y);
    doc.text(formatPdfMoney(invoice.total), totalsAmountX, y, { align: 'right' });

    // Footer
    y = pageHeight - 50;
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(1);
    doc.line(margin, y - 15, pageWidth - margin, y - 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with EyeCareHub.', margin, y);
    doc.text('For inquiries, contact support@eyecarehub.com', pageWidth - margin, y, { align: 'right' });

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

window.previewInvoice = function () {
    if (!window.__latestInvoiceData) return;
    const html = generateInvoiceHtml(window.__latestInvoiceData);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
};

async function finalizePayment(finalType, customerDetails, paymentReference) {
    const placingOverlay = document.createElement('div');
    placingOverlay.className = 'loader-overlay active';
    placingOverlay.innerHTML = `
        <div class="spinner-ring"></div>
        <div class="loader-text">Placing your order...</div>
    `;
    document.body.appendChild(placingOverlay);

    try {
        const cartResponse = await cartAPI.getCart();
        const cartItems = cartResponse.items || [];
        const orderResponse = await orderAPI.placeOrder(finalType, checkoutState.couponCode || '');
        window.__latestInvoiceData = buildInvoiceData(orderResponse, customerDetails, finalType, paymentReference, cartItems);

        localStorage.removeItem('cart');
        updateCartCount();
        checkoutState.discountAmount = 0;
        checkoutState.couponCode = '';

        document.querySelector('.checkout-container').innerHTML = `
            <div class="order-success-card" style="animation: fadeIn 0.6s ease;">
                <div class="checkmark-circle" style="display:flex; margin: 0 auto 20px;"><i class="fa-solid fa-check"></i></div>
                <h1>Order Confirmed</h1>
                <p class="order-success-sub">Your order <strong>#${window.__latestInvoiceData.orderId}</strong> has been placed successfully.</p>
                <div class="order-success-meta">
                    <div><span>Invoice No:</span><strong>${window.__latestInvoiceData.invoiceNumber}</strong></div>
                    <div><span>Payment:</span><strong>${finalType}</strong></div>
                    <div><span>Total:</span><strong>${formatInr(window.__latestInvoiceData.total)}</strong></div>
                </div>
                <div class="invoice-actions">
                    <button class="btn btn-primary" onclick="downloadInvoice()"><i class="fa-solid fa-download"></i> Download Invoice</button>
                    <button class="btn btn-secondary" onclick="previewInvoice()"><i class="fa-regular fa-eye"></i> View Invoice</button>
                </div>
                <a href="../index.html" class="btn btn-primary" style="margin-top:16px;">Back to Home</a>
            </div>
        `;
    } catch (error) {
        alert('Payment/Order failed: ' + error.message);
        console.error('Order error:', error);
    } finally {
        if (placingOverlay.parentNode) {
            document.body.removeChild(placingOverlay);
        }
    }
}
