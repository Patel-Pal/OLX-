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
        <div class="col-lg-8">
          <div class="card shadow p-4">
            <div class="row g-4">
              <div class="col-md-5">
                <img src="${product.image}" class="product-img" alt="${product.name}">
              </div>
              <div class="col-md-7">
                <h4 class="mb-3">${product.name}</h4>
                <div class="detail-label">Price:</div>
                <div class="detail-value">₹${product.price}</div>

                <div class="detail-label">Category:</div>
                <div class="detail-value">${product.category}</div>

                <div class="detail-label">Description:</div>
                <div class="detail-value">${product.description}</div>

                <div class="detail-label">Location:</div>
                <div class="detail-value">${product.city}, ${product.state}</div>

                <div class="detail-label">Seller:</div>
                <div class="detail-value text-primary fw-semibold">${product.seller_name}</div>

                <button class="btn btn-success mt-3" onclick="startChat('${product.seller_name}')">
                  <i class="fa fa-comments me-1"></i> Chat with ${product.seller_name}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      container.html(detailHTML);
    });

    function startChat(sellerName) {
      alert("Starting chat with " + sellerName);
      // Future: redirect to real-time chat page with sellerName as query param
      // window.location.href = `/views/chat.html?seller=${encodeURIComponent(sellerName)}`;
    }