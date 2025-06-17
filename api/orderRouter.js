const express = require('express');
const router = express.Router();
const orderController = require('./controllers/orderController');
const authMiddleware = require('./middleware/authMiddleware');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Создать новый заказ
router.post('/', orderController.createOrder);

// Получить список заказов пользователя
router.get('/', orderController.getUserOrders);

// Получить список активных заказов пользователя
router.get('/active', orderController.getUserActiveOrders);

module.exports = router; 