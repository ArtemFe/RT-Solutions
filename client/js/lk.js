import { showGlobalMessage } from './utils.js';

async function loadProfile() {
  try {
    const res = await fetch(`api/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!res.ok) {
      throw new Error('Ошибка при загрузке профиля');
    }
    
    const user = await res.json();
    console.log('Loaded profile:', user); // для отладки

    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('middleName').value = user.middleName || '';
    document.getElementById('address').value = user.address || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';

    // Аватар — первая буква имени или логина
    const avatarText = user.firstName ? user.firstName[0].toUpperCase() : 
                      user.username ? user.username[0].toUpperCase() : '?';
    document.getElementById('profileAvatar').textContent = avatarText;
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Ошибка при загрузке профиля');
  }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const body = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      middleName: document.getElementById('middleName').value,
      address: document.getElementById('address').value
    };

    const res = await fetch(`api/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error('Ошибка при обновлении профиля');
    }

    const data = await res.json();
    alert(data.message || 'Профиль обновлён!');
    
    // Обновляем аватар после сохранения
    const avatarText = body.firstName ? body.firstName[0].toUpperCase() : 
                      document.getElementById('username').value[0].toUpperCase();
    document.getElementById('profileAvatar').textContent = avatarText;
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(error.message || 'Ошибка при обновлении профиля');
  }
});

window.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadActiveRentals();
    await loadAllOrders();

    // Логика переключения вкладок
    const tabButtons = document.querySelectorAll('.lk-tab-button');
    const tabContents = document.querySelectorAll('.lk-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}TabContent`).classList.add('active');
        });
    });
});

// Функция для форматирования дат
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Функция для перевода статуса заказа на русский язык
function getOrderStatusRu(status) {
    switch (status) {
        case 'pending': return 'в ожидании';
        case 'active': return 'активен';
        case 'completed': return 'завершён';
        case 'cancelled': return 'отменён';
        default: return status;
    }
}

// Функция для загрузки и отображения активных аренд
async function loadActiveRentals() {
    const activeRentalsList = document.getElementById('activeRentalsList');
    const noActiveRentalsMessage = document.getElementById('noActiveRentals');

    if (!activeRentalsList || !noActiveRentalsMessage) {
        console.error('Элементы activeRentalsList или noActiveRentals не найдены.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            activeRentalsList.innerHTML = '';
            noActiveRentalsMessage.style.display = 'block';
            noActiveRentalsMessage.innerHTML = '<p>Пожалуйста, войдите в систему, чтобы просмотреть активные аренды.</p>';
            return;
        }

        const response = await fetch(`api/orders/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const activeOrders = await response.json();

        if (activeOrders && activeOrders.length > 0) {
            // Собираем все активные товары из всех заказов
            const activeItems = activeOrders.flatMap(order =>
                order.items.filter(item => {
                    const now = new Date();
                    const dateFrom = new Date(item.dateFrom);
                    const dateTo = new Date(item.dateTo);
                    return dateFrom <= now && dateTo >= now;
                }).map(item => ({ item, order }))
            );

            if (activeItems.length === 0) {
                activeRentalsList.innerHTML = '';
                noActiveRentalsMessage.style.display = 'block';
                noActiveRentalsMessage.innerHTML = '<p>У вас пока нет активных арендованных товаров.</p>';
                return;
            }

            activeRentalsList.innerHTML = activeItems.map(({ item, order }) => {
                // Считаем сумму аренды за период
                const days = (new Date(item.dateTo) - new Date(item.dateFrom)) / (1000*60*60*24) || 1;
                const total = (item.product?.price || 0) * item.quantity * days;
                return `
                    <li class="order-item">
                        <div class="order-details">
                            <h3>${item.product?.name || 'Товар без названия'}</h3>
                            <ul>
                                <li>
                                    
                                    Количество: ${item.quantity}<br>
                                    Период аренды: ${formatDate(item.dateFrom)} - ${formatDate(item.dateTo)}
                                </li>
                            </ul>
                            <p><b>Общая сумма аренды: ${total} ₽</b></p>
                            <div style="text-align:right;">
                                <a href="/product?id=${item.product?._id}" class="btn-secondary">Подробнее</a>
                            </div>
                        </div>
                    </li>
                `;
            }).join('');
            noActiveRentalsMessage.style.display = 'none';
        } else {
            activeRentalsList.innerHTML = '';
            noActiveRentalsMessage.style.display = 'block';
            noActiveRentalsMessage.innerHTML = '<p>У вас пока нет активных арендованных товаров.</p>';
        }
    } catch (error) {
        activeRentalsList.innerHTML = '';
        noActiveRentalsMessage.style.display = 'block';
        noActiveRentalsMessage.innerHTML = '<p>Ошибка при загрузке активных аренд. Пожалуйста, попробуйте позже.</p>';
    }
}

async function loadAllOrders() {
    const ordersList = document.getElementById('ordersList');
    const noOrdersMessage = document.getElementById('noOrders');
    if (!ordersList || !noOrdersMessage) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            ordersList.innerHTML = '';
            noOrdersMessage.style.display = 'block';
            noOrdersMessage.innerHTML = '<p>Пожалуйста, войдите в систему, чтобы просмотреть заказы.</p>';
            return;
        }

        const response = await fetch(`api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const orders = await response.json();

        if (orders && orders.length > 0) {
            ordersList.innerHTML = orders.map(order => {
                // Считаем общую сумму заказа
                const total = order.items.reduce((sum, item) => {
                    const days = (new Date(item.dateTo) - new Date(item.dateFrom)) / (1000*60*60*24) || 1;
                    return sum + (item.price * item.quantity * days);
                }, 0);

                // Показываем статус заказа
                return `
                    <li class="order-item">
                        <div class="order-details">
                            <h3>Заказ от ${formatDate(order.createdAt)} (${getOrderStatusRu(order.status)})</h3>
                            <ul>
                                ${order.items.map(item => `
                                    <li>
                                        <b>${item.product?.name || 'Товар'}</b> — ${item.quantity} шт. <br>
                                        Период: ${formatDate(item.dateFrom)} - ${formatDate(item.dateTo)}
                                    </li>
                                `).join('')}
                            </ul>
                            <p><b>Общая сумма заказа: ${total} ₽</b></p>
                        </div>
                    </li>
                `;
            }).join('');
            noOrdersMessage.style.display = 'none';
        } else {
            ordersList.innerHTML = '';
            noOrdersMessage.style.display = 'block';
            noOrdersMessage.innerHTML = '<p>У вас пока нет заказов.</p>';
        }
    } catch (error) {
        ordersList.innerHTML = '';
        noOrdersMessage.style.display = 'block';
        noOrdersMessage.innerHTML = '<p>Ошибка при загрузке заказов. Пожалуйста, попробуйте позже.</p>';
    }
}
