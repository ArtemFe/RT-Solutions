async function fetchCart() {
  const res = await fetch(`api/cart`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return await res.json();
}

async function removeFromCart(productId) {
  await fetch(`/cart/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  renderCart();
}

async function updateCartQuantity(productId, quantity) {
  await fetch(`/cart/${productId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });
  renderCart();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU');
}

async function renderCart() {
  const cart = await fetchCart();
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  let total = 0;
  if (!cart || cart.length === 0) {
    cartList.innerHTML = `<div class="cart-empty"><h2>Ваша корзина пуста</h2><p>Добавьте товары для аренды</p></div>`;
    cartTotal.textContent = '';
    return;
  }
  cartList.innerHTML = cart.map(item => {
    const days = (new Date(item.dateTo) - new Date(item.dateFrom)) / (1000*60*60*24) || 1;
    const sum = item.product.price * item.quantity * days;
    total += sum;
    return `
      <li class="cart-item" data-product-id="${item.product._id}">
        <img src="${item.product.image}" class="cart-item__img" alt="${item.product.name}">
        <div class="cart-item__content">
          <div class="cart-item__header">
            <h2 class="cart-item__title">${item.product.name}</h2>
            <button class="cart-item__remove" aria-label="Удалить товар" title="Удалить товар">
              <img src="../images/crest.png" alt="Удалить" class="crest">
            </button>
          </div>
          <div class="cart-item__category">${item.product.categoryName || ''}</div>
          <div class="cart-item__desc">${item.product.minidesc || ''}</div>
          <div class="dates">Срок аренды: <b>${formatDate(item.dateFrom)}</b> — <b>${formatDate(item.dateTo)}</b></div>
          <div class="cart-item__footer">
            <div class="cart-item__qty">
              <button class="cart-item__qty-btn" data-action="decrease" aria-label="Уменьшить количество">-</button>
              <span class="cart-item__qty-value">${item.quantity}</span>
              <button class="cart-item__qty-btn" data-action="increase" aria-label="Увеличить количество">+</button>
            </div>
            <div class="cart-item__price">${item.product.price} ₽/сутки</div>
            <div class="cart-item__sum"><b>Итого:</b> ${sum} ₽</div>
          </div>
        </div>
      </li>
    `;
  }).join('');
  cartTotal.textContent = `Общая сумма: ${total} ₽`;
}

window.addEventListener('DOMContentLoaded', () => {
  renderCart();

  document.getElementById('cartList').addEventListener('click', async (e) => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    
    const productId = item.dataset.productId;
    const qtyValue = item.querySelector('.cart-item__qty-value');
    
    if (e.target.closest('.cart-item__remove')) {
      await removeFromCart(productId);
      return;
    }
    
    if (e.target.closest('.cart-item__qty-btn')) {
      const action = e.target.dataset.action;
      let currentQty = parseInt(qtyValue.textContent.trim(), 10);
      
      if (isNaN(currentQty)) {
        console.error('Invalid quantity value:', qtyValue.textContent);
        return;
      }
      
      if (action === 'increase') {
        currentQty++;
      } else if (action === 'decrease' && currentQty > 1) {
        currentQty--;
      } else {
        return;
      }
      
      try {
        await updateCartQuantity(productId, currentQty);
        qtyValue.textContent = currentQty;
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Произошла ошибка при изменении количества товара');
      }
    }
  });

  document.getElementById('checkoutBtn').addEventListener('click', async () => {
    const checkoutForm = document.getElementById('checkoutForm');
    
    try {
      // Получаем данные профиля
      const profileRes = await fetch(`api/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (profileRes.ok) {
        const profile = await profileRes.json();
        
        // Заполняем форму данными из профиля
        document.getElementById('name').value = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        document.getElementById('email').value = profile.email || '';
        document.getElementById('address').value = profile.address || '';
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    
    checkoutForm.style.display = 'block';
  });

  document.getElementById('cancelCheckout').addEventListener('click', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.style.display = 'none';
  });

  document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value,
      comment: document.getElementById('comment').value
    };

    try {
      const response = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Заказ успешно оформлен!');
        document.getElementById('checkoutForm').style.display = 'none';
        document.getElementById('orderForm').reset();
        // Очищаем корзину после успешного оформления заказа
        await fetch(`api/cart`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        renderCart();
      } else {
        const error = await response.json();
        alert(`Ошибка при оформлении заказа: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      showGlobalMessage('Ошибка оформления заказа. Попробуйте позже.', 'error');
    }
  });
});

function showGlobalMessage(text, type = 'success') {
    const msg = document.getElementById('globalMessage');
    msg.textContent = text;
    msg.className = 'global-message' + (type === 'error' ? ' error' : '');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
  }
