document.addEventListener("DOMContentLoaded", function () {
    console.log("🛒 Loading cart for checkout...");

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        console.warn("❌ Cart is empty on checkout page.");
        return;
    }

    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");
    const selectedProductTextArea = document.getElementById("selected-product");
    const orderTotalInput = document.getElementById("order-total");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan || !selectedProductTextArea || !orderTotalInput) {
        console.error("❌ Checkout page missing cart elements!");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}`;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
        orderSummaryText += `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}\n`;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    selectedProductTextArea.value = orderSummaryText.trim();
    orderTotalInput.value = total.toFixed(2);

    console.log("✅ Cart loaded successfully in checkout.html");
});

// Handle Order Submission
document.getElementById("order-form")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstname = document.getElementById("firstname")?.value.trim();
    const lastname = document.getElementById("lastname")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const state = document.getElementById("state")?.value;
    const postcode = document.getElementById("postcode")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const orderTotal = document.getElementById("order-total")?.value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!firstname || !lastname || !address || !city || !state || !postcode || !phone || !email || cart.length === 0 || !orderTotal || !paymentMethod) {
        alert("❌ Please complete all required fields.");
        return;
    }

    const submitButton = document.getElementById("submit-order");
    if (submitButton.disabled) return;

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    const orderDetails = {
        firstname,
        lastname,
        address,
        city,
        state,
        postcode,
        phone,
        email,
        items: cart,
        total: parseFloat(orderTotal).toFixed(2),
        paymentMethod,
    };

    try {
        const API_BASE_URL = "https://backend-px8c.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderDetails),
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

// Update Stock after Order
async function updateStock(cart) {
    try {
        const API_BASE_URL = "https://backend-px8c.onrender.com";
        for (const item of cart) {
            const response = await fetch(`${API_BASE_URL}/api/products/${item.id}/update-stock`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: item.quantity }),
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

// Initialize Cart UI
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    
    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart-dropdown");

    cartIcon?.addEventListener("click", (event) => {
        event.preventDefault();
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = "none";
        }
    });
});

// Render Cart UI
function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan) {
        console.error("❌ Cart elements are missing!");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">❌</button>
        `;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

