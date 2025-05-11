async function fetchFavorites() {
  const res = await fetch(`${apiUrl}/favorites`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return await res.json();
}

async function removeFromFavorites(productId) {
  await fetch(`${apiUrl}/favorites/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  renderFavorites();
}

async function addToCartFromFavorites(productId) {
  // Здесь можно реализовать добавление в корзину
  // await fetch(`${apiUrl}/cart`, { ... });
  alert('Добавлено в корзину!');
}

async function renderFavorites() {
  const favorites = await fetchFavorites();
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = favorites.map(item => `
    <li class="favorites-item">
      <img src="${item.image}" class="favorites-item__img">
      <div class="favorites-item__info">
        <h2>${item.name}</h2>
        <div class="favorites-item__category">${item.categoryName || ''}</div>
        <div class="favorites-item__desc">${item.minidesc || ''}</div>
        <div class="favorites-item__price">Цена: ${item.price} ₽/сутки</div>
      </div>
      <button class="favorites-item__add-cart" onclick="addToCartFromFavorites('${item._id}')">В корзину</button>
      <button class="favorites-item__remove" onclick="removeFromFavorites('${item._id}')">Удалить</button>
    </li>
  `).join('');
}

window.addEventListener('DOMContentLoaded', renderFavorites);
