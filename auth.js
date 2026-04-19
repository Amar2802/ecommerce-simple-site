const USERS_KEY = 'users';

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

document.getElementById('signup-form')?.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const users = readUsers();

  if (users[username]) {
    alert('Username already exists.');
    return;
  }

  users[username] = password;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem('loggedInUser', username);
  window.location.href = 'index.html';
});

document.getElementById('login-form')?.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const users = readUsers();

  if (users[username] !== password) {
    alert('Invalid username or password.');
    return;
  }

  localStorage.setItem('loggedInUser', username);
  window.location.href = 'index.html';
});
