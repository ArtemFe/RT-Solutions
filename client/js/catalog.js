async function loadCategoriesForFilters() {
    try {
        console.log('Загрузка категорий...');
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Токен отсутствует в localStorage');
            return;
        }
        const response = await fetch(`${apiUrl}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
        if (!token) {
            console.error('Токен отсутствует в localStorage');
            return;
        }
        const response = await fetch(`${apiUrl}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        allProducts = await response.json();
        console.log('Товары загружены:', allProducts);
        displayProducts(allProducts);
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
    console.log('Выбранные категории:', selectedCategories);

    let filteredProducts;
    if (selectedCategories.length === 0) {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(product => {
            const productCategoryId = product.category._id.toString();
            return selectedCategories.includes(productCategoryId);
        });
    }
    console.log('Отфильтрованные товары:', filteredProducts);
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
            productList.innerHTML = products.map(p => `
                <li class="hits-item">
                    <a href="/product" class="hits-link-item">
                        <div class="hits-image">
                            <img src="${p.image || '../images/placeholder.jpg'}" alt="${p.name}" class="hit-image">
                        </div>
                        <div class="hit-info">
                            <div class="topic-product">
                                <p class="hit-name">${p.name}</p>
                                <p class="category">${p.categoryName || 'Категория'}</p>
                                <p class="minidesc">${p.minidesc || 'Краткое описание'}</p>
                            </div>
                            <div class="rating-area">
                                <input type="radio" id="star-5-${p._id}" name="rating-${p._id}" value="5">
                                <label for="star-5-${p._id}" title="Оценка «5»"></label>
                                <input type="radio" id="star-4-${p._id}" name="rating-${p._id}" value="4">
                                <label for="star-4-${p._id}" title="Оценка «4»"></label>
                                <input type="radio" id="star-3-${p._id}" name="rating-${p._id}" value="3">
                                <label for="star-3-${p._id}" title="Оценка «3»"></label>
                                <input type="radio" id="star-2-${p._id}" name="rating-${p._id}" value="2">
                                <label for="star-2-${p._id}" title="Оценка «2»"></label>
                                <input type="radio" id="star-1-${p._id}" name="rating-${p._id}" value="1">
                                <label for="star-1-${p._id}" title="Оценка «1»"></label>
                            </div>
                            <p class="price">Цена: от ${p.price} ₽/сутки</p>
                        </div>
                        <div class="hit-actions">
                            <button id="add-cart-${p._id}" class="button-search text-p card" onclick="addToCart('${p._id}')">Добавить в корзину</button>
                        </div>
                    </a>
                </li>
            `).join('');
            productCount.textContent = products.length;
        }
    } else {
        console.error('Элементы productList или productCount не найдены');
    }
}

// Функция добавления в корзину (заглушка)
function addToCart(productId) {
    alert(`Товар ${productId} добавлен в корзину!`);
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена, инициализация каталога...');
    loadCategoriesForFilters();
    loadProducts();
});