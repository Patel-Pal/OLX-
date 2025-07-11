const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const orders = JSON.parse(localStorage.getItem("orders")) || [];
const products = JSON.parse(localStorage.getItem("products")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];

function renderSellerOrders() {
    if (!currentUser || currentUser.role !== "seller") {
        document.getElementById("sellerOrders").innerHTML = `<p class='text-danger text-center'>Access denied. Only sellers can view this page.</p>`;
        return;
    }

    const sellerOrders = orders.filter(o => o.sellerId === currentUser.user_id);
    const container = document.getElementById("sellerOrders");
    container.innerHTML = "";

    if (sellerOrders.length === 0) {
        container.innerHTML = `<p class='text-muted text-center'>You have no orders.</p>`;
        return;
    }

    sellerOrders.forEach(order => {
        const product = products.find(p => p.id === order.productId);
        const buyer = users.find(u => u.user_id === order.buyerId);

        const statusColor = {
            pending: "warning",
            accepted: "success",
            rejected: "danger"
        }[order.status];

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3"; // responsive: up to 4 per row
        card.innerHTML = `
                        <div class="card h-100 shadow-sm">
                            <img src="${product?.image || '#'}" class="card-img-top" alt="${product?.name}" style="height: 160px; object-fit: cover;">
                            <div class="card-body d-flex flex-column p-3">
                            <h6 class="card-title mb-2 text-truncate">${product?.name}</h6>
                            <p class="mb-1 small"><strong>Buyer:</strong> ${buyer?.name || 'Unknown'}</p>
                            <p class="mb-2 small"><strong>Price:</strong> ₹${product?.price}</p>
                            <span class="badge bg-${statusColor} text-uppercase mb-3 align-self-start">${order.status}</span>

                            ${order.status === "pending" ? `
                                <div class="d-flex gap-2 mt-auto">
                                <button class="btn btn-sm btn-success w-50 accept-order-btn" data-id="${order.orderId}">Accept</button>
                                <button class="btn btn-sm btn-danger w-50 reject-order-btn" data-id="${order.orderId}">Reject</button>
                                </div>
                            ` : ""}
                            </div>
                        </div>
                        `;


        container.appendChild(card);
    });
}


// Accept order
// $(document).on("click", ".accept-order-btn", function () {
//   const orderId = $(this).data("id");
//   const orders = JSON.parse(localStorage.getItem("orders")) || [];
//   const index = orders.findIndex(o => o.orderId === orderId);
//   if (index !== -1) {
//     orders[index].status = "accepted";
//     localStorage.setItem("orders", JSON.stringify(orders));

//     Swal.fire({
//       icon: 'success',
//       title: 'Order Accepted',
//       text: 'The order has been accepted successfully!',
//       showConfirmButton: false,
//       timer: 1500
//     });

//     renderSellerOrders();
//     setTimeout(() => location.reload(), 1600);

//     localStorage.removeItem("currentOrderProductId");
//   }
// });

  // Accept order and auto-reject other orders for same product
$(document).on("click", ".accept-order-btn", function () {
  const orderId = $(this).data("id");
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = orders.findIndex(o => o.orderId === orderId);

  if (index !== -1) {
    const acceptedOrder = orders[index];
    const productId = acceptedOrder.productId;

    // Update statuses
    orders.forEach(order => {
      if (order.productId === productId) {
        if (order.orderId === orderId) {
          order.status = "accepted";
        } else {
          order.status = "rejected";
        }
      }
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("currentOrderProductId");

    Swal.fire({
      icon: 'success',
      title: 'Order Accepted',
      text: 'This order is accepted. Others were auto-rejected.',
      showConfirmButton: false,
      timer: 1500
    });

    renderSellerOrders();
    setTimeout(() => location.reload(), 1600);
  }
});



// Reject order
$(document).on("click", ".reject-order-btn", function () {
  const orderId = $(this).data("id");
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = "rejected";
    localStorage.setItem("orders", JSON.stringify(orders));

    Swal.fire({
      icon: 'warning',
      title: 'Order Rejected',
      text: 'The order has been marked as rejected.',
      showConfirmButton: false,
      timer: 1500
    });

    renderSellerOrders();
    setTimeout(() => location.reload(), 1600);

    localStorage.removeItem("currentOrderProductId");
  }
});

// Initial render
renderSellerOrders();