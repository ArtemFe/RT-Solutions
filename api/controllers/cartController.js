const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Получить корзину пользователя
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'cart.product',
            populate: { path: 'category', select: 'name' }
        });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        // Форматируем для фронта
        const cart = user.cart.map(item => ({
            product: {
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                categoryName: item.product.category?.name || '',
                minidesc: item.product.minidesc || ''
            },
            quantity: item.quantity,
            dateFrom: item.dateFrom,
            dateTo: item.dateTo
        }));
        res.json(cart);
    } catch (error) {
        console.error('Ошибка при получении корзины:', error);
        res.status(500).json({ message: 'Ошибка при получении корзины' });
    }
};

// Добавить товар в корзину
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, dateFrom, dateTo } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        const existing = user.cart.find(item => item.product.equals(productId));
        if (existing) {
            existing.quantity += quantity;
            existing.dateFrom = dateFrom;
            existing.dateTo = dateTo;
        } else {
            user.cart.push({ product: productId, quantity, dateFrom, dateTo });
        }
        await user.save();
        res.json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        res.status(500).json({ message: 'Ошибка при добавлении в корзину' });
    }
};

// Изменить количество товара в корзине
exports.updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Некорректное количество' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        const item = user.cart.find(i => i.product.equals(productId));
        if (!item) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }
        item.quantity = quantity;
        await user.save();
        res.json({ message: 'Количество обновлено' });
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        res.status(500).json({ message: 'Ошибка при обновлении количества' });
    }
};

// Удалить товар из корзины
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Некорректный ID товара' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => !item.product.equals(productId));
        if (user.cart.length === initialLength) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }
        await user.save();
        res.json({ message: 'Товар удален из корзины' });
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
        res.status(500).json({ message: 'Ошибка при удалении из корзины' });
    }
}; 