document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productContainer = document.getElementById("product-list");

    if (!productForm || !productContainer) {
        console.error("❌ Form or product container not found!");
        return;
    }

    const API_BASE_URL = "https://backend2-9rho.onrender.com";

    // ✅ Fetch products from the API and display them
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) throw new Error("❌ Failed to fetch products.");

            const products = await response.json();
            console.log("📦 Products from DB:", products);
            renderProducts(products);
        } catch (error) {
            console.error("❌ Error fetching products:", error);
        }
    }

    // ✅ Render products dynamically
    function renderProducts(products) {
        productContainer.innerHTML = "";
        products.forEach((product) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${product.images?.[0] || 'placeholder.jpg'}" 
                     alt="${product.name}" 
                     width="100" 
                     onerror="this.src='placeholder.jpg'">
                <div>
                    <strong>${product.name}</strong> - ₱${product.price} (${product.category})
                    <p>${product.description || 'No description available'}</p>
                    <p><strong>Stock:</strong> ${product.stock > 0 ? product.stock : "❌ Out of Stock"}</p>
                </div>
            `;

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "✏️ Edit";
            editButton.addEventListener("click", () => editProduct(product._id));

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑 Delete";
            deleteButton.addEventListener("click", () => deleteProduct(product._id));

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            productContainer.appendChild(li);
        });
    }

    // ✅ Redirect to Edit Product Page
    function editProduct(productId) {
        window.location.href = `edit-product.html?id=${productId}`;
    }

    // ✅ Delete Product (Calls API with DELETE method)
    window.deleteProduct = async (id) => {
        console.log("🛠 Deleting Product ID:", id);

        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "❌ Failed to delete product.");
            }

            alert("✅ Product and images deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("❌ Error deleting product:", error);
            alert(error.message);
        }
    };

    // ✅ Handle Product Submission
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("product-name")?.value.trim();
        const price = parseFloat(document.getElementById("product-price")?.value.trim());
        const description = document.getElementById("product-description")?.value.trim();
        const category = document.getElementById("product-category")?.value;
        const stockInput = document.getElementById("product-stock");

        if (!stockInput) {
            console.error("❌ Stock input field not found!");
            alert("❌ Stock input field is missing.");
            return;
        }

        const stock = parseInt(stockInput.value.trim(), 10);

        const mainImageFile = document.getElementById("product-image")?.files[0];
        const additionalImages = document.querySelectorAll(".additional-image");

        if (!name || isNaN(price) || !category || !mainImageFile || isNaN(stock)) {
            alert("❌ Please fill in all required fields.");
            return;
        }

        if (stock < 0) {
            alert("❌ Stock cannot be negative.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("stock", stock);
        formData.append("images", mainImageFile);

        // ✅ Append Additional Images (If Available)
        additionalImages.forEach((input) => {
            if (input.files.length > 0) {
                formData.append("images", input.files[0]);
            }
        });

        try {
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "❌ Failed to save product.");

            alert("✅ Product saved successfully!");
            productForm.reset();
            fetchProducts();
        } catch (error) {
            console.error("❌ Error saving product:", error);
            alert("❌ Failed to save product.");
        }
    });

    // ✅ Ensure Stock is Not Overwritten When Editing a Product
    async function updateProduct(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            if (!response.ok) throw new Error("❌ Failed to fetch product data.");

            const productData = await response.json();

            const name = document.getElementById("product-name").value.trim();
            const price = parseFloat(document.getElementById("product-price").value.trim());
            const description = document.getElementById("product-description").value.trim();
            const category = document.getElementById("product-category").value;
            const stockInput = document.getElementById("product-stock");

            let stock = productData.stock;
            if (stockInput) {
                const newStockValue = parseInt(stockInput.value.trim(), 10);
                if (!isNaN(newStockValue)) {
                    stock = newStockValue;
                }
            }

            const updatedProduct = { name, price, description, category, stock };

            const updateResponse = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct)
            });

            const updateResult = await updateResponse.json();
            if (!updateResponse.ok) throw new Error(updateResult.error || "❌ Failed to update product.");

            alert("✅ Product updated successfully!");
            fetchProducts();
        } catch (error) {
            console.error("❌ Error updating product:", error);
            alert("❌ Failed to update product.");
        }
    }

    fetchProducts();
});

