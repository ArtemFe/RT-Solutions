'use strict';

const apiUrl = 'http://localhost:5000/api';

// Функция для декодирования JWT токена
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Ошибка декодирования токена:', e);
        return null;
    }
}

function updateHeaderForLoggedInUser(isAdmin = false) {
    const registerBtn = document.querySelector('#registerBtn');
    const loginBtn = document.querySelector('#loginBtn');
    const cart = document.querySelector('#Cart');
    const fav = document.querySelector('#Fav');
    const lk = document.querySelector('#Lk');
    const logoutBtn = document.querySelector('#logoutBtn');
    const addProductBtn = document.querySelector('#addProductBtn'); // Новая кнопка

    if (registerBtn && loginBtn && cart && fav && lk && logoutBtn && addProductBtn) {
        // Скрываем общие элементы
        registerBtn.style.display = 'none';
        loginBtn.style.display = 'none';

        if (isAdmin) {
            // Только для админа: показываем "Выйти" и "Добавить товар"
            cart.style.display = 'none';
            fav.style.display = 'none';
            lk.style.display = 'none';
            logoutBtn.style.display = 'block';
            addProductBtn.style.display = 'block';

            // Привязываем обработчики
            logoutBtn.onclick = () => {
                localStorage.removeItem('token');
                updateHeaderForGuest();
                window.location.href = '/';
            };
            addProductBtn.onclick = showAddProductModal;
        } else {
            // Для обычного пользователя: показываем всё, кроме "Добавить товар"
            cart.style.display = 'block';
            fav.style.display = 'block';
            lk.style.display = 'block';
            logoutBtn.style.display = 'block';
            addProductBtn.style.display = 'none';

            logoutBtn.onclick = () => {
                localStorage.removeItem('token');
                updateHeaderForGuest();
                window.location.href = '/';
            };
        }
    } else {
        console.error('Некоторые элементы не найдены');
    }
}

function updateHeaderForGuest() {
    const registerBtn = document.querySelector('#registerBtn');
    const loginBtn = document.querySelector('#loginBtn');
    const cart = document.querySelector('#Cart');
    const fav = document.querySelector('#Fav');
    const lk = document.querySelector('#Lk');
    const logoutBtn = document.querySelector('#logoutBtn');
    const addProductBtn = document.querySelector('#addProductBtn');

    if (registerBtn && loginBtn && cart && fav && lk && logoutBtn && addProductBtn) {
        registerBtn.style.display = 'block';
        loginBtn.style.display = 'block';
        cart.style.display = 'none';
        fav.style.display = 'none';
        lk.style.display = 'none';
        logoutBtn.style.display = 'none';
        addProductBtn.style.display = 'none';
    } else {
        console.error('Некоторые элементы не найдены');
    }
}

// Функция для показа модального окна
function showAddProductModal() {
    const modal = document.createElement('div');
    modal.id = 'addProductModal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 5px; width: 400px;">
                <h2>Добавить товар</h2>
                <form id="addProductForm">
                    <label>Название:<br><input type="text" id="productName" placeholder="Введите название" required></label><br>
                    <label>Описание:<br><textarea id="productDesc" placeholder="Введите описание товара" required></textarea></label><br>
                    <label>Цена:<br><input type="number" id="productPrice" placeholder="Введите стоимость" required min="0"></label><br>
                    <label>Категория:<br><select id="productCategory"></select></label><br>
                    <button type="submit">Добавить</button>
                    <button type="button" onclick="document.getElementById('addProductModal').remove()">Закрыть</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Заполняем категории (предположим, что ты сделаешь API для этого)
    fetchCategories();

    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const desc = document.getElementById('productDesc').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const isRental = document.getElementById('isRental').checked;

        try {
            const response = await fetch(`${apiUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name, desc, price, category, is_rental: isRental })
            });
            const result = await response.json();
            if (response.ok) {
                alert('Товар успешно добавлен!');
                modal.remove();
            } else {
                alert(`Ошибка: ${result.message}`);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при добавлении товара');
        }
    });
}

// Загрузка категорий с сервера
async function fetchCategories() {
    try {
        const response = await fetch(`${apiUrl}/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const categories = await response.json();
        const select = document.getElementById('productCategory');
        select.innerHTML = categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = decodeToken(token);
        const isAdmin = decoded && decoded.roles.includes('Admin');
        updateHeaderForLoggedInUser(isAdmin);
    } else {
        updateHeaderForGuest();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (result.token) {
                    localStorage.setItem('token', result.token);
                    const decoded = decodeToken(result.token);
                    const isAdmin = decoded && decoded.roles.includes('Admin');
                    updateHeaderForLoggedInUser(isAdmin);
                    alert('Авторизация прошла успешно!');
                    window.location.href = '/';
                } else {
                    alert('Ошибка авторизации: токен не получен');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при авторизации');
            }
        });
    }
});