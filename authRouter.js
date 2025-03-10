const express = require('express')
const router = express.Router()
const controller = require('./authController')
const {check} = require("express-validator")
const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')
const path = require('path');

router.use(express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

router.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

router.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'catalog.html'));
});

router.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'product.html'));
});

router.post('/reg', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 8 символов").isLength({min:8})
], controller.reg)
router.post('/login', controller.login)
router.get('/users', roleMiddleware(["Admin"]), controller.getUsers)

module.exports = router