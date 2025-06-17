import { showGlobalMessage } from './utils.js';

async function fetchFavorites() {
  const res = await fetch(`/favorites`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return await res.json();
}

async function removeFromFavorites(productId) {
  try {
    console.log('Removing from favorites:', productId);
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Войдите для удаления из избранного');
      return;
    }

    const res = await fetch(`/favorites/${productId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log('Successfully removed from favorites');
      // Удаляем элемент из DOM
      const item = document.querySelector(`[data-product-id="${productId}"]`);
      if (item) {
        item.remove();
      }
      
      // Проверяем, остались ли еще товары
      const remainingItems = document.querySelectorAll('.favorites-item');
      if (remainingItems.length === 0) {
        document.getElementById('favoritesList').innerHTML = `
          <div class="favorites-empty">
            <h2>В избранном пока ничего нет</h2>
            <p>Добавляйте товары в избранное, чтобы не потерять их</p>
            <a href="/catalog" class="btn-primary">Перейти в каталог</a>
          </div>
        `;
      }
    } else {
      console.error('Error response:', data);
      alert(data.message || 'Ошибка при удалении из избранного');
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    alert('Произошла ошибка при удалении из избранного');
  }
}

function showDateModal(productId) {
  // Создаем модальное окно
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Выберите даты аренды</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="date-picker">
          <input type="date" id="date-from" class="date-input" min="${new Date().toISOString().split('T')[0]}">
          <input type="date" id="date-to" class="date-input" min="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="modal-qty" style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 24px;">
          <button class="qty-btn" id="modal-qty-decrease" style="width: 40px; height: 40px; font-size: 22px;">-</button>
          <span id="modal-qty-value" style="font-size: 20px; min-width: 32px; text-align: center;">1</span>
          <button class="qty-btn" id="modal-qty-increase" style="width: 40px; height: 40px; font-size: 22px;">+</button>
        </div>
        <div class="modal-actions" style="display: flex; gap: 12px;">
          <button class="btn-secondary modal-cancel" style="flex: 1 1 0;">Отмена</button>
          <button class="btn-primary modal-confirm" style="flex: 1 1 0; margin:0px;">Добавить в корзину</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Логика изменения количества
  let qty = 1;
  const qtyValue = modal.querySelector('#modal-qty-value');
  modal.querySelector('#modal-qty-increase').onclick = () => {
    qty++;
    qtyValue.textContent = qty;
  };
  modal.querySelector('#modal-qty-decrease').onclick = () => {
    if (qty > 1) {
      qty--;
      qtyValue.textContent = qty;
    }
  };

  // Обработчики событий
  const closeModal = () => {
    modal.remove();
  };
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.querySelector('.modal-cancel').onclick = closeModal;

  // Обработчик подтверждения
  modal.querySelector('.modal-confirm').onclick = async () => {
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    if (!dateFrom || !dateTo) {
      alert('Пожалуйста, выберите обе даты');
      return;
    }
    if (new Date(dateFrom) >= new Date(dateTo)) {
      alert('Дата окончания должна быть позже даты начала');
      return;
    }
    try {
      const res = await fetch(`/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          quantity: qty,
          dateFrom,
          dateTo
        })
      });
      if (res.ok) {
        alert('Товар добавлен в корзину!');
        updateCartBadge && updateCartBadge();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.message || 'Ошибка при добавлении в корзину');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Произошла ошибка при добавлении в корзину');
    }
  };

  // Закрытие по клику вне модального окна
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
}

async function renderFavorites() {
  try {
    const favorites = await fetchFavorites();
    const favoritesList = document.getElementById('favoritesList');
    
    if (!favorites || favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="favorites-empty">
          <h2>В избранном пока ничего нет</h2>
          <p>Добавляйте товары в избранное, чтобы не потерять их</p>
          <a href="/catalog" class="btn-primary">Перейти в каталог</a>
        </div>
      `;
      return;
    }

    favoritesList.innerHTML = favorites.map(item => `
      <li class="favorites-item" data-product-id="${item._id}">
        <div class="favorites-item__image">
          <img src="${item.image}" alt="${item.name}" class="favorites-item__img">
        </div>
        <div class="favorites-item__content">
          <div class="favorites-item__header">
            <h2 class="favorites-item__title">${item.name}</h2>
            <button class="favorites-item__remove" onclick="removeFromFavorites('${item._id}')">
              <img src="../images/crest.png" alt="Удалить" class="crest">
            </button>
          </div>
          <div class="favorites-item__category">${item.categoryName || ''}</div>
          <div class="favorites-item__desc">${item.minidesc || ''}</div>
          <div class="favorites-item__footer">
            <div class="favorites-item__price">${item.price} ₽/сутки</div>
            <button class="favorites-item__add-cart" data-action="add-to-cart">
              В корзину
            </button>
          </div>
        </div>
      </li>
    `).join('');

    // Добавляем обработчики событий
    favoritesList.querySelectorAll('.favorites-item__remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const item = e.target.closest('.favorites-item');
        const productId = item.dataset.productId;
        removeFromFavorites(productId);
      });
    });

    favoritesList.querySelectorAll('.favorites-item__add-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const item = e.target.closest('.favorites-item');
        const productId = item.dataset.productId;
        showDateModal(productId);
      });
    });

  } catch (error) {
    console.error('Error rendering favorites:', error);
    favoritesList.innerHTML = `
      <div class="favorites-error">
        <h2>Произошла ошибка при загрузке избранного</h2>
        <p>Пожалуйста, попробуйте позже</p>
      </div>
    `;
  }
}

window.addEventListener('DOMContentLoaded', renderFavorites);
