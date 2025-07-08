$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products.find(p => p.id === productId);

  const container = $('#productDetail');

  if (!product) {
    container.html(`<div class="text-center text-danger">Product not found!</div>`);
    return;
  }

  const detailHTML = `
       <div class="container py-4">
          <div class="card shadow p-4">
            <div class="row g-4 align-items-center">
              <!-- Product Image (responsive) -->
              <div class="col-12 col-md-6">
                <img src="${product.image}" 
                    alt="${product.name}" 
                    class="img-fluid rounded w-100" 
                    style="max-height: 400px; object-fit: cover; border: 1px solid #ccc;">
              </div>

              <!-- Product Details -->
              <div class="col-12 col-md-6">
                <h4 class="mb-3">${product.name}</h4>

                <div class="mb-2"><strong>Price:</strong> ₹${product.price}</div>
                <div class="mb-2"><strong>Category:</strong> ${product.category}</div>
                <div class="mb-2"><strong>Description:</strong><br> ${product.description}</div>
                <div class="mb-2"><strong>Location:</strong> ${product.city}, ${product.state}</div>
                <div class="mb-3"><strong>Seller:</strong> <span class="text-primary fw-semibold">${product.seller_name}</span></div>

                <a href="/views/chat.html?product_id=${product.id}">
                  <button class="btn btn-success w-100 w-md-auto" id="chatBtn">
                    <i class="fa fa-comments me-1"></i> Chat with ${product.seller_name}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>


      `;

  container.html(detailHTML);


  $("#chatBtn").click(function () {
    localStorage.setItem("chatProductId", product.id);
    localStorage.setItem("chatSellerId", product.seller_id);
    window.location.href = "chat.html";
  });
});

