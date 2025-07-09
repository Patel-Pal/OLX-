$(document).ready(function () {
  const allProducts = JSON.parse(localStorage.getItem('products')) || [];

  // Render Product Cards
  function renderProducts(products) {
    const container = $('#productList');
    container.empty();

    if (products.length === 0) {
      container.html(`<p class="text-center text-muted">No products available.</p>`);
      return;
    }

    // const products = JSON.parse(localStorage.getItem("products")) || [];

    // 🧹 Hide ordered ones
    // const visibleProducts = products.filter(p => p.status !== "ordered");

    const visibleProducts = products.filter(p => p.status !== "accepted");


    console.log(visibleProducts)

    visibleProducts.forEach(product => {
      const card = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div class="card card-product h-100">
      <img src="${product.image}" 
          class="card-img-top product-img" 
          alt="${product.name}" 
          style="height: 180px; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
          
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
  }

  // Populate dynamic dropdowns
  function populateFilterDropdowns(products) {
    const categories = new Set();
    const cities = new Set();
    const states = new Set();

    products.forEach(product => {
      if (product.category) categories.add(product.category);
      if (product.city) cities.add(product.city);
      if (product.state) states.add(product.state);
    });

    const populateSelect = (selector, values) => {
      const select = $(selector);
      select.empty().append('<option value="">All</option>');
      Array.from(values).sort().forEach(val => {
        select.append(`<option value="${val}">${val}</option>`);
      });
    };

    populateSelect('#filterCategory', categories);
    populateSelect('#filterCity', cities);
    populateSelect('#filterState', states);
  }

  // Apply filters
  function applyFilters() {
    const category = $('#filterCategory').val().toLowerCase();
    const city = $('#filterCity').val().toLowerCase();
    const state = $('#filterState').val().toLowerCase();
    const minPrice = parseFloat($('#filterMinPrice').val()) || 0;
    const maxPrice = parseFloat($('#filterMaxPrice').val()) || Number.MAX_VALUE;

    const filtered = allProducts.filter(p => {
      const matchesCategory = !category || (p.category && p.category.toLowerCase() === category);
      const matchesCity = !city || (p.city && p.city.toLowerCase() === city);
      const matchesState = !state || (p.state && p.state.toLowerCase() === state);
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      return matchesCategory && matchesCity && matchesState && matchesPrice;
    });

    renderProducts(filtered);
  }

  // Initial render
  renderProducts(allProducts);
  populateFilterDropdowns(allProducts);

  // Live search
  $('#searchInput').on('input', function () {
    const query = $(this).val().toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
  });

  // Filter form submit
  $('#filterForm').on('submit', function (e) {
    e.preventDefault();
    applyFilters();
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterOffcanvas'));
    if (offcanvas) offcanvas.hide();
  });
});
