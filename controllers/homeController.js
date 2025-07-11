
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const orders = Object.values(JSON.parse(localStorage.getItem("orders")) || {});

  const visibleProducts = products.filter(product => {
    const productOrder = orders.find(o => o.productId === product.id && o.status === "accepted");
    return !productOrder; // exclude accepted
  });

  const sortedProducts = [...visibleProducts].sort((a, b) =>
    new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)
  );


  const latestProducts = sortedProducts.slice(0, 4);

  const container = document.getElementById("homeProductList");

  function renderProducts(productList) {
    container.innerHTML = "";

    if (productList.length === 0) {
      container.innerHTML = `<p class="text-muted text-center">No matching products found.</p>`;
      return;
    }

    productList.forEach(product => {
      container.innerHTML += `
        <div class="col-12 col-sm-6 col-lg-3 mb-4">
          <div class="card h-100 shadow-sm">
            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 180px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h6 class="card-title text-truncate">${product.name}</h6>
              <p class="mb-1"><strong>Price:</strong> ₹${product.price}</p>
              <p class="mb-1"><strong>City:</strong> ${product.city}</p>
              <span class="badge bg-dark text-light mb-2 p-2">${product.category}</span>
              <a href="/views/productDetail.html?id=${product.id}" class="btn btn-sm btn-outline-dark mt-auto">View Detail</a>
            </div>
          </div>
        </div>
      `;
    });
  }

 
  renderProducts(latestProducts);

  //search
  document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    if (query === "") {
      renderProducts(latestProducts);
    } else {
      const filtered = visibleProducts.filter(p =>
        p.name.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    }
  });

