import { showGlobalMessage } from './utils.js';

let allProducts = [];

const searchInput = document.getElementById('elastic');
const suggestionsBox = document.getElementById('search-suggestions');

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        allProducts = await response.json();
        console.log('Загруженные товары:', allProducts);
    } catch (e) {
        console.error(e);
    }
}

window.addEventListener('DOMContentLoaded', loadProducts);

// Показывать подсказки при вводе
searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    if (!query) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
    }
    // Фильтруем товары по названию
    const matches = allProducts.filter(p => p.name.toLowerCase().includes(query));
    if (matches.length === 0) {
        suggestionsBox.innerHTML = '<div class="search-suggestion-item">Ничего не найдено</div>';
    } else {
        suggestionsBox.innerHTML = matches.map(p => `
            <div class="search-suggestion-item" data-id="${p._id}">
                <strong>${p.name}</strong><br>
                <span style="font-size:12px;color:#888">${p.minidesc || ''}</span>
            </div>
        `).join('');
    }
    suggestionsBox.style.display = 'block';
});

// Переход к товару по клику
suggestionsBox.addEventListener('click', function(e) {
    const item = e.target.closest('.search-suggestion-item');
    if (item && item.dataset.id) {
        const product = allProducts.find(p => p._id === item.dataset.id);
        if (product) {
            window.location.href = `/catalog?search=${encodeURIComponent(product.name)}`;
        }
    }
});

// Скрывать подсказки при потере фокуса
searchInput.addEventListener('blur', () => {
    setTimeout(() => { suggestionsBox.style.display = 'none'; }, 200);
});
searchInput.addEventListener('focus', function() {
    if (suggestionsBox.innerHTML) suggestionsBox.style.display = 'block';
});

searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
            window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
        }
    }
});
