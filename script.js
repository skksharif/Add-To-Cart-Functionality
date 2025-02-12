document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const cartBtn = document.getElementById("cartBtn");
    const cartSidebar = document.getElementById("cartSidebar");
    const closeCart = document.getElementById("closeCartBtn");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const products = document.querySelectorAll(".product");

    // Toggle Cart Sidebar
    cartBtn.addEventListener("click", () => cartSidebar.classList.add("open"));
    closeCart.addEventListener("click", () => cartSidebar.classList.remove("open"));

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let totalCount = 0;
        let cartByCategory = {};

        Object.entries(cart).forEach(([id, item]) => {
            totalCount += item.quantity;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <span>${item.name}</span>
                <span>Rs ${item.price}</span>
                <div class="quantity">
                    <button class="decrease" data-id="${id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${id}">+</button>
                </div>
                <button class="remove" data-id="${id}">&times;</button>
            `;

            const category = item.category || 'other';
            if (!cartByCategory[category]) {
                cartByCategory[category] = [];
            }
            cartByCategory[category].push(cartItem);
        });

        // Display grouped items by category
        cartItemsContainer.innerHTML = '';
        Object.entries(cartByCategory).forEach(([category, items]) => {
            const categoryHeader = document.createElement("h3");
            categoryHeader.style.marginTop = "20px";
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            cartItemsContainer.appendChild(categoryHeader);

            items.forEach(item => cartItemsContainer.appendChild(item));
        });

        cartCount.textContent = totalCount;
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function modifyQuantity(id, change) {
        if (cart[id]) {
            cart[id].quantity += change;
            if (cart[id].quantity < 1) delete cart[id];
            updateCart();
        }
    }

    // Handle Cart Actions
    cartItemsContainer.addEventListener("click", (event) => {
        const id = event.target.dataset.id;
        if (!id) return;

        if (event.target.classList.contains("decrease")) modifyQuantity(id, -1);
        if (event.target.classList.contains("increase")) modifyQuantity(id, 1);
        if (event.target.classList.contains("remove")) delete cart[id], updateCart();
    });

    // Filter products based on selected category
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.category;
            products.forEach(product => {
                const productCategory = product.dataset.category;
                product.style.display = (selectedCategory === 'all' || selectedCategory === productCategory) ? 'flex' : 'none';
            });
        });
    });

    // Product Quantity Modification Before Adding to Cart
    document.querySelectorAll(".product").forEach((product) => {
        const quantityInput = product.querySelector(".product__quantity-input");
        product.querySelector(".product__decrease").addEventListener("click", () => {
            quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
        });
        product.querySelector(".product__increase").addEventListener("click", () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    });

    // Add to Cart
    document.querySelectorAll(".product__add-cart").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const product = event.target.closest(".product");
            const id = product.dataset.id;
            const name = product.dataset.name;
            const price = parseInt(product.dataset.price);
            const img = product.dataset.img;
            const category = product.dataset.category;
            const quantity = parseInt(product.querySelector(".product__quantity-input").value);

            cart[id] = cart[id] ? { ...cart[id], quantity: cart[id].quantity + quantity } : { name, price, img, category, quantity };
            updateCart();
        });
    });

    updateCart();
});
