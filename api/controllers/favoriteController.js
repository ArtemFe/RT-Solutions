const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Получить все избранные товары пользователя
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate({
                path: 'product',
                select: 'name price image category minidesc',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        // Преобразуем данные для фронтенда
        const formattedFavorites = favorites.map(fav => ({
            _id: fav.product._id,
            name: fav.product.name,
            price: fav.product.price,
            image: fav.product.image,
            categoryName: fav.product.category?.name || '',
            minidesc: fav.product.minidesc || ''
        }));

        res.json(formattedFavorites);
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ message: 'Ошибка при получении избранных товаров' });
    }
};

// Добавить товар в избранное
exports.addToFavorites = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log('addToFavorites: req.user.id =', req.user ? req.user.id : 'undefined');
        console.log('addToFavorites: productId =', productId);

        // Проверяем валидность productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid productId:', productId);
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }

        // Проверяем валидность user ID из токена
        if (!req.user || !req.user.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
            console.error('Invalid user ID from token:', req.user ? req.user.id : 'undefined');
            return res.status(401).json({ message: 'Пользователь не авторизован или ID пользователя некорректен' });
        }

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found for productId:', productId);
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Проверяем, не добавлен ли уже товар в избранное
        const existingFavorite = await Favorite.findOne({
            user: req.user.id,
            product: productId
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'Товар уже в избранном' });
        }

        // Создаем новую запись в избранном
        const favorite = new Favorite({
            user: req.user.id,
            product: productId
        });

        await favorite.save();
        res.status(201).json({ message: 'Товар добавлен в избранное' });
    } catch (error) {
        console.error('Fatal Error in addToFavorites:', error); // Более специфичный лог
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Товар уже в избранном' });
        }
        res.status(500).json({ message: 'Ошибка при добавлении в избранное' });
    }
};

// Удалить товар из избранного
exports.removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.params;

        // Проверяем валидность ID товара
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }
        
        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Удаляем из избранного
        const result = await Favorite.findOneAndDelete({
            user: req.user.id,
            product: productId
        });

        if (!result) {
            return res.status(404).json({ message: 'Товар не найден в избранном' });
        }

        res.json({ 
            message: 'Товар удален из избранного',
            productId: productId
        });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }
        res.status(500).json({ message: 'Ошибка при удалении из избранного' });
    }
}; 