import foodData from './data.js';

let cart = JSON.parse(localStorage.getItem('food-dashboard-bag')) || [];
let activeCategory = 'All';
let searchQuery = '';

// SCREEN NAVIGATION
const screens = {
    hero: document.getElementById('hero-page'),
    login: document.getElementById('login-page'),
    shop: document.getElementById('shop-page')
};

// ACTIONS
const mainOrderBtn = document.getElementById('main-order-btn');
const secBrowseBtn = document.getElementById('sec-browse-btn');
const browseLink = document.getElementById('browse-link');
const aboutLink = document.getElementById('about-link');
const navLoginBtn = document.querySelector('.nav-login-btn');
const backToHeroBtn = document.getElementById('back-to-hero');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('full-login-form');

// SHOP ELEMENTS
const foodGrid = document.getElementById('food-grid');
const categoryGroup = document.getElementById('category-list');
const searchInput = document.getElementById('food-search');
const cartTrayTrigger = document.getElementById('cart-toggle');
const countBadge = document.querySelector('.badge-count');
const cartTrayOverlay = document.getElementById('cart-overlay');
const closeTrayIcon = document.getElementById('close-cart');
const trayItemList = document.getElementById('cart-item-list');
const trayTotalDisplay = document.getElementById('cart-total');

// MODALS
const proceedCheckoutBtn = document.getElementById('open-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const finalCheckoutForm = document.getElementById('checkout-form');
const checkoutTotalDisplay = document.getElementById('modal-total');
const trackingScreenOverlay = document.getElementById('order-overlay');
const returnToMenuBtn = document.getElementById('back-home');

// 1. NAVIGATION CONTROL
function switchScreen(id) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
    window.scrollTo(0, 0);
}

mainOrderBtn.addEventListener('click', () => switchScreen('login'));
secBrowseBtn.addEventListener('click', () => switchScreen('login'));
browseLink.addEventListener('click', () => switchScreen('login'));
aboutLink.addEventListener('click', () => switchScreen('login'));
navLoginBtn.addEventListener('click', () => switchScreen('login'));
backToHeroBtn.addEventListener('click', () => switchScreen('hero'));
logoutBtn.addEventListener('click', () => switchScreen('hero'));

// 2. DASHBOARD LOGIC (SHOP)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const name = email.split('@')[0];
    document.getElementById('user-greeting').innerText = `Hi, ${name.charAt(0).toUpperCase() + name.slice(1)} 👋`;
    switchScreen('shop');
    renderMenu();
    updateCartUI();
});

function renderMenu() {
    foodGrid.innerHTML = '';
    
    const filtered = foodData.filter(item => {
        const matchesCategory = activeCategory === 'All' || activeCategory === 'Hotel' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.restaurant.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        foodGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 100px; color: var(--text-dim); font-size: 18px;">No matching dishes found 🥗</div>`;
        return;
    }

    filtered.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.style.animationDelay = `${index * 0.03}s`;
        
        card.innerHTML = `
            <div class="food-rating"><i class="fas fa-star" style="color: #ffca28; font-size: 11px;"></i> <span>${item.rating}</span></div>
            <div class="media-wrap">
                <div class="skeleton" style="position: absolute; inset: 0; background: #1a1a1a;"></div>
                <img 
                    src="${item.image}" 
                    alt="${item.name}" 
                    class="food-img" 
                    onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';"
                    onerror="this.src='https://via.placeholder.com/300?text=Food'; this.classList.add('loaded'); this.previousElementSibling.style.display='none';"
                >
            </div>
            <h3>${item.name}</h3>
            <span class="hotel-tag"><i class="fas fa-hotel" style="margin-right: 5px;"></i> ${item.restaurant}</span>
            <span class="price-tag">₹${item.price}</span>
            <button class="add-btn-round" data-id="${item.id}"><i class="fas fa-plus"></i></button>
        `;

        card.querySelector('.add-btn-round').addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(item);
        });
        
        foodGrid.appendChild(card);
    });
}

// 3. CART (BAG) SYSTEM
function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    savePersistentCart();
    updateCartUI();
    toggleCartTray(true);
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity < 1) cart = cart.filter(i => i.id !== id);
    savePersistentCart();
    updateCartUI();
}

function savePersistentCart() {
    localStorage.setItem('food-dashboard-bag', JSON.stringify(cart));
}

function updateCartUI() {
    countBadge.innerText = cart.reduce((total, i) => total + i.quantity, 0);
    renderCartList();
}

function renderCartList() {
    trayItemList.innerHTML = '';
    let totalValue = 0;
    
    cart.forEach(item => {
        totalValue += item.price * item.quantity;
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '20px';
        div.style.marginBottom = '30px';
        
        div.innerHTML = `
            <img src="${item.image}" style="width: 70px; height: 70px; border-radius: 20px; object-fit: cover;">
            <div style="flex: 1">
                <div style="font-weight: 800; font-size: 16px;">${item.name}</div>
                <div style="color: var(--text-dim); font-size: 11px;">${item.restaurant}</div>
                <div style="color: var(--primary); font-weight: 800; font-size: 15px; margin-top: 5px;">₹${item.price * item.quantity}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="qty-btn" data-id="${item.id}" data-action="dec" style="background: #222; border: none; color: white; width: 32px; height: 32px; border-radius: 12px; cursor: pointer;">-</button>
                <span style="font-weight: 800;">${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="inc" style="background: var(--primary); border: none; color: white; width: 32px; height: 32px; border-radius: 12px; cursor: pointer;">+</button>
            </div>
        `;
        trayItemList.appendChild(div);
    });

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = () => updateCartQty(parseInt(btn.getAttribute('data-id')), btn.getAttribute('data-action') === 'inc' ? 1 : -1);
    });

    trayTotalDisplay.innerText = `₹${totalValue}`;
    checkoutTotalDisplay.innerText = totalValue;
    if (cart.length === 0) trayItemList.innerHTML = '<div style="text-align:center; padding: 50px; color: #444; font-weight: 800;">EMPTY BAG 🥡</div>';
}

function toggleCartTray(isOpen) {
    cartTrayOverlay.style.right = isOpen ? '0' : '-100%';
}

cartTrayTrigger.addEventListener('click', () => toggleCartTray(true));
closeTrayIcon.addEventListener('click', () => toggleCartTray(false));

// 4. CHECKOUT & TRACKING
proceedCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert("Your bag is empty!");
    toggleCartTray(false);
    checkoutModal.style.display = 'flex';
});

finalCheckoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkoutModal.style.display = 'none';
    trackingScreenOverlay.style.display = 'flex';
    cart = [];
    savePersistentCart();
    updateCartUI();
});

returnToMenuBtn.addEventListener('click', () => {
    trackingScreenOverlay.style.display = 'none';
});

// SEARCH & CATEGORY
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderMenu();
});

categoryGroup.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill')) {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.getAttribute('data-category');
        renderMenu();
    }
});

// INIT
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
