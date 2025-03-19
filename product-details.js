document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "https://backend-px8c.onrender.com"; // ✅ Declare this ONLY ONCE

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        alert("❌ Product ID is missing!");
        window.location.href = "index.html";
        return;
    }

    async function fetchProductDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);

            if (!response.ok) {
                throw new Error(`❌ API Error: ${response.status} - ${response.statusText}`);
            }

            const product = await response.json();
            console.log("📦 Product Data:", product);

            if (!product || !product.images || product.images.length === 0) {
                alert("❌ Product images not found!");
                window.location.href = "index.html";
                return;
            }

            // ✅ Set Product Information
            document.getElementById("product-name").textContent = product.name;
            document.getElementById("product-price").textContent = `₱${product.price.toFixed(2)}`;
            document.getElementById("product-description").textContent = product.description || "No description available.";

            // ✅ Ensure Stock is Displayed Correctly
            updateStockDisplay(product.stock);

            // ✅ Set Main Product Image
            const mainImage = document.getElementById("main-product-image");
            const mainImageUrl = product.images[0]?.url || product.images[0];
            mainImage.src = mainImageUrl.startsWith("http") ? mainImageUrl : `${API_BASE_URL}${mainImageUrl}`;
            mainImage.onerror = () => (mainImage.src = "placeholder.jpg");

            // ✅ Generate Thumbnails for All Images
            const thumbnailsContainer = document.getElementById("thumbnails");
            thumbnailsContainer.innerHTML = "";

            product.images.forEach((img, index) => {
                const imgUrl = img.url || img;
                const imgElement = document.createElement("img");
                imgElement.src = imgUrl.startsWith("http") ? imgUrl : `${API_BASE_URL}${imgUrl}`;
                imgElement.classList.add("thumbnail");
                imgElement.alt = `Thumbnail ${index + 1}`;
                imgElement.onerror = () => (imgElement.src = "placeholder.jpg");

                // ✅ Clicking a thumbnail updates the main image with a smooth transition
                imgElement.onclick = () => {
                    mainImage.style.opacity = 0;
                    setTimeout(() => {
                        mainImage.src = imgUrl.startsWith("http") ? imgUrl : `${API_BASE_URL}${imgUrl}`;
                        mainImage.style.opacity = 1;
                    }, 200);
                };

                thumbnailsContainer.appendChild(imgElement);
            });

        } catch (error) {
            console.error("❌ Error fetching product:", error);
            alert("❌ Failed to load product details.");
            window.location.href = "index.html";
        }
    }

    await fetchProductDetails();
});

// ✅ Update Stock Display Function
function updateStockDisplay(stock) {
    const stockElement = document.getElementById("product-stock");
    stockElement.textContent = stock > 0 ? `${stock} in stock` : "❌ Out of Stock";

    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    if (stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Out of Stock";
        addToCartBtn.classList.add("disabled");
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = "Add to Cart";
        addToCartBtn.classList.remove("disabled");
    }
}

// ✅ Quantity Controls
function incrementQuantity() {
    let quantityInput = document.getElementById("quantity");
    let stock = parseInt(document.getElementById("product-stock").textContent, 10) || 0;

    if (quantityInput.value < stock) {
        quantityInput.value = parseInt(quantityInput.value, 10) + 1;
    } else {
        alert("❌ Not enough stock available!");
    }
}

function decrementQuantity() {
    let quantityInput = document.getElementById("quantity");
    if (parseInt(quantityInput.value, 10) > 1) {
        quantityInput.value = parseInt(quantityInput.value, 10) - 1;
    }
}

// ✅ Add to Cart Function
async function addToCartFromDetails() {
    const productId = new URLSearchParams(window.location.search).get("id");
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    let stockElement = document.getElementById("product-stock");
    let stock = parseInt(stockElement.textContent, 10) || 0;

    if (!productId || isNaN(quantity) || quantity <= 0) {
        alert("❌ Invalid product or quantity.");
        return;
    }

    if (quantity > stock) {
        alert("❌ Not enough stock available!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: document.getElementById("product-name").textContent,
            price: parseFloat(document.getElementById("product-price").textContent.replace(/[^\d.]/g, "")),
            quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Product added to cart!");

    async function fetchUpdatedStock() {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) return;

    try {
        const API_BASE_URL = "https://backend-px8c.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);

        if (!response.ok) {
            console.error("❌ Failed to fetch updated stock.");
            return;
        }

        const product = await response.json();
        updateStockDisplay(product.stock);
        console.log("🔄 Stock Updated After Order:", product.stock);
    } catch (error) {
        console.error("❌ Error fetching updated stock:", error);
    }
}

}

// ✅ Attach Events
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("increment-btn").onclick = incrementQuantity;
    document.getElementById("decrement-btn").onclick = decrementQuantity;
    document.querySelector(".add-to-cart-btn").onclick = addToCartFromDetails;
});
