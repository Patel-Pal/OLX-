
const products = JSON.parse(localStorage.getItem("products")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const orders = JSON.parse(localStorage.getItem("orders")) || {};
const productId = localStorage.getItem("currentOrderProductId");
const product = products.find(p => p.id === productId); // ✅ Fix here

const seller = users.find(u => u.user_id === product?.seller_id);
const order = orders[productId];

if (product && seller) {
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
    </div>
  </div>
`;


    if (order && order.buyerId === currentUser.user_id) {
        if (order.status === "pending") {
            orderHTML += `<p class="text-warning fw-bold">Order Pending</p>`;
        } else if (order.status === "accepted") {
            orderHTML += `<p class="text-success fw-bold">Order Accepted</p>`;
        } else if (order.status === "rejected") {
            orderHTML += `<p class="text-danger fw-bold">Order Rejected</p>`;
        }
    } else {
        orderHTML += `<button id="placeOrder" class="btn btn-primary mt-3">Place Order</button>`;
    }

    $("#orderDetails").html(orderHTML);
}

$(document).on("click", "#placeOrder", function () {
    const newOrders = JSON.parse(localStorage.getItem("orders")) || {};
    newOrders[productId] = {
        productId: product.product_id,
        buyerId: currentUser.user_id,
        sellerId: product.seller_id,
        status: "pending"
    };
    localStorage.setItem("orders", JSON.stringify(newOrders));
    alert("Order Placed! Waiting for seller approval.");
    location.reload();
});
