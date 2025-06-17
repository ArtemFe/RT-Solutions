const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { secret } = require("./config");

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
    async reg(req, res) {
        try {
            console.log('Получен запрос на регистрацию:', {
                body: req.body,
                headers: req.headers,
                validationErrors: validationResult(req).array()
            });

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => err.msg);
                console.log('Ошибки валидации:', errorMessages);
                return res.status(400).json({ 
                    message: "Ошибка при регистрации", 
                    errors: errorMessages 
                });
            }
            const { email, username, password, firstName, lastName, middleName, address } = req.body;

            // Проверяем существование пользователя с таким email или username
            const existingUser = await User.findOne({
                $or: [
                    { email: email },
                    { username: username }
                ]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({ message: "Пользователь с такой почтой уже существует" });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
                }
            }

            // Проверяем, есть ли уже админ
            const adminRole = await Role.findOne({ value: "Admin" });
            const adminExists = await User.findOne({ roles: { $in: ["Admin"] } });

            let roles = ["User"];
            if (!adminExists) {
                roles = ["Admin"];
            }

            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({ 
                email, 
                username, 
                password: hashPassword, 
                roles,
                firstName,
                lastName,
                middleName,
                address
            });

            try {
                await user.save();
                return res.json({ message: "Пользователь успешно зарегистрирован", redirectUrl: "/login" });
            } catch (saveError) {
                if (saveError.code === 11000) {
                    return res.status(400).json({ 
                        message: "Пользователь с таким именем или email уже существует" 
                    });
                }
                throw saveError;
            }
        } catch (e) {
            console.log('Ошибка при регистрации:', e);
            res.status(400).json({ 
                message: 'Регистрация не удалась', 
                error: e.message 
            });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: `Пользователь ${username} не найден` });
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен неверный пароль` });
            }

            // Сохраняем пользователя в сессии
            req.session.user = {
                id: user._id,
                username: user.username,
                roles: user.roles,
            };

            // Сохраняем сессию
            req.session.save((err) => {
                if (err) {
                    console.error('Ошибка сохранения сессии:', err);
                    return res.status(500).json({ message: 'Ошибка сервера' });
                }

                const token = generateAccessToken(user._id, user.roles);
                return res.json({ 
                    message: "Авторизация успешна", 
                    token, 
                    redirectUrl: "/",
                    user: {
                        id: user._id,
                        username: user.username,
                        roles: user.roles
                    }
                });
            });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Авторизация не успешна', error: e.message });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new authController();