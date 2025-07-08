$(document).ready(function () {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const container = $('#productList');

    if (products.length === 0) {
        container.html(`<p class="text-center text-muted">No products available.</p>`);
        return;
    }

    products.forEach(product => {
        const card = `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card card-product h-100">
              <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
              <div class="card-body">
                <h6 class="card-title text-truncate">${product.name}</h6>
                <p><strong>Price:</strong> ₹${product.price}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Seller:</strong> ${product.seller_name}</p>
                <a href="/views/productDetail.html?id=${product.id}" class="btn btn-sm btn-outline-dark mt-2 w-100">View Detail</a>
              </div>
            </div>
          </div>
        `;
        container.append(card);
    });
});