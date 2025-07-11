// ✅ Load data
const products = JSON.parse(localStorage.getItem("products")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const orders = JSON.parse(localStorage.getItem("orders")) || [];
let productId = localStorage.getItem("currentOrderProductId");

// ✅ Fallback for buyers if productId not found
if (!productId && currentUser?.role === "buyer") {
  const fallbackOrder = orders.find(o => o.buyerId === currentUser.user_id && o.status !== "pending");
  if (fallbackOrder) {
    productId = fallbackOrder.productId;
  }
}

const product = products.find(p => p.id === productId);
const seller = users.find(u => u.user_id === product?.seller_id);
const myOrder = orders.find(o => o.productId === productId && o.buyerId === currentUser?.user_id);

// ✅ Render product details
$(document).ready(function () {
  if (!product || !productId) {
    $("#orderDetails").html(`
      <div class="alert alert-warning text-center p-4">
        <strong>No product selected.</strong><br>
        Please go back and select a product to order.
      </div>
    `);
    return;
  }

  if (product && seller) {
    if (myOrder && myOrder.status !== "pending") {
      $("#orderDetails").html(`
        <div class="alert alert-info text-center">
          This order has been <strong>${myOrder.status}</strong> and moved to your Order History.
        </div>
      `);
      return;
    }

    let orderHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-md-4 text-center">
          <img src="${product.image}" alt="${product.name}" class="img-fluid rounded shadow-sm" style="max-height: 250px; object-fit: contain;">
        </div>
        <div class="col-md-8">
          <h4 class="mb-3">${product.name}</h4>
          <p><strong>Description:</strong> ${product.description}</p>
          <p><strong>Price:</strong> ₹${product.price}</p>
          <p><strong>Seller:</strong> ${seller.name}</p>
    `;

    if (myOrder) {
      const statusLabel = myOrder.status === "pending" ? "warning" : myOrder.status === "accepted" ? "success" : "danger";
      orderHTML += `<p class="text-${statusLabel} fw-bold">Order ${myOrder.status}</p>`;

      if (currentUser.user_id === myOrder.sellerId && myOrder.status === "pending") {
        orderHTML += `
          <div class="mt-3">
            <button class="btn btn-success me-2" onclick="updateOrderStatus('${myOrder.orderId}', 'accepted')">Approve</button>
            <button class="btn btn-danger" onclick="updateOrderStatus('${myOrder.orderId}', 'rejected')">Reject</button>
          </div>
        `;
      }
    }  else if (
  (currentUser.role === "buyer") || 
  (currentUser.role === "seller" && currentUser.user_id !== product.seller_id)
) {
  orderHTML += `<button id="placeOrder" class="btn btn-success mt-3">Click for order Request</button>`;
}


    orderHTML += `</div></div>`;
    $("#orderDetails").html(orderHTML);
  }
});

// ✅ Place order
$(document).on("click", "#placeOrder", function () {
  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const alreadyOrdered = allOrders.find(o => o.productId === product.id && o.buyerId === currentUser.user_id);

  if (alreadyOrdered) {
    Swal.fire({
      icon: 'info',
      title: 'Already Ordered',
      text: 'You have already placed this order.',
      confirmButtonText: 'OK'
    });
    return;
  }

  allOrders.push({
    orderId: "OID" + Date.now(),
    productId: product.id,
    buyerId: currentUser.user_id,
    sellerId: product.seller_id,
    status: "pending"
  });

  localStorage.setItem("orders", JSON.stringify(allOrders));

  Swal.fire({
    icon: 'success',
    title: 'Order Placed!',
    text: 'Waiting for seller approval.',
    showConfirmButton: false,
    timer: 1500
  });

  setTimeout(() => location.reload(), 1600);
});

// ✅ Update order status
function updateOrderStatus(orderId, status) {
  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = allOrders.findIndex(o => o.orderId === orderId);

  if (index !== -1) {
    allOrders[index].status = status;
    localStorage.setItem("orders", JSON.stringify(allOrders));

    Swal.fire({
      icon: status === 'accepted' ? 'success' : 'warning',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      text: `The order has been ${status}.`,
      showConfirmButton: false,
      timer: 1500
    });

    if (allOrders[index].productId === productId) {
      setTimeout(() => location.reload(), 1600);
    }

    renderHistory(status);

    $("#historyTabs .nav-link").removeClass("active");
    $(`#historyTabs .nav-link[data-status="${status}"]`).addClass("active");

    const historyOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('orderHistoryCanvas'));
    if (!document.getElementById('orderHistoryCanvas').classList.contains('show')) {
      historyOffcanvas.show(); 
    }
  }
}

// ✅ Render order history
function renderHistory(status) { 
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const filtered = allOrders.filter(o =>
    (currentUser.role === "seller" && o.sellerId === currentUser.user_id && o.status === status) ||
    (o.buyerId === currentUser.user_id && o.status === status)

    // (currentUser.role === "buyer" && o.buyerId === currentUser.user_id && o.status === status)
  );

  const container = $("#historyList");
  container.html("");

  if (filtered.length === 0) {
    container.html(`<p class="text-muted">No ${status} orders found.</p>`);
    return;
  }

  filtered.forEach(o => {
    const prod = products.find(p => p.id === o.productId);
    const buyer = users.find(u => u.user_id === o.buyerId);
    const seller = users.find(u => u.user_id === o.sellerId);

    const info = currentUser.role === "seller"
      ? `<strong>Buyer:</strong> ${buyer.name}`
      : `<strong>Seller:</strong> ${seller.name}`;

    const card = `
      <div class="col-12">
        <div class="card shadow-sm mb-3">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${prod.image}" class="img-fluid rounded-start" alt="${prod.name}" style="height: 100%; object-fit: cover;">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${prod.name}</h5>
                <p class="mb-1">${info}</p>
                <p class="mb-1"><strong>Price:</strong> ₹${prod.price}</p>
                <span class="badge bg-${status === "accepted" ? "success" : status === "rejected" ? "danger" : "warning"} text-uppercase">
                  ${status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.append(card);
  });
}





// ✅ Tab switch handler
$("#historyTabs .nav-link").on("click", function () {
  $("#historyTabs .nav-link").removeClass("active");
  $(this).addClass("active");
  const status = $(this).data("status");
  renderHistory(status);
});

// ✅ Initial history load
if (currentUser) {
  renderHistory("pending");
  $("#historyBtnWrapper").removeClass("d-none");
}
