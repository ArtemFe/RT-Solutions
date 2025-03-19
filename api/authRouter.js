const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const router = express.Router();
const mongoose = require('mongoose'); // Добавляем mongoose
const multer = require('multer');
const Category = require('./models/Category');
const Product = require('./models/Product');
const controller = require('./authController');
const { check } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware'); 
const path = require('path');

const staticUrl = '../client';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Маршрут для создания товара (multipart/form-data, используем multer)
router.post('/api/products', authMiddleware, roleMiddleware(['Admin']), upload.single('image'), async (req, res) => {
    try {
        console.log('Тело запроса:', req.body);
        console.log('Файл:', req.file);

        const { name, minidesc, desc, price, category, is_rental } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Проверяем, что все обязательные поля присутствуют
        if (!name || !minidesc || !desc || !price || !category) {
            return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
        }

        // Проверяем, что category — валидный ObjectId
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: 'Невалидный ID категории' });
        }

        // Проверяем, существует ли категория
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Категория с таким ID не найдена' });
        }

        // Проверяем, что price — число
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
            image,
            is_rental: is_rental === 'true' || false,
            is_active: true
        });

        console.log('Создаём товар:', product);
        await product.save();
        console.log('Товар сохранён:', product);

        await Category.updateOne(
            { _id: category },
            { $push: { product_id: product._id } }
        );
        console.log('Категория обновлена');

        res.status(201).json({ message: 'Товар успешно добавлен', product });
    } catch (e) {
        console.error('Ошибка при добавлении товара:', e);
        res.status(500).json({ message: 'Ошибка сервера при добавлении товара', error: e.message });
    }
});

router.use('/uploads', express.static('uploads'));

// Маршруты, ожидающие JSON
router.get('/api/categories', express.json(), authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при загрузке категорий' });
    }
});

router.get('/api/products', express.json(), authMiddleware, async (req, res) => {
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

router.post('/api/reg', express.json(), [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 8 символов").isLength({ min: 8 })
], controller.reg);

router.post('/api/login', express.json(), controller.login);

router.get('/api/users', express.json(), roleMiddleware(["Admin"]), controller.getUsers);

// Статические маршруты
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

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).json({ message: 'Ошибка при выходе' });
        }
        res.redirect('/');
    });
});

module.exports = router;