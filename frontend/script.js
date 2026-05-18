// Home page script: loads products from the backend and manages adding items to the cart
document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById("product-container");
    const cartBadge = document.getElementById("cart-badge");

    const STORAGE_KEY = "cart";
    let cart = [];

    const loadCart = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn("Failed to load cart from localStorage:", error);
            return [];
        }
    };

    const saveCart = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (cartBadge) {
            cartBadge.innerText = totalItems;
        }
    };

    // Shows a popup notification that slides in and auto-disappears after 2.5 seconds
    const showToast = (message) => {
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #ff6b35;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "slideOut 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    };

    const renderCart = () => {
        // Cart display only on cart.html, not on home page
    };

    // Adds a product to the cart array; if it already exists, increases its quantity instead
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();
        renderCart();
        showToast("Added to cart!");
    };

    const productImages = {
        Shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        Watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        Phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
    };

    // Builds and returns a product card element with image, name, price, and add-to-cart button
    const createProductCard = (product, index) => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const image = document.createElement("img");
        image.src = product.image || productImages[product.name] || "https://images.unsplash.com/photo-1513708928061-5d437a57dd4d?w=400";
        image.alt = product.name;

        const title = document.createElement("h3");
        title.innerText = product.name;

        const price = document.createElement("p");
        price.innerText = `$${product.price}`;

        const button = document.createElement("button");
        button.classList.add("add-cart");
        button.innerText = "Add to Cart";
        button.addEventListener("click", () => addToCart({
            id: product.id || `product-${index}`,
            name: product.name,
            price: Number(product.price),
            image: product.image || productImages[product.name] || "https://images.unsplash.com/photo-1513708928061-5d437a57dd4d?w=400"
        }));

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(button);

        return card;
    };

    const showProductError = (message, showRetry = false) => {
        productContainer.innerHTML = "";
        const errorBox = document.createElement("div");
        errorBox.classList.add("product-error");
        const text = document.createElement("p");
        text.innerText = message;
        errorBox.appendChild(text);
        if (showRetry) {
            const retryBtn = document.createElement("button");
            retryBtn.classList.add("product-retry-btn");
            retryBtn.innerText = "Retry";
            retryBtn.addEventListener("click", () => loadProducts());
            errorBox.appendChild(retryBtn);
        }
        productContainer.appendChild(errorBox);
    };

    // Fetches all products from the backend API and renders them on the page
    const loadProducts = async () => {
        productContainer.innerHTML = "";
        const loadingMessage = document.createElement("div");
        loadingMessage.classList.add("product-error");
        loadingMessage.innerText = "Loading products...";
        productContainer.appendChild(loadingMessage);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            console.log("Fetching products from http://localhost:5000/products");
            const response = await fetch("http://localhost:5000/products", {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log("Fetch response status:", response.status, response.ok);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error ${response.status}`);
            }

            const products = await response.json();
            console.log("Products received from API:", products);

            if (!Array.isArray(products) || products.length === 0) {
                console.warn("No products in database");
                showProductError("No products are available yet. The database may be empty.", false);
                return;
            }

            productContainer.innerHTML = "";
            products.forEach((product, index) => {
                productContainer.appendChild(createProductCard(product, index));
            });
            console.log(`Rendered ${products.length} products successfully`);
        } catch (error) {
            clearTimeout(timeoutId);
            let msg;
            if (error.name === "AbortError") {
                msg = "Request timed out after 10s. Is the backend running on port 5000?";
                console.error("Fetch timed out — backend may be hung or unreachable");
            } else if (error.message === "Failed to fetch") {
                msg = "Cannot reach backend on port 5000. Make sure the server is running.";
                console.error("Network error — backend unreachable at localhost:5000");
            } else {
                msg = `Failed to load products: ${error.message}`;
                console.error("Error loading products:", error.message);
            }
            showProductError(msg, true);
        }
    };

    const shopNowBtn = document.querySelector(".hero button");
    if (shopNowBtn) {
        shopNowBtn.addEventListener("click", () => {
            document.querySelector(".products").scrollIntoView({ behavior: "smooth" });
        });
    }

    cart = loadCart();
    updateCartCount();
    renderCart();
    loadProducts();
});