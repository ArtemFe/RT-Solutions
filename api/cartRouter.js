const express = require('express');
const router = express.Router();
const User = require('./models/User');
const Product = require('./models/Product');
const authMiddleware = require('./middleware/authMiddleware');

// Получить корзину пользователя
router.get('/api/cart', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');
  res.json(user.cart);
});

// Добавить товар в корзину
router.post('/api/cart', authMiddleware, async (req, res) => {
  const { productId, quantity, dateFrom, dateTo } = req.body;
  const user = await User.findById(req.user.id);
  const existing = user.cart.find(item => item.product.equals(productId));
  if (existing) {
    existing.quantity += quantity;
    existing.dateFrom = dateFrom;
    existing.dateTo = dateTo;
  } else {
    user.cart.push({ product: productId, quantity, dateFrom, dateTo });
  }
  await user.save();
  res.json(user.cart);
});

// Удалить товар из корзины
router.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter(item => !item.product.equals(req.params.productId));
  await user.save();
  res.json(user.cart);
});

// Получить избранное
router.get('/api/favorites', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  res.json(user.favorites);
});

// Добавить в избранное
router.post('/api/favorites', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);
  if (!user.favorites.includes(productId)) {
    user.favorites.push(productId);
    await user.save();
  }
  res.json(user.favorites);
});

// Удалить из избранного
router.delete('/api/favorites/:productId', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.favorites = user.favorites.filter(id => id.toString() !== req.params.productId);
  await user.save();
  res.json(user.favorites);
});

module.exports = router;
