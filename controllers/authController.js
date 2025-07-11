$(document).ready(function () {
  const loadUsers = () => JSON.parse(localStorage.getItem('users')) || [];
  const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));
  const generateUserId = () => 'UID' + Date.now();

  // === Registration Handler ===
  $('#registerForm').on('submit', function (e) {
    e.preventDefault();

    const name = $('#name').val().trim();
    const email = $('#email').val().trim().toLowerCase();
    const password = $('#password').val().trim();
    const role = $('#role').val();

    // Validation
    if (name.length < 3) {
      showToast('Name must be at least 3 characters long.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (!role) {
      showToast('Please select a role.', 'warning');
      return;
    }

    let users = loadUsers();

    if (users.find(user => user.email === email)) {
      showToast('User already registered with this email!', 'error');
      return;
    }

    const newUser = {
      user_id: generateUserId(),
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    saveUsers(users);

    showToast('Registration successful! Redirecting to login...', 'success');
    setTimeout(() => window.location.href = '/views/login.html', 1500);
  });

  // === Login Handler ===
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const loginIdentifier = $('#loginIdentifier').val().trim().toLowerCase();
    const password = $('#loginPassword').val().trim();

    if (!loginIdentifier || !password) {
      showToast('Both fields are required!', 'warning');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);
    if (!isEmail && loginIdentifier.length < 3) {
      showToast('Enter a valid email or username (min 3 characters)', 'warning');
      return;
    }

    const users = loadUsers();

    const matchedUser = users.find(user =>
      (user.email.toLowerCase() === loginIdentifier || user.name.toLowerCase() === loginIdentifier) &&
      user.password === password
    );

    if (matchedUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Logged in as ${matchedUser.role}!`,
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        window.location.href = '/views/home.html';
      }, 1500);
    }
    else {
      showToast('Invalid credentials! Please try again.', 'error');
    }
  });

  // === Logout Handler ===
  $('#logoutBtn').on('click', function () {
    localStorage.removeItem('loggedInUser');
    // showToast('You havebeen logged out!', 'info');
    setTimeout(() => window.location.href = '/views/login.html', 1000);
  });

  // Show user name or role on home page 
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (currentUser && $('#welcomeMessage').length) {
    $('#welcomeMessage').html(`Welcome, <strong>${currentUser.name}</strong>! You are logged in as <strong>${currentUser.role}</strong>.`);
  }
});
