console.log("JavaScript Connected");

const buttons = document.querySelectorAll(".add-cart");

let cartCount = 0;

const cartDisplay = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");

buttons.forEach(button => {
    button.addEventListener("click", () => {

        cartCount++;

        cartDisplay.innerText = cartCount;
        const productName = button.getAttribute("data-name");

const li = document.createElement("li");

li.innerText = productName + " ";

const removeBtn = document.createElement("button");

removeBtn.innerText = "Remove";

removeBtn.addEventListener("click", () => {

    li.remove();

    cartCount--;

    cartDisplay.innerText = cartCount;
});

li.appendChild(removeBtn);

cartItems.appendChild(li);

        alert("Product Added to Cart");
    });
});