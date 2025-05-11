async function loadProfile() {
  const res = await fetch(`${apiUrl}/profile`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  const user = await res.json();

  document.getElementById('firstName').value = user.firstName || '';
  document.getElementById('lastName').value = user.lastName || '';
  document.getElementById('middleName').value = user.middleName || '';
  document.getElementById('address').value = user.address || '';
  document.getElementById('username').value = user.username || '';
  document.getElementById('email').value = user.email || '';

  // Аватар — первая буква логина
  document.getElementById('profileAvatar').textContent = user.username ? user.username[0].toLowerCase() : '?';
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    middleName: document.getElementById('middleName').value,
    address: document.getElementById('address').value
  };
  const res = await fetch(`${apiUrl}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    alert('Профиль обновлён!');
    window.location.reload();
  } else {
    alert('Ошибка при обновлении профиля');
  }
});

window.addEventListener('DOMContentLoaded', loadProfile);
