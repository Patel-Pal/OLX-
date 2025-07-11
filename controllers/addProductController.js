
$(document).ready(function () {
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!currentUser || currentUser.role !== 'seller') {
    alert('Access denied! Only sellers can add products.');
    window.location.href = '/views/login.html';
    return;
  }

  // Utilities
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

  // ✅ Detect if any buyer has chatted for this product
  const hasBuyerChats = (productId, sellerId) => {
    const chatData = JSON.parse(localStorage.getItem("chats")) || {};
    for (let chatKey in chatData) {
      if (
        chatKey.startsWith("chat_") &&
        chatKey.includes(`_${sellerId}`) &&
        chatKey.includes(`_${productId}`)
      ) {
        const messages = chatData[chatKey];
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

  // ✅ Render all products of the current seller
  const displaySellerProducts = () => {
    const products = loadProducts();
    const sellerProducts = products.filter(p => p.seller_id === currentUser.user_id);
    const container = $('#sellerProducts');
    const orders = JSON.parse(localStorage.getItem("orders")) || {};
    container.empty();

    if (sellerProducts.length === 0) {
      container.html(`<p class="text-muted">No products added yet.</p>`);
      return;
    }

    sellerProducts.forEach(product => {
      const showChatBtn = hasBuyerChats(product.id, product.seller_id);

      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      const order = orders.find(o => o.productId === product.id && o.sellerId === currentUser.user_id && o.status === "pending");
      let orderActionBtns = '';
      if (order) {
        orderActionBtns = `
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-success w-50 accept-order-btn" data-id="${order.orderId}">Accept Order</button>
            <button class="btn btn-sm btn-danger w-50 reject-order-btn" data-id="${order.orderId}">Reject Order</button>
          </div>
        `;
      }


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
              ${showChatBtn ? `
                <button class="btn btn-sm btn-secondary w-100 chatBtn mb-2"
                  data-product-id="${product.id}" data-seller-id="${product.seller_id}">
                  <i class="fa fa-comments me-1"></i> Chat with Buyer
                </button>` : ''}

              ${orderActionBtns}
            </div>
          </div>
        </div>
      `;

      container.append(card);
    });
  };

  // ✅ Accept order
  $(document).on('click', '.accept-order-btn', function () {
    const orderId = $(this).data('id');
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const products = loadProducts(); // Your function to load all products

    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      const productId = orders[index].productId;

      // Update order and product status
      orders[index].status = "accepted";
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          return { ...p, status: "ordered" }; // Optional: mark as ordered
        }
        return p;
      });

      // Save changes
      localStorage.setItem("orders", JSON.stringify(orders));
      saveProducts(updatedProducts);

      alert("Order accepted!");

      localStorage.removeItem("currentOrderProductId");


      // ✅ Re-render
      displaySellerProducts?.(); // If showing pending orders list
      renderHistory?.("accepted"); // Show updated list in history panel
    }
  });



  // ✅ Reject order
  $(document).on('click', '.reject-order-btn', function () {
    const orderId = $(this).data('id');
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders[index].status = "rejected";
      localStorage.setItem("orders", JSON.stringify(orders));

      alert("Order rejected!");

      localStorage.removeItem("currentOrderProductId");


      // ✅ Re-render
      displaySellerProducts?.();
      renderHistory?.("rejected");
    }
  });



  // Handle "Chat with Buyer" button
  $(document).on('click', '.chatBtn', function () {
    const productId = $(this).data('product-id');
    const sellerId = $(this).data('seller-id');
    localStorage.setItem("chatProductId", productId);
    localStorage.setItem("chatSellerId", sellerId);
    window.location.href = "/views/chat.html";
  });

  // Submit add/edit form
  $('#productForm').submit(function (e) {
    e.preventDefault();
    const id = $('#editingProductId').val() || generateProductId();
    const products = loadProducts();
    const imageFile = $('#image')[0].files[0];

    let existingImage = '';
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      existingImage = products[index].image;
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

      if (index !== -1) {
        products[index] = productData;
        alert("Product updated successfully!");
      } else {
        products.push(productData);
        alert("Product added successfully!");
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
    if (confirm("Are you sure you want to delete this product?")) {
      let products = loadProducts();
      products = products.filter(p => p.id !== productId);
      saveProducts(products);
      displaySellerProducts();
    }
  });

  // Initial render
  displaySellerProducts();
});

