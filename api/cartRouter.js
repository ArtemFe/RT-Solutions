const express = require('express');
const router = express.Router();
const cartController = require('./controllers/cartController');
const authMiddleware = require('./middleware/authMiddleware');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить корзину пользователя
router.get('/', cartController.getCart);

// Добавить товар в корзину
router.post('/', cartController.addToCart);

// Изменить количество товара в корзине
router.patch('/:productId', cartController.updateCartQuantity);

// Удалить товар из корзины
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
