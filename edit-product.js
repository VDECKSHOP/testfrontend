document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "https://backend2-9rho.onrender.com"; // Change if needed
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        alert("❌ Product ID is missing!");
        return;
    }

    const editForm = document.getElementById("edit-form");

    // ✅ Load Product Data
    async function loadProduct() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            if (!response.ok) throw new Error("❌ Failed to load product data.");
            const product = await response.json();

            // Populate fields
            document.getElementById("name").value = product.name;
            document.getElementById("price").value = product.price;
            document.getElementById("stock").value = product.stock;
            document.getElementById("description").value = product.description;
            document.getElementById("category").value = product.category;

            // ✅ Show Main Image (No Change)
            document.getElementById("main-image-preview").src = product.images[0] || "placeholder.jpg";
        } catch (error) {
            console.error("❌ Error loading product:", error);
        }
    }

    // ✅ Handle Form Submission (Without Redirect)
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const productData = {
            name: document.getElementById("name").value,
            price: document.getElementById("price").value,
            stock: document.getElementById("stock").value,
            description: document.getElementById("description").value,
            category: document.getElementById("category").value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "❌ Failed to update product.");
            }

            alert("✅ Product updated successfully!");
        } catch (error) {
            console.error("❌ Error updating product:", error);
            alert(error.message);
        }
    });

    loadProduct();
});
