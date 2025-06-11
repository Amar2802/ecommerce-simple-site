// Save new user
document.getElementById('signup-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[username]) {
    alert('Username already exists!');
    return;
  }

  users[username] = password;
  localStorage.setItem('users', JSON.stringify(users));
  alert('Account created successfully!');
  window.location.href = 'login.html';
});

// Login user
document.getElementById('login-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[username] === password) {
    localStorage.setItem('loggedInUser', username);
    alert('Login successful!');
    window.location.href = 'index.html';
  } else {
    alert('Invalid credentials!');
  }
});

// Logout function (to be used in other pages)
function logout() {
  localStorage.removeItem('loggedInUser');
  alert('Logged out!');
  window.location.href = 'index.html';
}
const authSpan = document.getElementById('auth-status');
const currentUser = localStorage.getItem('loggedInUser');

if (authSpan) {
  if (currentUser) {
    authSpan.innerHTML = `Welcome, ${currentUser} <button onclick="logout()">Logout</button>`;
  } else {
    authSpan.innerHTML = `<a href="login.html">Login</a>`;
  }
}
