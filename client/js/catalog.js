const apiUrl = '/api';

async function loadCategoriesForFilters() {
    try {
        console.log('Загрузка категорий...');
        const token = localStorage.getItem('token');
        // Формируем headers только если токен есть
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`api/categories`, {
            headers
        });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const categories = await response.json();
        console.log('Категории загружены:', categories);
        const filterContainer = document.getElementById('categoryFilters');
        if (filterContainer) {
            filterContainer.innerHTML = categories.map(cat => `
                <div class="filters__itemValue">
                    <input type="checkbox" class="category-filter" id="cat-${cat._id}" value="${cat._id}" data-name="${cat.name}" checked>
                    <label for="cat-${cat._id}">${cat.name}</label>
                </div>
            `).join('');

            // Добавляем обработчики для чекбоксов
            document.querySelectorAll('.category-filter').forEach(checkbox => {
                checkbox.addEventListener('change', filterProducts);
            });

            // Вызываем фильтрацию после добавления чекбоксов
            filterProducts();

            // Снимаем все чекбоксы
            document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
        } else {
            console.error('Элемент categoryFilters не найден');
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

// Загрузка всех товаров
let allProducts = [];
async function loadProducts() {
    try {
        console.log('Загрузка товаров...');
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`api/products`, { headers });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        allProducts = await response.json();
        console.log('Товары загружены:', allProducts);
        filterProducts();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function filterProducts() {
    console.log('Фильтрация товаров...');
    if (!allProducts || allProducts.length === 0) {
        console.log('Товары ещё не загружены, пропускаем фильтрацию');
        return;
    }

    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    const searchQuery = document.getElementById('elastic').value.trim().toLowerCase();

    let filteredProducts = allProducts;

    // Фильтрация по категориям
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            const productCategoryId = product.category._id.toString();
            return selectedCategories.includes(productCategoryId);
        });
    }

    // Фильтрация по поисковому запросу
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery)
        );
    }

    displayProducts(filteredProducts);
}

// Отображение товаров
function displayProducts(products) {
    console.log('Отображение товаров:', products);
    const productList = document.getElementById('productList');
    const productCount = document.getElementById('productCount');
    if (productList && productCount) {
        if (products.length === 0) {
            productList.innerHTML = '<li class="hits-item">Товары не найдены</li>';
            productCount.textContent = '0';
        } else {
            const token = localStorage.getItem('token');
            let isAdmin = false;
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    isAdmin = payload && payload.roles && payload.roles.includes('Admin');
                } catch (e) { isAdmin = false; }
            }
            productList.innerHTML = products.map(p => `
                <li class="catalog__item">
                    <a href="/product?id=${p._id}" class="catalog__link">
                        <div class="hits-image"><img src="${p.image}" alt="${p.name}" class="hit-image"></div>
                        <div class="hit-name">${p.name}</div>
                        <div class="category">${p.categoryName || ''}</div>
                        <div class="minidesc">${p.minidesc || ''}</div>
                        <p class="price">Цена: от ${p.price} ₽/сутки</p>
                    </a>
                    <div class="hit-actions">
                        ${!isAdmin ? `<button id="add-cart-${p._id}" class="button-search text-p card" data-product-id="${p._id}">Добавить в корзину</button>` : ''}
                        ${isAdmin ? `<button class="edit-product-btn" data-id="${p._id}">Редактировать</button>
                        <button class="delete-product-btn" data-id="${p._id}">Удалить</button>` : ''}
                    </div>
                </li>
            `).join('');
            productCount.textContent = products.length;

            // === ВАЖНО: Назначаем обработчики после вставки HTML ===
            productList.querySelectorAll('.button-search[data-product-id]').forEach(btn => {
                console.log('Attaching event listener to Add to Cart button:', btn.id);
                btn.addEventListener('click', function() {
                    const productId = btn.getAttribute('data-product-id');
                    console.log('Add to Cart button clicked for productId:', productId);
                    addToCart(productId);
                });
            });
        }
    } else {
        console.error('Элементы productList или productCount не найдены');
    }
}

// Функция добавления в корзину с модальным окном
function addToCart(productId) {
    console.log('addToCart function called for productId:', productId);
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
    modal.querySelector('#modal-qty-increase').addEventListener('click', () => {
        qty++;
        qtyValue.textContent = qty;
    });
    modal.querySelector('#modal-qty-decrease').addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            qtyValue.textContent = qty;
        }
    });

    // Закрытие модалки
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Подтверждение добавления в корзину
    modal.querySelector('.modal-confirm').addEventListener('click', async () => {
        const dateFrom = modal.querySelector('#date-from').value;
        const dateTo = modal.querySelector('#date-to').value;
        if (!dateFrom || !dateTo) {
            alert('Пожалуйста, выберите обе даты!');
            return;
        }
        if (new Date(dateFrom) >= new Date(dateTo)) {
            alert('Дата окончания должна быть позже даты начала!');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Войдите для добавления в корзину!');
            return;
        }
        try {
            const res = await fetch(`/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity: qty, dateFrom, dateTo })
            });
            if (res.ok) {
                alert('Товар добавлен в корзину!');
                closeModal();
                if (typeof updateCartBadge === 'function') updateCartBadge();
            } else {
                const error = await res.json();
                alert(error.message || 'Ошибка при добавлении в корзину');
            }
        } catch (error) {
            alert('Произошла ошибка при добавлении в корзину');
        }
    });
}

// Функция для показа модального окна редактирования товара
function showEditProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 440px;">
            <div class="modal-header">
                <h2>Редактировать товар</h2>
                <button class="modal-close" type="button">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editProductForm">
                    <div class="form-group">
                        <label>Название:<br><input type="text" id="editProductName" value="${product.name}" required></label>
                    </div>
                    <div class="form-group">
                        <label>Мини-описание:<br><input type="text" id="editProductMiniDesc" value="${product.minidesc}" required></label>
                    </div>
                    <div class="form-group">
                        <label>Описание:<br><textarea id="editProductDesc" required>${product.desc}</textarea></label>
                    </div>
                    <div class="form-group">
                        <label>Цена:<br><input type="number" id="editProductPrice" value="${product.price}" required min="0"></label>
                    </div>
                    <div class="form-group">
                        <label>Категория:<br><select id="editProductCategory"></select></label>
                    </div>
                    <div class="form-group">
                        <label>Главное изображение:<br>
                            <input type="file" id="editProductImage" accept="image/*">
                        </label>
                    </div>
                    <div class="form-group" id="editExtraImagesContainer">
                        <label>Дополнительные изображения:</label>
                    </div>
                    <button type="button" id="editAddExtraImageBtn" class="btn-secondary" style="margin-bottom: 12px;">Добавить ещё изображение</button>
                    <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                        <label>Для аренды: <input type="checkbox" id="editIsRental" style="width: 20px; height: 20px;" ${product.is_rental ? 'checked' : ''}></label>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Сохранить</button>
                        <button type="button" class="btn-secondary" id="closeEditProductModal">Закрыть</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Заполнить категории
    fetch(`api/categories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(categories => {
        const select = modal.querySelector('#editProductCategory');
        select.innerHTML = categories.map(cat => `<option value="${cat._id}" ${cat._id === product.category ? 'selected' : ''}>${cat.name}</option>`).join('');
    });

    // Закрытие модалки
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('#closeEditProductModal').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Добавление дополнительных изображений
    const extraImagesContainer = modal.querySelector('#editExtraImagesContainer');
    const addExtraImageBtn = modal.querySelector('#editAddExtraImageBtn');
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

    // Отправка формы
    modal.querySelector('#editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', modal.querySelector('#editProductName').value);
        formData.append('minidesc', modal.querySelector('#editProductMiniDesc').value);
        formData.append('desc', modal.querySelector('#editProductDesc').value);
        formData.append('price', modal.querySelector('#editProductPrice').value);
        formData.append('category', modal.querySelector('#editProductCategory').value);
        formData.append('is_rental', modal.querySelector('#editIsRental').checked);
        const imageInput = modal.querySelector('#editProductImage');
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }
        modal.querySelectorAll('.extra-image-input').forEach(input => {
            if (input.files[0]) {
                formData.append('extraImages', input.files[0]);
            }
        });
        try {
            const response = await fetch(`api/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert('Товар успешно обновлён!');
                modal.remove();
                loadProducts();
            } else {
                alert(`Ошибка: ${result.message}`);
            }
        } catch (error) {
            alert('Произошла ошибка при обновлении товара');
        }
    });
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена, инициализация каталога...');
    loadCategoriesForFilters();
    loadProducts();
    document.getElementById('elastic').addEventListener('input', filterProducts);

    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
        document.getElementById('elastic').value = search;
        // filterProducts() не нужен здесь!
    }

    // Обработка кнопки поиска
    document.querySelector('.button-search').addEventListener('click', function(e) {
        e.preventDefault();
        if (!window.location.pathname.includes('catalog')) {
            const query = document.getElementById('elastic').value.trim();
            window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
        } else {
            filterProducts();
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-product-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Удалить этот товар?')) {
                try {
                    const res = await fetch(`api/products/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        alert(data.message);
                        loadProducts();
                    } else {
                        alert(data.message || 'Ошибка при удалении товара');
                    }
                } catch (err) {
                    alert('Ошибка при удалении товара');
                }
            }
        }
        if (e.target.classList.contains('edit-product-btn')) {
            const id = e.target.dataset.id;
            // Получаем данные товара для автозаполнения
            try {
                const res = await fetch(`api/products`);
                const products = await res.json();
                const product = products.find(p => p._id === id);
                if (product) {
                    showEditProductModal(product);
                } else {
                    alert('Товар не найден');
                }
            } catch (err) {
                alert('Ошибка загрузки товара для редактирования');
            }
        }
    });
});

