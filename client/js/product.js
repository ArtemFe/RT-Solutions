async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) {
        document.getElementById('product-container').innerHTML = '<p>Товар не найден</p>';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/products`);
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        const products = await response.json();
        const product = products.find(p => p._id === productId);
        if (!product) {
            document.getElementById('product-container').innerHTML = '<p>Товар не найден</p>';
            return;
        }

        // Для примера: product.images = [url1, url2, url3, url4]
        // Если у вас только одно поле image, используйте массив с одним элементом
        const images = [product.image, ...(product.extraImages || [])];
        // Удаляем дубли (например, если image и extraImages совпадают)
        const uniqueImages = images.filter((img, idx, arr) => arr.indexOf(img) === idx);

        document.getElementById('product-container').innerHTML = `
        <div class="product-page">
            <div class="product-page__left">
                <div class="product-slider">
                    <button class="slider-arrow slider-arrow--prev"><img src="../images/arrow-left.svg"></button>
                    <img src="${uniqueImages[0]}" alt="${product.name}" class="slider-main-img" id="mainProductImg">
                    <button class="slider-arrow slider-arrow--next"><img src="../images/arrow-right.svg"></button>
                </div>
                <ul class="slider-thumbs">
                    ${uniqueImages.map((img, i) => `
                        <li><img src="${img}" class="slider-thumb${i === 0 ? ' active' : ''}" data-index="${i}"></li>
                    `).join('')}
                </ul>
            </div>
            <div class="product-page__right">
                <h1 class="product-title">${product.name}</h1>
                <p class="category">${product.categoryName || (product.category && product.category.name) || ''}</p>
                <div class="product-price-block">
                    <div class="product-price-label">Цена за сутки</div>
                    <div class="product-price">${product.price} руб</div>
                </div>
                <div class="product-date-block">
                    <span class="date-label">Выберите даты</span>
                    <div class="date-picker">
                        <input type="date" id="date-from" class="date-input">
                        <span class="date-dash">—</span>
                        <input type="date" id="date-to" class="date-input">
                    </div>
                </div>
                <div class="product-qty-block">
                    <span>Количество</span>
                    <button class="qty-btn" id="qty-minus">-</button>
                    <span id="qty-value">1</span>
                    <button class="qty-btn" id="qty-plus">+</button>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn">Добавить в корзину</button>
                    <button class="add-to-fav-btn">Добавить в избранное</button>
                </div>
            </div>
        </div>
        <div class="product-desc-block">
            <button class="desc-btn desc-btn--active">Описание товара</button>
            <div class="desc-content">
                <p>${product.desc || 'Описание отсутствует.'}</p>
            </div>
        </div>
        `;

        // JS для слайдера
        const mainImg = document.getElementById('mainProductImg');
        const thumbs = document.querySelectorAll('.slider-thumb');
        let currentIndex = 0;

        function showImage(idx) {
            mainImg.src = uniqueImages[idx];
            thumbs.forEach(t => t.classList.remove('active'));
            thumbs[idx].classList.add('active');
            currentIndex = idx;
        }

        thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', () => showImage(i));
        });

        document.querySelector('.slider-arrow--prev').onclick = () => {
            showImage((currentIndex - 1 + uniqueImages.length) % uniqueImages.length);
        };
        document.querySelector('.slider-arrow--next').onclick = () => {
            showImage((currentIndex + 1) % uniqueImages.length);
        };

        // Количество
        let qty = 1;
        document.getElementById('qty-minus').onclick = () => {
            if (qty > 1) document.getElementById('qty-value').textContent = --qty;
        };
        document.getElementById('qty-plus').onclick = () => {
            document.getElementById('qty-value').textContent = ++qty;
        };

        document.querySelector('.add-to-cart-btn').addEventListener('click', async () => {
            const productId = product._id;
            const quantity = parseInt(document.getElementById('qty-value').textContent, 10);
            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Войдите для добавления в корзину!');
                return;
            }
            const res = await fetch(`${apiUrl}/cart`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity, dateFrom, dateTo })
            });
            if (res.ok) {
                alert('Товар добавлен в корзину!');
                updateCartBadge();
            } else {
                alert('Ошибка при добавлении в корзину');
            }
        });

    } catch (e) {
        document.getElementById('product-container').innerHTML = '<p>Ошибка загрузки товара</p>';
        console.error(e);
    }
}

window.addEventListener('DOMContentLoaded', loadProduct);
