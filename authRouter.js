const { Router } = require('express');
const router = Router();
const controller = require('./authController');
const { check } = require('express-validator');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

router.post('/reg', [
    check('username', "Имя пользователя не должно быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 8 символов").isLength({ min: 8, max: 54 })
], controller.reg);

router.post('/log', controller.log);
router.get('/users', authMiddleware, roleMiddleware(['Admin']), controller.getUsers);

module.exports = router;