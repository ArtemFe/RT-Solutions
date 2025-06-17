const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

// Логирование для отладки
router.use((req, res, next) => {
    console.log('Favorites Router:', req.method, req.path);
    next();
});

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Получить все избранные товары пользователя
router.get('/', favoriteController.getFavorites);

// Добавить товар в избранное
router.post('/', favoriteController.addToFavorites);

// Удалить товар из избранного
router.delete('/:productId', async (req, res, next) => {
    try {
        console.log('Attempting to remove from favorites:', req.params.productId);
        await favoriteController.removeFromFavorites(req, res);
    } catch (error) {
        console.error('Error in removeFromFavorites route:', error);
        next(error);
    }
});

module.exports = router; 