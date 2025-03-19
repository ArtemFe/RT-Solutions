const express = require('express')
const router = express.Router()
const controller = require('./authController')
const {check} = require("express-validator")
const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')
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
    check('password', "Пароль должен быть больше 8 символов").isLength({min:8})
], controller.reg)
router.post('/api/login', controller.login)
router.get('/api/users', roleMiddleware(["Admin"]), controller.getUsers)

module.exports = router