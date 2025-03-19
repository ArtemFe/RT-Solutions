const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const router = express.Router();
const Category = require('./models/Category');
const Product = require('./models/Product');
const controller = require('./authController');
const { check } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware'); 
const path = require('path');

const staticUrl = '../client';

router.use(express.static(path.join(__dirname, staticUrl)));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'index.html'));
});

router.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'login.html'));
});

router.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'catalog.html'));
});

router.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'product.html'));
});

router.get('/lk', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'lk.html'));
});

router.post('/api/reg', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 8 символов").isLength({ min: 8 })
], controller.reg);

router.post('/api/login', controller.login);

router.get('/api/users', roleMiddleware(["Admin"]), controller.getUsers);

router.get('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).json({ message: 'Ошибка при выходе' });
        }
        res.redirect('/');
    });
});

router.get('/api/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при загрузке категорий' });
    }
});

router.post('/api/products', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
    try {
        const { name, desc, price, category, is_rental } = req.body;
        const product = new Product({
            name,
            desc,
            price,
            is_rental: is_rental || false,
            is_active: true
        });
        await product.save();

        res.status(201).json({ message: 'Товар успешно добавлен', product });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Ошибка при добавлении товара', error: e.message });
    }
});

module.exports = router;