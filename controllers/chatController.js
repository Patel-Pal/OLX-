// /js/common.js - with seller chat dropdown optimization
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

$(document).ready(function () {
  const user = getCurrentUser();
  if (!user) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const productId = localStorage.getItem("chatProductId");
  const sellerId = localStorage.getItem("chatSellerId");
  const allUsers = getUsers();

  let buyerId = null;
  let chatKey = "";
  let messages = [];

  // Create dropdown if seller
  if (user.role === "seller") {
    // Scan all localStorage keys for chat keys relevant to this seller and product
    const buyers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`chat_${productId}_`) && key.endsWith(`_${sellerId}`)) {
        const parts = key.split("_");
        const bId = parts[2];
        const buyer = allUsers.find(u => u.user_id === bId);
        if (buyer && !buyers.find(b => b.user_id === buyer.user_id)) {
          buyers.push(buyer);
        }
      }
    }

    if (buyers.length > 0) {
      const dropdownHtml = `
        <div class="mb-3">
          <label class="form-label">Select Buyer</label>
          <select id="buyerDropdown" class="form-select">
            <option value="">-- Select Buyer --</option>
            ${buyers.map(b => `<option value="${b.user_id}">${b.name}</option>`).join("")}
          </select>
        </div>`;
      $("#chatBox").before(dropdownHtml);
    }

    // Load chat after selecting a buyer
    $(document).on("change", "#buyerDropdown", function () {
      buyerId = $(this).val();
      if (!buyerId) return;

      localStorage.setItem("chatWithBuyerId", buyerId);
      chatKey = `chat_${productId}_${buyerId}_${sellerId}`;
      messages = JSON.parse(localStorage.getItem(chatKey)) || [];
      renderChats();
    });
  } else {
    // For buyers
    buyerId = user.user_id;
    chatKey = `chat_${productId}_${buyerId}_${sellerId}`;
    messages = JSON.parse(localStorage.getItem(chatKey)) || [];
    renderChats();
  }

  function renderChats() {
    const allUsers = getUsers();
    $("#chatBox").html("");

    messages.forEach(msg => {
      const className = msg.sender === user.user_id ? "sent" : "received";
      const sender = allUsers.find(u => u.user_id === msg.sender);
      const senderName = sender ? sender.name : "Unknown";

      $("#chatBox").append(`
      <div class="${className} mb-2">
        <div>${msg.message}</div>
        <small class="text-muted">${senderName}</small>
      </div>
    `);
    });
  }


  $("#sendBtn").click(function () {
    const text = $("#msgInput").val().trim();
    if (!text || (!buyerId && user.role === "seller")) return;

    const msg = {
      sender: user.user_id,
      message: text,
      timestamp: new Date().toLocaleTimeString()
    };

    messages.push(msg);
    localStorage.setItem(chatKey, JSON.stringify(messages));
    $("#msgInput").val("");
    renderChats();
  });

  setInterval(() => {
    if (chatKey) {
      messages = JSON.parse(localStorage.getItem(chatKey)) || [];
      renderChats();
    }
  }, 1000);
});
