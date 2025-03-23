document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    renderCart();
});

async function loadProducts() {
    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (!response.ok) throw new Error("❌ Failed to fetch products.");

        const products = await response.json();
        console.log("📦 Products from DB:", products);
        renderProducts(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

function renderProducts(products) {
    const containers = {
        "playing-cards": document.getElementById("playing-cards"),
        "poker-chips": document.getElementById("poker-chips"),
        "accessories": document.getElementById("accessories")
    };

    Object.values(containers).forEach(container => container.innerHTML = "");

    products.forEach((product) => {
        const category = product.category?.toLowerCase() || "accessories";
        const imageUrl = product.images?.[0] || "placeholder.jpg";

        const targetContainer = containers[category] || containers["accessories"];

        const productHTML = `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='placeholder.jpg';"
                    onclick="goToProductDetails('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
                <h3>${product.name}</h3>
                <p>₱${product.price.toFixed(2)}</p>
            </div>`;

        targetContainer.insertAdjacentHTML("beforeend", productHTML);
    });
}

function goToProductDetails(id, name, price, image) {
    window.location.href = `product-details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}`;
}

window.addToCart = (id, name, price) => {
    if (!id || !name || isNaN(price)) {
        console.error("❌ Invalid product data:", { id, name, price });
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
    renderCart();
};

function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");
    const selectedProductTextArea = document.getElementById("selected-product");
    const orderTotalInput = document.getElementById("order-total");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan || !selectedProductTextArea || !orderTotalInput) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">❌ Remove</button>
        `;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
        orderSummaryText += `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}\n`;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    selectedProductTextArea.value = orderSummaryText.trim();
    orderTotalInput.value = total.toFixed(2);
}

async function updateStock(cart) {
    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        for (const item of cart) {
            const response = await fetch(`${API_BASE_URL}/api/products/${item.id}/update-stock`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: item.quantity }) // Ensure backend expects `quantity`
            });

            const responseData = await response.json();
            console.log("📦 Server Response:", responseData);

            if (!response.ok) {
                throw new Error(responseData.error || "❌ Failed to update stock.");
            }
        }
        console.log("🔧 Stock updated successfully!");
    } catch (error) {
        console.error("❌ Failed to update stock:", error.message);
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart(); // ✅ Re-render the cart after removing item
    }
}

document.getElementById("order-form")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname")?.value.trim();
    const gcash = document.getElementById("gcash")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const orderTotal = document.getElementById("order-total")?.value;
    const paymentProof = document.getElementById("payment-proof")?.files[0];

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!fullname || !gcash || !address || cart.length === 0 || !orderTotal || !paymentProof) {
        alert("❌ Please complete all fields.");
        return;
    }

    const submitButton = document.getElementById("submit-order");
    if (submitButton.disabled) return;

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("gcash", gcash);
    formData.append("address", address);
    formData.append("items", JSON.stringify(cart));
    formData.append("total", parseFloat(orderTotal).toFixed(2));
    formData.append("paymentProof", paymentProof);

    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            body: formData,
        });

        const responseData = await response.json();
        console.log("📦 Server Response:", responseData);

        if (!response.ok) throw new Error(responseData.error || "❌ Failed to place order.");

        alert("✅ Order placed successfully!");
        await updateStock(cart);
        localStorage.removeItem("cart");
        renderCart();
        document.getElementById("order-form")?.reset();
    } catch (error) {
        alert(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Place Order";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart-dropdown");

    cartIcon.addEventListener("click", (event) => {
        event.preventDefault();
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = "none";
        }
    });
});

document.getElementById("checkout-button")?.addEventListener("click", function () {
    window.location.href = "checkout.html"; // ✅ Redirect to checkout page
});

