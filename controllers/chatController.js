const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const productId = localStorage.getItem("chatProductId");
const sellerId = localStorage.getItem("chatSellerId");
const products = JSON.parse(localStorage.getItem("products")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];
let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentBuyerId = null;

const product = products.find(p => p.id === productId);
if (!product || !loggedInUser) {
  alert("Invalid session or product.");
  location.href = "/index.html";
}

const isSeller = loggedInUser.user_id === sellerId;

const getChatId = (buyerId, sellerId, productId) => {
  return `chat_${buyerId}_${sellerId}_${productId}`;
};

function renderChat(chatId) {
  const chatBox = $("#chatBox");
  chatBox.empty();
  const chat = chats[chatId] || [];

  chat.forEach(msg => {
    const align = msg.senderId === loggedInUser.user_id ? 'text-end' : 'text-start';
    const color = msg.senderId === loggedInUser.user_id ? 'primary' : 'secondary';
    chatBox.append(`<div class="${align} mb-2"><span class="badge bg-${color}">${msg.text}</span></div>`);
  });

  chatBox.scrollTop(chatBox[0].scrollHeight);
}

function initBuyerDropdown() {
  $("#buyerSelectContainer").show();
  const relatedChatIds = Object.keys(chats).filter(id => id.includes(`_${loggedInUser.user_id}_${productId}`));
  const buyerIds = [...new Set(relatedChatIds.map(id => id.split("_")[1]))];

  $("#buyerDropdown").html(`<option value="">Select Buyer</option>`);
  buyerIds.forEach(bid => {
    const buyer = users.find(u => u.user_id === bid);
    if (buyer) {
      $("#buyerDropdown").append(`<option value="${buyer.user_id}">${buyer.name}</option>`);
    }
  });

  $("#buyerDropdown").on("change", function () {
    currentBuyerId = $(this).val();
    if (currentBuyerId) {
      const chatId = getChatId(currentBuyerId, loggedInUser.user_id, productId);
      renderChat(chatId);
    }
  });
}

function initChat() {
  if (isSeller) {
    $("#chatTitle").text(`Chat with Buyers for "${product.name}"`);
    initBuyerDropdown();
  } else {
    $("#chatTitle").text(`Chat with Seller: ${product.seller_name}`);
    currentBuyerId = loggedInUser.user_id;
    renderChat(getChatId(currentBuyerId, sellerId, productId));
  }
}

$("#sendBtn").click(() => {
  const msg = $("#messageInput").val().trim();
  if (!msg) return;

  const chatId = isSeller
    ? getChatId(currentBuyerId, loggedInUser.user_id, productId)
    : getChatId(loggedInUser.user_id, sellerId, productId);

  if (!chats[chatId]) chats[chatId] = [];
  chats[chatId].push({
    senderId: loggedInUser.user_id,
    text: msg,
    time: Date.now()
  });

  localStorage.setItem("chats", JSON.stringify(chats));
  $("#messageInput").val('');
  renderChat(chatId);
  
});

// Real-time update
setInterval(() => {
  chats = JSON.parse(localStorage.getItem("chats")) || {};
  if (isSeller && currentBuyerId) {
    renderChat(getChatId(currentBuyerId, loggedInUser.user_id, productId));
  } else if (!isSeller) {
    renderChat(getChatId(loggedInUser.user_id, sellerId, productId));
  }
}, 1000);

initChat();

$("#goToOrder").click( function () {
  

  if (!productId) {
    console.error("❌ productId is undefined!", this);
    alert("Product ID missing. Cannot proceed.");
    return;
  }

  // ✅ Save to localStorage
  localStorage.setItem("currentOrderProductId", productId);

  // ✅ Redirect to order page
  window.location.href = "/views/order.html";
});


