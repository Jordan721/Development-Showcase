// Order state
let currentOrder = {
    sandwiches: [],
    drinks: [],
    chips: [],
    combos: [],
    total: 0
};

let currentOrderNumber = '';

// Current sandwich being built
let currentSandwich = {
    size: null,
    bread: null,
    toasted: false,
    toppings: [],
    surcharges: 0
};

// Topping counter for surcharges
let toppingCounter = {
    totalToppings: 0,
    extraToppings: 0,
    totalSauces: 0,
    extraSauces: 0,
    chargesMade: 0
};

// Pricing constants
const SURCHARGE_AMOUNT = 0.50;

const SANDWICH_PRICES = {
    '4': 5.50,
    '8': 7.00,
    '12': 8.50
};

const DRINK_PRICES = {
    'SMALL': 2.00,
    'MEDIUM': 2.50,
    'LARGE': 3.00
};

const CHIPS_PRICE = 1.50;

// Toppings data
const MEATS = ['🥩 Steak', '🍖 Ham', '🥪 Salami', '🥩 Roast Beef', '🍗 Chicken', '🥓 Bacon'];
const CHEESES = ['🧀 American', '🧀 Provolone', '🧀 Cheddar', '🧀 Swiss'];
const REGULAR_TOPPINGS = ['🥬 Lettuce', '🌶️ Peppers', '🧅 Onions', '🍅 Tomatoes', '🌶️ Jalapeños', '🥒 Cucumbers', '🥒 Pickles', '🥑 Guacamole', '🍄 Mushrooms'];
const SAUCES = ['🥪 Mayo', '💛 Honey Mustard', '🍅 Ketchup', '🥗 Ranch', '🧡 Thousand Islands', '🥗 Vinaigrette'];

// ==================
// Order Number
// ==================
function generateOrderNumber() {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `#${letter}-${num}`;
}

// ==================
// Clock
// ==================
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// ==================
// Navigation
// ==================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screen = document.getElementById(screenId);
    screen.classList.add('active');
    screen.style.animation = 'none';
    setTimeout(() => { screen.style.animation = ''; }, 10);

    // Focus first heading for accessibility
    const heading = screen.querySelector('h1, h2');
    if (heading) heading.focus();
}

function startNewOrder() {
    currentOrder = {
        sandwiches: [],
        drinks: [],
        chips: [],
        combos: [],
        total: 0
    };
    updateOrderSummary();
    showScreen('order-menu');
}

function backToOrderMenu() {
    showScreen('order-menu');
}

function cancelOrder() {
    if (confirm('Are you sure you want to cancel this order?')) {
        showScreen('main-menu');
    }
}

function exitApp() {
    alert('Thank you for using One Heck Of A Sandwich!\nHave a great day!');
}

function returnToMain() {
    showScreen('main-menu');
}

function showAboutProject() {
    showScreen('about-project');
}

function goBackToMainSite() {
    window.location.href = '../../index.html';
}

// ==================
// Quantity Selector
// ==================
function changeQty(inputId, delta) {
    const input = document.getElementById(inputId);
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(10, val + delta));
    input.value = val;
}

// ==================
// Sandwich Building
// ==================
function showBuildSandwich() {
    currentSandwich = { size: null, bread: null, toasted: false, toppings: [], surcharges: 0 };
    toppingCounter = { totalToppings: 0, extraToppings: 0, totalSauces: 0, extraSauces: 0, chargesMade: 0 };

    document.querySelectorAll('#build-sandwich .btn-option-kiosk').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });

    const toastedBtn = document.getElementById('toasted-btn');
    if (toastedBtn) {
        toastedBtn.classList.remove('active');
        toastedBtn.setAttribute('aria-checked', 'false');
        document.getElementById('toasted-text').textContent = 'Tap to Toast';
    }

    showScreen('build-sandwich');
}

function toggleToasted() {
    const btn = document.getElementById('toasted-btn');
    const text = document.getElementById('toasted-text');
    currentSandwich.toasted = !currentSandwich.toasted;

    if (currentSandwich.toasted) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        text.textContent = 'Toasted! 🔥';
    } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
        text.textContent = 'Tap to Toast';
    }
}

function selectSize(size) {
    currentSandwich.size = size;
    document.querySelectorAll('#build-sandwich .button-group-kiosk:first-of-type .btn-option-kiosk').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });
    const clickedButton = event.target.closest('.btn-option-kiosk');
    if (clickedButton) {
        clickedButton.classList.add('selected');
        clickedButton.setAttribute('aria-checked', 'true');
    }
}

function selectBread(bread) {
    currentSandwich.bread = bread;
    document.querySelectorAll('#build-sandwich .button-group-kiosk:nth-of-type(2) .btn-option-kiosk').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });
    const clickedButton = event.target.closest('.btn-option-kiosk');
    if (clickedButton) {
        clickedButton.classList.add('selected');
        clickedButton.setAttribute('aria-checked', 'true');
    }
}

function showToppingsSelection() {
    if (!currentSandwich.size || !currentSandwich.bread) {
        alert('Please select a size and bread type!');
        return;
    }

    populateToppings('meats-list', MEATS, true, 'meat');
    populateToppings('cheese-list', CHEESES, true, 'cheese');
    populateToppings('regular-list', REGULAR_TOPPINGS, false, 'regular');
    populateToppings('sauce-list', SAUCES, false, 'sauce');

    updateSurchargeMessage();
    showScreen('toppings-selection');
}

function populateToppings(containerId, items, isPremium, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'topping-item';
        div.innerHTML = `
            <input type="checkbox" id="${type}-${index}" onchange="toggleTopping('${type}', ${index}, ${isPremium})" aria-label="${item}">
            <label for="${type}-${index}">${item}</label>
            ${isPremium ? `<label class="topping-extra"><input type="checkbox" id="${type}-extra-${index}" onchange="toggleExtra('${type}', ${index})" aria-label="Extra ${item}"> Extra</label>` : ''}
        `;
        container.appendChild(div);
    });
}

function toggleTopping(type, index, isPremium) {
    const checkbox = document.getElementById(`${type}-${index}`);
    const item = getToppingItem(type, index);

    if (checkbox.checked) {
        currentSandwich.toppings.push({ name: item, type: type, isPremium: isPremium, isExtra: false, index: index });
        checkbox.parentElement.classList.add('selected');
        if (isPremium) toppingCounter.totalToppings++;
        checkForSurcharge();
    } else {
        currentSandwich.toppings = currentSandwich.toppings.filter(t => !(t.type === type && t.index === index));
        checkbox.parentElement.classList.remove('selected');
        if (isPremium) {
            const extraCheckbox = document.getElementById(`${type}-extra-${index}`);
            if (extraCheckbox && extraCheckbox.checked) toppingCounter.extraToppings--;
            toppingCounter.totalToppings--;
        }
        const extraCheckbox = document.getElementById(`${type}-extra-${index}`);
        if (extraCheckbox) extraCheckbox.checked = false;
        updateSurchargeMessage();
    }
}

function toggleExtra(type, index) {
    const extraCheckbox = document.getElementById(`${type}-extra-${index}`);
    const topping = currentSandwich.toppings.find(t => t.type === type && t.index === index);
    if (topping) {
        topping.isExtra = extraCheckbox.checked;
        if (extraCheckbox.checked) toppingCounter.extraToppings++;
        else toppingCounter.extraToppings--;
        checkForSurcharge();
    }
}

function getToppingItem(type, index) {
    switch (type) {
        case 'meat': return MEATS[index];
        case 'cheese': return CHEESES[index];
        case 'regular': return REGULAR_TOPPINGS[index];
        case 'sauce': return SAUCES[index];
    }
}

function checkForSurcharge() {
    const combinedTotal = toppingCounter.totalToppings + toppingCounter.totalSauces;
    const combinedExtras = toppingCounter.extraToppings + toppingCounter.extraSauces;
    let shouldCharge = false;

    if (combinedTotal > 0 && combinedTotal % 3 === 0) {
        const expectedCharges = Math.floor(combinedTotal / 3);
        if (expectedCharges > toppingCounter.chargesMade) shouldCharge = true;
    }

    if (combinedExtras > 0 && combinedExtras % 2 === 0) {
        const expectedExtraCharges = Math.floor(combinedExtras / 2);
        if (expectedExtraCharges > (toppingCounter.chargesMade - Math.floor(combinedTotal / 3))) shouldCharge = true;
    }

    if (shouldCharge) {
        currentSandwich.surcharges += SURCHARGE_AMOUNT;
        toppingCounter.chargesMade++;
    }
    updateSurchargeMessage();
}

function updateSurchargeMessage() {
    const message = document.getElementById('surcharge-message');
    if (currentSandwich.surcharges > 0) {
        message.innerHTML = `Additional charges: $${currentSandwich.surcharges.toFixed(2)}`;
    } else {
        message.innerHTML = 'No additional charges yet. (Charges apply for every 3 toppings or every 2 extras)';
    }
}

function backToBuildSandwich() {
    showScreen('build-sandwich');
}

function finishSandwich() {
    const sandwich = {
        size: currentSandwich.size,
        bread: currentSandwich.bread,
        toasted: currentSandwich.toasted,
        toppings: [...currentSandwich.toppings],
        surcharges: currentSandwich.surcharges,
        price: calculateSandwichPrice()
    };
    currentOrder.sandwiches.push(sandwich);
    updateOrderSummary();
    showScreen('order-menu');
}

function calculateSandwichPrice() {
    const basePrice = SANDWICH_PRICES[currentSandwich.size];
    const toppingsPrice = currentSandwich.toppings.reduce((sum, topping) => {
        if (topping.isPremium) {
            const premiumPrice = currentSandwich.size === '4' ? 1.00 : currentSandwich.size === '8' ? 2.00 : 3.00;
            const extraPrice = topping.isExtra ? (currentSandwich.size === '4' ? 0.50 : currentSandwich.size === '8' ? 1.00 : 1.50) : 0;
            return sum + premiumPrice + extraPrice;
        }
        return sum;
    }, 0);
    return basePrice + toppingsPrice + currentSandwich.surcharges;
}

// ==================
// Signature Sandwiches
// ==================
function showSignatureSandwiches() {
    showScreen('signature-sandwiches');
}

function addSignatureSandwich(type) {
    let sandwich;
    switch (type) {
        case 'BLT':
            sandwich = { name: '🥓 BLT O Heck', size: '8', bread: 'WHITE', toasted: true, toppings: [{ name: '🥓 Bacon', isPremium: true }, { name: '🥬 Lettuce', isPremium: false }, { name: '🍅 Tomatoes', isPremium: false }, { name: '🥪 Mayo', isPremium: false }], price: 10.50 };
            break;
        case 'PHILLY':
            sandwich = { name: '🧀 Heck O Alot Of Philly Cheese Steak', size: '12', bread: 'ITALIAN', toasted: true, toppings: [{ name: '🥩 Steak', isPremium: true, isExtra: true }, { name: '🌶️ Peppers', isPremium: false }, { name: '🧅 Onions', isPremium: false }, { name: '🧀 Provolone', isPremium: true }], price: 14.00 };
            break;
        case 'ITALIAN':
            sandwich = { name: '🍅 Heckin Italian', size: '8', bread: 'ITALIAN', toasted: false, toppings: [{ name: '🥪 Salami', isPremium: true }, { name: '🍖 Ham', isPremium: true }, { name: '🧀 Provolone', isPremium: true }, { name: '🥬 Lettuce', isPremium: false }, { name: '🍅 Tomatoes', isPremium: false }, { name: '🥗 Vinaigrette', isPremium: false }], price: 12.00 };
            break;
        case 'CHICKEN':
            sandwich = { name: '🍗 The Cluckin Chicken', size: '8', bread: 'WHEAT', toasted: true, toppings: [{ name: '🍗 Chicken', isPremium: true }, { name: '🥬 Lettuce', isPremium: false }, { name: '🍅 Tomatoes', isPremium: false }, { name: '🥗 Ranch', isPremium: false }], price: 10.00 };
            break;
    }
    currentOrder.sandwiches.push(sandwich);
    updateOrderSummary();
    showScreen('order-menu');
}

// ==================
// Combo Meals
// ==================
function showComboMeals() {
    showScreen('combo-meals');
}

function addCombo(type) {
    let combo;
    switch (type) {
        case 'CLASSIC':
            combo = { name: '🥪 Classic Combo', desc: 'BLT O Heck + Medium Drink + Chips', price: 12.00, savings: 1.50 };
            break;
        case 'PHILLY':
            combo = { name: '🧀 Philly Combo', desc: 'Philly Cheese Steak + Large Drink + Chips', price: 15.50, savings: 2.00 };
            break;
        case 'CHICKEN':
            combo = { name: '🍗 Chicken Combo', desc: 'The Cluckin Chicken + Medium Drink + Chips', price: 11.50, savings: 1.50 };
            break;
        case 'ITALIAN':
            combo = { name: '🍅 Italian Combo', desc: 'Heckin Italian + Medium Drink + Chips', price: 13.50, savings: 1.50 };
            break;
    }
    currentOrder.combos.push(combo);
    updateOrderSummary();
    showScreen('order-menu');
}

// ==================
// Drinks
// ==================
let selectedDrinkSize = null;

function showAddDrink() {
    selectedDrinkSize = null;
    document.querySelectorAll('#add-drink .btn-option-kiosk').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });
    document.getElementById('drink-flavor').value = '';
    document.getElementById('drink-qty').value = '1';
    showScreen('add-drink');
}

function selectDrinkSize(size) {
    selectedDrinkSize = size;
    document.querySelectorAll('#add-drink .btn-option-kiosk').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });
    const clickedButton = event.target.closest('.btn-option-kiosk');
    if (clickedButton) {
        clickedButton.classList.add('selected');
        clickedButton.setAttribute('aria-checked', 'true');
    }
}

function addDrink() {
    const flavor = document.getElementById('drink-flavor').value.trim();
    const qty = parseInt(document.getElementById('drink-qty').value) || 1;

    if (!selectedDrinkSize) { alert('Please select a drink size!'); return; }
    if (!flavor) { alert('Please enter a drink flavor!'); return; }

    for (let i = 0; i < qty; i++) {
        currentOrder.drinks.push({ size: selectedDrinkSize, flavor: flavor, price: DRINK_PRICES[selectedDrinkSize] });
    }
    updateOrderSummary();
    showScreen('order-menu');
}

// ==================
// Chips
// ==================
function showAddChips() {
    document.getElementById('chips-flavor').value = '';
    document.getElementById('chips-qty').value = '1';
    showScreen('add-chips');
}

function addChips() {
    const flavor = document.getElementById('chips-flavor').value.trim();
    const qty = parseInt(document.getElementById('chips-qty').value) || 1;

    if (!flavor) { alert('Please enter a chips flavor!'); return; }

    for (let i = 0; i < qty; i++) {
        currentOrder.chips.push({ flavor: flavor, price: CHIPS_PRICE });
    }
    updateOrderSummary();
    showScreen('order-menu');
}

// ==================
// Remove Items
// ==================
function removeItem(type, index) {
    currentOrder[type].splice(index, 1);
    updateOrderSummary();
}

// ==================
// Order Summary
// ==================
function updateOrderSummary() {
    const itemsContainer = document.getElementById('order-items');
    const totalContainer = document.getElementById('order-total');

    const hasItems = currentOrder.sandwiches.length > 0 || currentOrder.drinks.length > 0 || currentOrder.chips.length > 0 || currentOrder.combos.length > 0;

    if (!hasItems) {
        itemsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No items yet. Start adding to your order!</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let html = '';
    let total = 0;

    currentOrder.sandwiches.forEach((sandwich, index) => {
        const name = sandwich.name || `${sandwich.size}" ${sandwich.bread}${sandwich.toasted ? ' (Toasted)' : ''} Sandwich`;
        html += `<div class="order-item" role="listitem">
            <span>🥪 ${name} - $${sandwich.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeItem('sandwiches', ${index})" aria-label="Remove ${name}" title="Remove">✕</button>
        </div>`;
        total += sandwich.price;
    });

    currentOrder.combos.forEach((combo, index) => {
        html += `<div class="order-item" role="listitem">
            <span>🍱 ${combo.name} - $${combo.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeItem('combos', ${index})" aria-label="Remove ${combo.name}" title="Remove">✕</button>
        </div>`;
        total += combo.price;
    });

    currentOrder.drinks.forEach((drink, index) => {
        html += `<div class="order-item" role="listitem">
            <span>🍹 ${drink.size} ${drink.flavor} - $${drink.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeItem('drinks', ${index})" aria-label="Remove ${drink.flavor} drink" title="Remove">✕</button>
        </div>`;
        total += drink.price;
    });

    currentOrder.chips.forEach((chips, index) => {
        html += `<div class="order-item" role="listitem">
            <span>🥔 ${chips.flavor} Chips - $${chips.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeItem('chips', ${index})" aria-label="Remove ${chips.flavor} chips" title="Remove">✕</button>
        </div>`;
        total += chips.price;
    });

    itemsContainer.innerHTML = html;
    totalContainer.innerHTML = `Total: $${total.toFixed(2)}`;
    currentOrder.total = total;
}

// ==================
// Checkout & Receipt
// ==================
function showCheckout() {
    const hasItems = currentOrder.sandwiches.length > 0 || currentOrder.drinks.length > 0 || currentOrder.chips.length > 0 || currentOrder.combos.length > 0;
    if (!hasItems) { alert('Your order is empty! Add some items first.'); return; }
    generateReceipt();
    showScreen('checkout');
}

function generateReceipt() {
    const receiptContainer = document.getElementById('receipt');
    let html = '<div class="receipt-header">One Heck Of A Sandwich<br>Receipt</div>';

    html += '<div style="margin-bottom: 20px;">';
    html += `<div style="text-align: center; color: var(--text-muted); margin-bottom: 20px;">Order Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>`;

    currentOrder.sandwiches.forEach((sandwich) => {
        const name = sandwich.name || `${sandwich.size}" ${sandwich.bread}${sandwich.toasted ? ' (Toasted)' : ''} Sandwich`;
        html += `<div class="receipt-item"><strong>🥪 ${name}</strong><br>`;
        if (sandwich.toppings && sandwich.toppings.length > 0) {
            html += `Toppings: ${sandwich.toppings.map(t => t.name + (t.isExtra ? ' (Extra)' : '')).join(', ')}<br>`;
        }
        if (sandwich.surcharges > 0) html += `Additional Charges: $${sandwich.surcharges.toFixed(2)}<br>`;
        html += `Price: $${sandwich.price.toFixed(2)}</div>`;
    });

    currentOrder.combos.forEach((combo) => {
        html += `<div class="receipt-item"><strong>🍱 ${combo.name}</strong><br>${combo.desc}<br>Price: $${combo.price.toFixed(2)}<br><em style="color: var(--success);">You saved $${combo.savings.toFixed(2)}!</em></div>`;
    });

    currentOrder.drinks.forEach((drink) => {
        html += `<div class="receipt-item"><strong>🍹 ${drink.size} ${drink.flavor}</strong><br>Price: $${drink.price.toFixed(2)}</div>`;
    });

    currentOrder.chips.forEach((chips) => {
        html += `<div class="receipt-item"><strong>🥔 ${chips.flavor} Chips</strong><br>Price: $${chips.price.toFixed(2)}</div>`;
    });

    html += '</div>';
    html += `<div class="receipt-total">Total: $${currentOrder.total.toFixed(2)}</div>`;

    receiptContainer.innerHTML = html;
}

function printReceipt() {
    window.print();
}

function confirmOrder() {
    currentOrderNumber = generateOrderNumber();

    const orderData = {
        orderNumber: currentOrderNumber,
        timestamp: new Date().toISOString(),
        ...currentOrder
    };

    console.log('Order confirmed:', orderData);

    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show order number
    document.getElementById('order-number-display').textContent = `Order ${currentOrderNumber}`;

    showScreen('thank-you');
    startOrderTracker();

    setTimeout(() => {
        currentOrder = { sandwiches: [], drinks: [], chips: [], combos: [], total: 0 };
    }, 1000);
}

// ==================
// Animated Order Tracker
// ==================
function startOrderTracker() {
    // Reset all steps
    ['tracker-received', 'tracker-preparing', 'tracker-making', 'tracker-ready'].forEach(id => {
        document.getElementById(id).classList.remove('completed');
    });
    ['tracker-line-1', 'tracker-line-2', 'tracker-line-3'].forEach(id => {
        document.getElementById(id).classList.remove('filled');
    });

    // Animate steps sequentially
    document.getElementById('tracker-received').classList.add('completed');

    setTimeout(() => {
        document.getElementById('tracker-line-1').classList.add('filled');
        document.getElementById('tracker-preparing').classList.add('completed');
    }, 1500);

    setTimeout(() => {
        document.getElementById('tracker-line-2').classList.add('filled');
        document.getElementById('tracker-making').classList.add('completed');
    }, 3000);

    setTimeout(() => {
        document.getElementById('tracker-line-3').classList.add('filled');
        document.getElementById('tracker-ready').classList.add('completed');
    }, 4500);
}

// ==================
// Order History
// ==================
function showOrderHistory() {
    const historyList = document.getElementById('history-list');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    if (orders.length === 0) {
        historyList.innerHTML = '<div class="history-empty"><p>No past orders yet.</p><p style="color: var(--text-muted);">Place an order and it will show up here!</p></div>';
    } else {
        let html = '';
        orders.slice().reverse().forEach((order, i) => {
            const date = new Date(order.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const itemCount = (order.sandwiches?.length || 0) + (order.drinks?.length || 0) + (order.chips?.length || 0) + (order.combos?.length || 0);

            html += `<div class="history-card">
                <div class="history-card-header">
                    <span class="history-order-num">${order.orderNumber || '#---'}</span>
                    <span class="history-date">${dateStr}</span>
                </div>
                <div class="history-card-body">
                    <span>${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                    <span class="history-total">$${(order.total || 0).toFixed(2)}</span>
                </div>
            </div>`;
        });
        historyList.innerHTML = html;
    }

    showScreen('order-history');
}

function clearHistory() {
    if (confirm('Clear all order history?')) {
        localStorage.removeItem('orders');
        showOrderHistory();
    }
}

// ==================
// Keyboard Accessibility
// ==================
function setupKeyboardNav() {
    document.addEventListener('keydown', function (e) {
        // Enter/Space on signature cards and combo cards
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('signature-card-kiosk')) {
            e.preventDefault();
            e.target.click();
        }
    });
}

// ==================
// Initialize
// ==================
document.addEventListener('DOMContentLoaded', function () {
    showScreen('main-menu');
    updateClock();
    setInterval(updateClock, 1000);
    setupKeyboardNav();

    // Subtle click feedback
    document.addEventListener('click', function (e) {
        const el = e.target.closest('.btn') || e.target.closest('.kiosk-card') || e.target.closest('.signature-card-kiosk');
        if (el) {
            el.style.transform = 'scale(0.97)';
            setTimeout(() => { el.style.transform = ''; }, 100);
        }
    });
});
