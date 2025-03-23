document.addEventListener("DOMContentLoaded", () => {
    loadNewArrivals();
    renderCart();
    setupCartDropdown();
});

// ✅ Fetch new arrival products from API
async function loadNewArrivals() {
    try {
        const API_BASE_URL = "https://backend2-9rho.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/products/new-arrivals`); // ✅ New API route

        if (!response.ok) throw new Error(`❌ Failed to fetch new arrivals: ${response.status} ${response.statusText}`);

        const newArrivals = await response.json();
        console.log("📦 New Arrivals from DB:", newArrivals);
        renderNewArrivals(newArrivals);
    } catch (error) {
        console.error("❌ Error fetching new arrivals:", error.message);
    }
}

// ✅ Render new arrival products
function renderNewArrivals(products) {
    const newArrivalsContainer = document.getElementById("new-arrivals-container");
    if (!newArrivalsContainer) {
        console.error("❌ New Arrivals container not found!");
        return;
    }

    newArrivalsContainer.innerHTML = ""; // Clear existing content

    products.forEach((product) => {
        const imageUrl = product.images?.[0] || "placeholder.jpg";

        const productHTML = `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.name}" 
                    onerror="this.onerror=null; this.src='placeholder.jpg';"
                    onclick="goToProductDetails('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
                <h3>${product.name}</h3>
                <p>₱${product.price.toFixed(2)}</p>
               
            </div>`;

        newArrivalsContainer.insertAdjacentHTML("beforeend", productHTML);
    });
}

// ✅ Redirect to product details page
function goToProductDetails(id, name, price, image) {
    window.location.href = `product-details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}`;
}

// ✅ Add item to cart
function addToCart(id, name, price) {
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
}

// ✅ Render the cart in the dropdown
function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan) {
        console.error("❌ Cart elements not found!");
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

// ✅ Remove an item from the cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

// ✅ Cart dropdown toggle logic
function setupCartDropdown() {
    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart-dropdown");

    if (!cartIcon || !cartDropdown) {
        console.error("❌ Cart dropdown elements not found!");
        return;
    }

    cartIcon.addEventListener("click", (event) => {
        event.preventDefault();
        cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = "none";
        }
    });
}

// ✅ Checkout button redirect
document.getElementById("checkout-button")?.addEventListener("click", function () {
    window.location.href = "checkout.html";
});
