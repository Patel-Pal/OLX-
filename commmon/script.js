$(document).ready(function(){
    $("#header").load("/commmon/header.html")

    $("#footer").load("/commmon/footer.html")
})

function showToast(message, type = 'info') {
  const toastEl = document.getElementById('appToast');
  const toastBody = toastEl.querySelector('.toast-body');
  const toastHeader = toastEl.querySelector('.toast-header');
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl);

  // Set message
  toastBody.textContent = message;

  // Optional: Customize color based on type
  const headerClassMap = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-primary text-white'
  };

  // Reset previous classes
  toastHeader.className = 'toast-header';
  toastHeader.classList.add(...(headerClassMap[type] || headerClassMap.info).split(' '));

  // Show toast
  toastInstance.show();
}
