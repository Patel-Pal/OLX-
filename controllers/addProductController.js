$(document).ready(function () {
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!currentUser || currentUser.role !== 'seller') {
    showToast('Access denied! Only sellers can add products.', 'error');
    window.location.href = '/views/login.html';
    return;
  }

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

  const resetForm = () => {
    $('#productForm')[0].reset();
    $('#editingProductId').val('');
    $('#submitBtn').text('Add Product');
    $('#image').val('');
  };


  
  const validateForm = () => {
    let isValid = true;
    const productName = $('#productName').val().trim();
    const category = $('#category').val().trim();
    const price = $('#price').val().trim();
    const city = $('#city').val().trim();
    const state = $('#state').val().trim();
    const description = $('#description').val().trim();
    const imageFile = $('#image')[0].files[0];
    const editingProductId = $('#editingProductId').val();

    // Clear previous error states
    $('.form-control').removeClass('is-invalid');

    // Product Name validation
    if (!productName) {
      showToast('Product name is required.', 'error');
      $('#productName').addClass('is-invalid');
      isValid = false;
    } else if (productName.length > 100) {
      showToast('Product name must be less than 100 characters.', 'error');
      $('#productName').addClass('is-invalid');
      isValid = false;
    }

    // Category validation
    if (!category) {
      showToast('Category is required.', 'error');
      $('#category').addClass('is-invalid');
      isValid = false;
    } else if (category.length > 50) {
      showToast('Category must be less than 50 characters.', 'error');
      $('#category').addClass('is-invalid');
      isValid = false;
    }

    // Price validation
    if (!price) {
      showToast('Price is required.', 'error');
      $('#price').addClass('is-invalid');
      isValid = false;
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      showToast('Price must be a positive number.', 'error');
      $('#price').addClass('is-invalid');
      isValid = false;
    } else if (parseFloat(price) > 1000000) {
      showToast('Price cannot exceed ₹1,000,000.', 'error');
      $('#price').addClass('is-invalid');
      isValid = false;
    }

    // City validation
    if (!city) {
      showToast('City is required.', 'error');
      $('#city').addClass('is-invalid');
      isValid = false;
    } else if (city.length > 50) {
      showToast('City must be less than 50 characters.', 'error');
      $('#city').addClass('is-invalid');
      isValid = false;
    }

    // State validation
    if (!state) {
      showToast('State is required.', 'error');
      $('#state').addClass('is-invalid');
      isValid = false;
    } else if (state.length > 50) {
      showToast('State must be less than 50 characters.', 'error');
      $('#state').addClass('is-invalid');
      isValid = false;
    }

    // Description validation
    if (!description) {
      showToast('Description is required.', 'error');
      $('#description').addClass('is-invalid');
      isValid = false;
    } else if (description.length > 500) {
      showToast('Description must be less than 500 characters.', 'error');
      $('#description').addClass('is-invalid');
      isValid = false;
    }

    // Image validation (only required for new products)
    if (!editingProductId && !imageFile) {
      showToast('Product image is required.', 'error');
      $('#image').addClass('is-invalid');
      isValid = false;
    } else if (imageFile && imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      showToast('Image size must be less than 5MB.', 'error');
      $('#image').addClass('is-invalid');
      isValid = false;
    }

    return isValid;
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

  $(document).on('click', '.accept-order-btn', function () {
    const orderId = $(this).data('id');
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const products = loadProducts();

    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      const productId = orders[index].productId;
      orders[index].status = "accepted";
      const updatedProducts = products.map(p => p.id === productId ? { ...p, status: "ordered" } : p);

      localStorage.setItem("orders", JSON.stringify(orders));
      saveProducts(updatedProducts);

      showToast("Order accepted successfully!", 'success');
      localStorage.removeItem("currentOrderProductId");

      displaySellerProducts?.();
      renderHistory?.("accepted");
    }
  });

  $(document).on('click', '.reject-order-btn', function () {
    const orderId = $(this).data('id');
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders[index].status = "rejected";
      localStorage.setItem("orders", JSON.stringify(orders));

      showToast("Order rejected.", 'warning');
      localStorage.removeItem("currentOrderProductId");

      displaySellerProducts?.();
      renderHistory?.("rejected");
    }
  });

  $(document).on('click', '.chatBtn', function () {
    const productId = $(this).data('product-id');
    const sellerId = $(this).data('seller-id');
    localStorage.setItem("chatProductId", productId);
    localStorage.setItem("chatSellerId", sellerId);
    window.location.href = "/views/chat.html";
  });

  $('#productForm').submit(function (e) {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
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
        showToast("Product updated successfully!", 'info');
      } else {
        products.push(productData);
        showToast("Product added successfully!", 'success');
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

    //  $("#addProductModal").click(function(){
    //   $(this).attr('data-bs-dismiss', 'modal');
    //  })
  });

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
$(document).on('click', '.delete-btn', function () {
  const productId = $(this).data('id');

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      let products = loadProducts();
      products = products.filter(p => p.id !== productId);
      saveProducts(products);
      // showToast("Product deleted successfully.", 'success');
      displaySellerProducts();

      Swal.fire({
        title: 'Deleted!',
        text: 'Product has been deleted.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
});


  displaySellerProducts();
});
