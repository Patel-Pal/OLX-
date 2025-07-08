$(document).ready(function () {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!currentUser || currentUser.role !== 'seller') {
        alert('Access denied! Only sellers can add products.');
        window.location.href = '/views/login.html';
        return;
    }

    const generateProductId = () => 'PID' + Date.now();
    const loadProducts = () => JSON.parse(localStorage.getItem('products')) || [];
    const saveProducts = (products) => localStorage.setItem('products', JSON.stringify(products));

    const resetForm = () => {
        $('#productForm')[0].reset();
        $('#editingProductId').val('');
        $('#submitBtn').text('Add Product');
        $('#image').val('');
    };

    const displaySellerProducts = () => {
        const products = loadProducts();
        const sellerProducts = products.filter(p => p.seller_id === currentUser.user_id);
        const container = $('#sellerProducts');
        container.empty();

        if (sellerProducts.length === 0) {
            container.html(`<p class="text-muted">No products added yet.</p>`);
            return;
        }

        sellerProducts.forEach(product => {
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card card-product h-100">
                        <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
                        <div class="card-body">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="mb-1"><strong>Category:</strong> ${product.category}</p>
                            <p class="mb-1"><strong>Price:</strong> ₹${product.price}</p>
                            <p class="mb-1"><strong>City:</strong> ${product.city}, ${product.state}</p>
                            <p class="mb-1"><strong>Seller:</strong> ${product.seller_name}</p>
                            <p class="mb-2"><strong>Description:</strong> ${product.description}</p>
                            <button class="btn btn-sm btn-warning edit-btn w-100 mb-2" data-id="${product.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn w-100" data-id="${product.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    };

    const convertImageToBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    $('#productForm').submit(function (e) {
        e.preventDefault();

        const id = $('#editingProductId').val() || generateProductId();
        const products = loadProducts();
        const imageFile = $('#image')[0].files[0];

        let existingImage = '';
        const existingIndex = products.findIndex(p => p.id === id);
        if (existingIndex !== -1) {
            existingImage = products[existingIndex].image;
        }

        const saveProduct = (base64Image) => {
            const productData = {
                id,
                seller_id: currentUser.user_id,
                seller_name: currentUser.name,
                name: $('#productName').val().trim(),
                category: $('#category').val().trim(),
                price: parseFloat($('#price').val()),
                city: $('#city').val().trim(),
                state: $('#state').val().trim(),
                description: $('#description').val().trim(),
                image: base64Image
            };

            if (existingIndex !== -1) {
                products[existingIndex] = productData;
                alert('Product updated successfully!');
            } else {
                products.push(productData);
                alert('Product added successfully!');
            }

            saveProducts(products);
            resetForm();
            displaySellerProducts();
        };

        if (imageFile) {
            convertImageToBase64(imageFile, saveProduct);
        } else {
            saveProduct(existingImage);
        }
    });

    // Edit Product
    $(document).on('click', '.edit-btn', function () {
        const productId = $(this).data('id');
        const products = loadProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            $('#editingProductId').val(product.id);
            $('#productName').val(product.name);
            $('#category').val(product.category);
            $('#price').val(product.price);
            $('#city').val(product.city);
            $('#state').val(product.state);
            $('#description').val(product.description);
            $('#submitBtn').text('Update Product');
            // NOTE: File inputs can't be pre-filled due to browser security — so we leave image input empty
        }
    });

    // Delete Product
    $(document).on('click', '.delete-btn', function () {
        const productId = $(this).data('id');
        if (confirm('Are you sure you want to delete this product?')) {
            let products = loadProducts();
            products = products.filter(p => p.id !== productId);
            saveProducts(products);
            displaySellerProducts();
        }
    });

    displaySellerProducts();
});
