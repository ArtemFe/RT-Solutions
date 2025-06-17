const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Category = require('./models/Category');
const Product = require('./models/Product');
const controller = require('./authController');
const { check } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const path = require('path');
const User = require('./models/User');
const cartRouter = require('./cartRouter');

const staticUrl = '../client';

// --- Multer для загрузки изображений ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- Публичные маршруты получения данных ---

// Получить все категории (публично)
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при загрузке категорий' });
    }
});

// Получить все товары (публично)
router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name');
        const productsWithCategoryName = products.map(product => ({
            ...product._doc,
            categoryName: product.category ? product.category.name : 'Без категории'
        }));
        res.json(productsWithCategoryName);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при загрузке товаров' });
    }
});

// --- Защищённые маршруты ---

// Добавить товар (только для админа)
router.post(
    '/api/products',
    authMiddleware,
    roleMiddleware(['Admin']),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'extraImages', maxCount: 9 }
    ]),
    async (req, res) => {
        try {
            const { name, minidesc, desc, price, category, is_rental } = req.body;
            // Получаем массив файлов
            const image = req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
            const extraImages = req.files['extraImages'] ? req.files['extraImages'].map(f => `/uploads/${f.filename}`) : [];

            if (!name || !minidesc || !desc || !price || !category) {
                return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
            }

            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: 'Невалидный ID категории' });
            }

            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Категория с таким ID не найдена' });
            }

            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice)) {
                return res.status(400).json({ message: 'Цена должна быть числом' });
            }

            const product = new Product({
                name,
                minidesc,
                desc,
                price: parsedPrice,
                category,
                image, // массив путей к изображениям
                extraImages, // массив путей к дополнительным изображениям
                is_rental: is_rental === 'true' || false,
                is_active: true
            });

            await product.save();

            await Category.updateOne(
                { _id: category },
                { $push: { product_id: product._id } }
            );

            res.status(201).json({ message: 'Товар успешно добавлен', product });
        } catch (e) {
            console.error('Ошибка при добавлении товара:', e);
            res.status(500).json({ message: 'Ошибка сервера при добавлении товара', error: e.message });
        }
    }
);

// Редактировать товар (только для админа)
router.put(
    '/api/products/:id',
    authMiddleware,
    roleMiddleware(['Admin']),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'extraImages', maxCount: 9 }
    ]),
    async (req, res) => {
        try {
            const { name, minidesc, desc, price, category, is_rental } = req.body;
            const update = { name, minidesc, desc, price, category, is_rental };

            // Обработка изображений
            if (req.files['image']) {
                update.image = `/uploads/${req.files['image'][0].filename}`;
            }
            if (req.files['extraImages']) {
                update.extraImages = req.files['extraImages'].map(f => `/uploads/${f.filename}`);
            }

            const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
            if (!product) return res.status(404).json({ message: 'Товар не найден' });

            res.json({ message: 'Товар обновлён', product });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Ошибка при обновлении товара' });
        }
    }
);

// Удалить товар (только для админа)
router.delete(
    '/api/products/:id',
    authMiddleware,
    roleMiddleware(['Admin']),
    async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) return res.status(404).json({ message: 'Товар не найден' });
            res.json({ message: 'Товар удалён' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Ошибка при удалении товара' });
        }
    }
);

// --- Авторизация и регистрация пользователей ---
router.post(
    '/api/reg',
    express.json(),
    [
        check('username', "Имя пользователя не может быть пустым").notEmpty(),
        check('email', "Некорректный email").isEmail(),
        check('password', "Пароль должен быть больше 8 символов").isLength({ min: 8 }),
        check('firstName', "Имя не может быть пустым").notEmpty(),
        check('lastName', "Фамилия не может быть пустой").notEmpty()
    ],
    controller.reg
);

router.post('/api/login', express.json(), controller.login);

// --- Получить всех пользователей (только для админа) ---
router.get('/api/users', express.json(), roleMiddleware(["Admin"]), controller.getUsers);

// --- Статические файлы и страницы ---
router.use('/uploads', express.static('uploads'));
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
router.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'cart.html'));
});
router.get('/fav', (req, res) => {
    res.sendFile(path.join(__dirname, staticUrl, 'html', 'favorite.html'));
});

// --- Выход пользователя ---
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).json({ message: 'Ошибка при выходе' });
        }
        res.clearCookie('connect.sid'); // Очищаем cookie сессии
        res.redirect('/');
    });
});

router.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});

// Получить корзину текущего пользователя
router.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('cart.product');
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json(user.cart || []);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка при получении корзины' });
    }
});

router.use('/', cartRouter);

module.exports = router;