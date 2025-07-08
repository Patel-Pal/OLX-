$(document).ready(function () {
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!currentUser || currentUser.role !== 'seller') {
    alert('Access denied! Only sellers can add products.');
    window.location.href = '/views/login.html';
    return;
  }

  // Utility Functions
  const generateProductId = () => 'PID' + Date.now();
  const loadProducts = () => JSON.parse(localStorage.getItem('products')) || [];
  const saveProducts = (products) => localStorage.setItem('products', JSON.stringify(products));
  const convertImageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Check if any buyer has chatted for a given product
  const hasBuyerChats = (productId, sellerId) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`chat_${productId}_`) && key.endsWith(`_${sellerId}`)) {
        const messages = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(messages) && messages.length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  // Reset form
  const resetForm = () => {
    $('#productForm')[0].reset();
    $('#editingProductId').val('');
    $('#submitBtn').text('Add Product');
    $('#image').val('');
  };

  // Display seller's products
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
      const chatButtonHtml = hasBuyerChats(product.id, product.seller_id)
        ? `
          <a href="/views/chat.html?product_id=${product.id}">
            <button class="btn btn-sm btn-success w-100 w-md-auto chatBtn"
              data-product-id="${product.id}" data-seller-id="${product.seller_id}">
              <i class="fa fa-comments me-1"></i> Chat with Buyer
            </button>
          </a>`
        : '';

      const card = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card h-100 shadow-sm border">
            <img src="${product.image}" class="card-img-top" alt="${product.name}"
              style="height: 180px; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
            <div class="card-body p-3">
              <h6 class="card-title mb-1 text-truncate">${product.name}</h6>
              <p class="mb-1"><strong>Category:</strong> ${product.category}</p>
              <p class="mb-1"><strong>Price:</strong> ₹${product.price}</p>
              <p class="mb-1"><strong>City:</strong> ${product.city}, ${product.state}</p>
              <p class="mb-2 text-truncate" style="max-height: 3.5em; overflow: hidden;">
                <strong>Description:</strong> ${product.description}
              </p>
              <button class="btn btn-sm btn-warning edit-btn w-100 mb-2" data-id="${product.id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn w-100 mb-2" data-id="${product.id}">Delete</button>
              ${chatButtonHtml}
            </div>
          </div>
        </div>
      `;

      container.append(card);
    });
  };

  // Handle chat button click
  $(document).on('click', '.chatBtn', function () {
    const productId = $(this).data('product-id');
    const sellerId = $(this).data('seller-id');
    localStorage.setItem("chatProductId", productId);
    localStorage.setItem("chatSellerId", sellerId);
  });

  // Submit add/update product form
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

      const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
      modal.show();
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

  // Initial display
  displaySellerProducts();
});
