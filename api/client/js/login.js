'use strict';

import { showGlobalMessage } from './utils.js';

const apiUrl = '/api';

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
    console.log('Обновление хедера для пользователя, админ:', isAdmin); // Отладка

    const registerBtn = document.querySelector('#registerBtn');
    const loginBtn = document.querySelector('#loginBtn');
    const cart = document.querySelector('#Cart');
    const fav = document.querySelector('#Fav');
    const lk = document.querySelector('#Lk');
    const logoutBtn = document.querySelector('#logoutBtn');
    const addProductBtn = document.querySelector('#addProductBtn');

    // Проверяем наличие всех элементов
    console.log('Найденные элементы:', {
        registerBtn: !!registerBtn,
        loginBtn: !!loginBtn,
        cart: !!cart,
        fav: !!fav,
        lk: !!lk,
        logoutBtn: !!logoutBtn,
        addProductBtn: !!addProductBtn
    });

    if (registerBtn && loginBtn && cart && fav && lk && logoutBtn && addProductBtn) {
        // Скрываем общие элементы
        registerBtn.style.display = 'none';
        loginBtn.style.display = 'none';

        if (isAdmin) {
            // Только для админа
            cart.style.display = 'none';
            fav.style.display = 'none';
            lk.style.display = 'none';
            logoutBtn.style.display = 'block';
            addProductBtn.style.display = 'block';

            logoutBtn.onclick = () => {
                localStorage.removeItem('token');
                updateHeaderForGuest();
                window.location.href = '/';
            };
            addProductBtn.onclick = showAddProductModal;
        } else {
            // Для обычного пользователя
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
        console.error('Не все элементы найдены в хедере');
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
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 440px;">
            <div class="modal-header">
                <h2>Добавить товар</h2>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addProductForm">
                    <div class="form-group">
                        <label>Название:<br><input type="text" id="productName" placeholder="Введите название" required></label>
                    </div>
                    <div class="form-group">
                        <label>Мини-описание:<br><input type="text" id="productMiniDesc" placeholder="Введите краткое описание" required></label>
                    </div>
                    <div class="form-group">
                        <label>Описание:<br><textarea id="productDesc" placeholder="Введите описание товара" required></textarea></label>
                    </div>
                    <div class="form-group">
                        <label>Цена:<br><input type="number" id="productPrice" placeholder="Введите стоимость" required min="0"></label>
                    </div>
                    <div class="form-group">
                        <label>Категория:<br><select id="productCategory"></select></label>
                    </div>
                    <div class="form-group">
                        <label>Главное изображение:<br>
                            <input type="file" id="productImage" accept="image/*" required>
                        </label>
                    </div>
                    <div class="form-group" id="extraImagesContainer">
                        <label>Дополнительные изображения:</label>
                    </div>
                    <button type="button" id="addExtraImageBtn" class="btn-secondary" style="margin-bottom: 12px;">Добавить ещё изображение</button>
                    <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                        <label>Для аренды: <input type="checkbox" id="isRental" style="width: 20px; height: 20px;"></label>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Добавить</button>
                        <button type="button" class="btn-secondary" id="closeAddProductModal">Закрыть</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    fetchCategories();

    // Закрытие модалки
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('#closeAddProductModal').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    const extraImagesContainer = document.getElementById('extraImagesContainer');
    const addExtraImageBtn = document.getElementById('addExtraImageBtn');

    addExtraImageBtn.addEventListener('click', () => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.name = 'extraImages';
        input.className = 'extra-image-input';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Удалить';
        removeBtn.className = 'btn-secondary';
        removeBtn.style.marginLeft = '8px';
        removeBtn.onclick = () => wrapper.remove();

        wrapper.appendChild(input);
        wrapper.appendChild(removeBtn);
        extraImagesContainer.appendChild(wrapper);
    });

    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const minidesc = document.getElementById('productMiniDesc').value;
        const desc = document.getElementById('productDesc').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const isRental = document.getElementById('isRental').checked;
        const imageInput = document.getElementById('productImage');
        if (!imageInput) {
            alert('Ошибка: Поле для загрузки главного изображения не найдено');
            return;
        }
        const imageFiles = imageInput.files;
    
        if (imageFiles.length === 0) {
            alert('Пожалуйста, выберите хотя бы одно главное изображение');
            return;
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('minidesc', minidesc);
        formData.append('desc', desc);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('is_rental', isRental);
        formData.append('image', imageFiles[0]);
        document.querySelectorAll('.extra-image-input').forEach(input => {
            if (input.files[0]) {
                formData.append('extraImages', input.files[0]);
            }
        });
    
        try {
            const response = await fetch(`/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
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
        const response = await fetch(`/api/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const categories = await response.json();
        const select = document.getElementById('productCategory');
        select.innerHTML = categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

async function updateCartBadge() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const cart = await res.json();
    const badge = document.getElementById('cartBadge');
    if (cart.length > 0) {
        badge.textContent = cart.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

async function checkSession() {
    try {
        const response = await fetch(`/api/check-session`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.user) {
            const isAdmin = data.user.roles.includes('Admin');
            updateHeaderForLoggedInUser(isAdmin);
        } else {
            updateHeaderForGuest();
        }
    } catch (error) {
        console.error('Ошибка проверки сессии:', error);
        updateHeaderForGuest();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log('Токен при загрузке:', token); // Отладка

    if (token) {
        const decoded = decodeToken(token);
        console.log('Декодированный токен:', decoded); // Отладка
        const isAdmin = decoded && decoded.roles.includes('Admin');
        console.log('Это админ?', isAdmin); // Отладка
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
                const response = await fetch(`/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                console.log('Ответ сервера:', result); // Отладка

                if (result.token) {
                    localStorage.setItem('token', result.token);
                    const decoded = decodeToken(result.token);
                    console.log('Декодированный токен после логина:', decoded); // Отладка
                    const isAdmin = decoded && decoded.roles.includes('Admin');
                    console.log('Это админ после логина?', isAdmin); // Отладка
                    
                    updateHeaderForLoggedInUser(isAdmin);
                    showGlobalMessage('Авторизация прошла успешно!');
                    window.location.href = '/';
                } else {
                    showGlobalMessage('Ошибка авторизации: токен не получен', 'error');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при авторизации');
            }
        });
    }

    updateCartBadge();
});