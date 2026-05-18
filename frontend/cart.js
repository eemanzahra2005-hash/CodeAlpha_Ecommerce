// Cart page script: reads cart from localStorage and handles quantity updates and item removal
document.addEventListener("DOMContentLoaded", () => {
    const cartContent = document.getElementById("cart-content");
    const emptyCartMessage = document.getElementById("empty-cart-message");
    const cartSummary = document.getElementById("cart-summary");
    const subtotalSpan = document.getElementById("subtotal");
    const taxSpan = document.getElementById("tax");
    const totalSpan = document.getElementById("total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const cartBadge = document.getElementById("cart-badge");

    const STORAGE_KEY = "cart";
    let cart = loadCart();

    // Reads cart items saved in localStorage; returns empty array if nothing is stored
    function loadCart() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function updateBadge() {
        const total = cart.reduce((s, i) => s + (i.quantity || 1), 0);
        if (cartBadge) cartBadge.textContent = total;
    }

    // Calculates and displays subtotal, 10% tax, and grand total from all cart items
    function updateTotals() {
        const subtotal = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        taxSpan.textContent = `$${tax.toFixed(2)}`;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }

    function createCartCard(item) {
        const card = document.createElement("div");
        card.className = "cart-card";
        card.dataset.id = item.id;

        const subtotal = (item.price * (item.quantity || 1)).toFixed(2);
        card.innerHTML = `
            <img class="cart-card-img"
                 src="${item.image}"
                 alt="${item.name}"
                 onerror="this.src='https://images.unsplash.com/photo-1513708928061-5d437a57dd4d?w=80'">
            <div class="cart-card-info">
                <p class="cart-card-name">${item.name}</p>
                <p class="cart-card-unit-price">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
                <span class="qty-display">${item.quantity || 1}</span>
                <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <p class="cart-card-subtotal">$${subtotal}</p>
            <button class="delete-btn" aria-label="Remove item">🗑</button>
        `;

        card.querySelector(".qty-minus").addEventListener("click", () => changeQty(item.id, -1, card));
        card.querySelector(".qty-plus").addEventListener("click", () => changeQty(item.id, 1, card));
        card.querySelector(".delete-btn").addEventListener("click", () => animateRemove(item.id, card));

        return card;
    }

    // Increases or decreases an item's quantity; removes it automatically if quantity drops to zero
    function changeQty(itemId, delta, card) {
        const item = cart.find(i => i.id === itemId);
        if (!item) return;
        const newQty = (item.quantity || 1) + delta;
        if (newQty < 1) {
            animateRemove(itemId, card);
            return;
        }
        item.quantity = newQty;
        saveCart();
        updateBadge();
        card.querySelector(".qty-display").textContent = newQty;
        card.querySelector(".cart-card-subtotal").textContent = `$${(item.price * newQty).toFixed(2)}`;
        updateTotals();
    }

    // Removes item from cart with a slide-out animation, then saves the updated cart
    function animateRemove(itemId, card) {
        card.classList.add("removing");
        card.addEventListener("animationend", () => {
            cart = cart.filter(i => i.id !== itemId);
            saveCart();
            card.remove();
            updateBadge();
            if (cart.length === 0) {
                showEmpty();
            } else {
                updateTotals();
            }
        }, { once: true });
    }

    function showEmpty() {
        cartContent.innerHTML = "";
        emptyCartMessage.style.display = "block";
        cartSummary.style.display = "none";
    }

    function renderCart() {
        updateBadge();

        if (cart.length === 0) {
            showEmpty();
            return;
        }

        emptyCartMessage.style.display = "none";
        cartSummary.style.display = "block";
        cartContent.innerHTML = "";

        cart.forEach(item => cartContent.appendChild(createCartCard(item)));
        updateTotals();
    }

    checkoutBtn.addEventListener("click", () => {
        alert("Checkout coming soon!");
    });

    renderCart();
});
