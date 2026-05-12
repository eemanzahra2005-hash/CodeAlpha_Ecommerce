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

    const showProductError = (message) => {
        productContainer.innerHTML = "";
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("product-error");
        errorMessage.innerText = message;
        productContainer.appendChild(errorMessage);
    };

    const loadProducts = async () => {
        productContainer.innerHTML = "";
        const loadingMessage = document.createElement("div");
        loadingMessage.classList.add("product-error");
        loadingMessage.innerText = "Loading products...";
        productContainer.appendChild(loadingMessage);

        try {
            console.log("Fetching products from http://localhost:5000/products");
            const response = await fetch("http://localhost:5000/products");
            console.log("Fetch response status:", response.status, response.ok);
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const products = await response.json();
            console.log("Products received from API:", products);

            if (!Array.isArray(products) || products.length === 0) {
                console.warn("No products available or invalid format");
                showProductError("No products are available at the moment.");
                return;
            }

            console.log(`Rendering ${products.length} products`);
            productContainer.innerHTML = "";
            products.forEach((product, index) => {
                console.log(`Creating card for product ${index}:`, product.name);
                productContainer.appendChild(createProductCard(product, index));
            });
            console.log("Products rendered successfully");
        } catch (error) {
            console.error("Error loading products:", error);
            console.error("Error details:", error.message);
            showProductError("Unable to load products. Please try again later.");
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