async function fetchCart() {
  const res = await fetch(`${apiUrl}/cart`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return await res.json();
}

async function removeFromCart(productId) {
  await fetch(`${apiUrl}/cart/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  renderCart();
}

async function renderCart() {
  const cart = await fetchCart();
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  let total = 0;
  cartList.innerHTML = cart.map(item => {
    const days = (new Date(item.dateTo) - new Date(item.dateFrom)) / (1000*60*60*24) || 1;
    const sum = item.product.price * item.quantity * days;
    total += sum;
    return `
      <li class="cart-item">
        <img src="${item.product.image}" class="cart-item__img">
        <div class="cart-item__info">
          <h2>${item.product.name}</h2>
          <div class="cart-item__category">${item.product.categoryName || ''}</div>
          <div class="cart-item__dates">
            <span>Срок аренды: ${item.dateFrom ? item.dateFrom.slice(0,10) : ''} — ${item.dateTo ? item.dateTo.slice(0,10) : ''}</span>
          </div>
          <div class="cart-item__qty">Количество: ${item.quantity}</div>
          <div class="cart-item__price">Цена: ${item.product.price} ₽/сутки</div>
          <div class="cart-item__sum">Итого: ${sum} ₽</div>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart('${item.product._id}')">Удалить</button>
      </li>
    `;
  }).join('');
  cartTotal.textContent = `Общая сумма: ${total} ₽`;
}

window.addEventListener('DOMContentLoaded', renderCart);

document.getElementById('checkoutBtn').addEventListener('click', () => {
  alert('Переход к оплате (реализуйте свой процесс)');
});
