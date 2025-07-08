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

    if (!role) {
      alert('Please select a role.');
      return;
    }

    let users = loadUsers();

    if (users.find(user => user.email === email)) {
      alert('User already registered with this email!');
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

    alert('Registration successful!');
    window.location.href = '/views/login.html';
  });

  // === Login Handler ===
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const loginIdentifier = $('#loginIdentifier').val().trim().toLowerCase();
    const password = $('#loginPassword').val().trim();

    let users = loadUsers();

    const matchedUser = users.find(user =>
      (user.email === loginIdentifier || user.name.toLowerCase() === loginIdentifier) &&
      user.password === password
    );

    if (matchedUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
      alert(`Login successful as ${matchedUser.role}!`);
      window.location.href = '/views/home.html';
    } else {
      alert('Invalid credentials!');
    }
  });

    // === Logout Handler ===
  $('#logoutBtn').on('click', function () {
    localStorage.removeItem('loggedInUser');
    alert('You have been logged out!');
    window.location.href = '/views/login.html';
  });

  //  Show user name or role on home page 
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (currentUser && $('#welcomeMessage').length) {
    $('#welcomeMessage').html(`Welcome, <strong>${currentUser.name}</strong>! You are logged in as <strong>${currentUser.role}</strong>.`);
  }
});
