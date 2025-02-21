const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Role = require('./models/Role');
const { validationResult } = require('express-validator');
const { secret } = require('./config');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class AuthController {
    async reg(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Ошибка при регистрации", errors });
            }
            const { username, password } = req.body;
            const client = await User.findOne({ username });
            if (client) {
                return res.status(409).json({ message: "Пользователь с таким именем уже существует" });
            }

            const hashPassword = bcrypt.hashSync(password, 10);
            const userRole = await Role.findOne({ value: "User" });
            if (!userRole) {
                return res.status(500).json({ message: "Роль User не найдена" });
            }

            const user = new User({ username, password: hashPassword, roles: [userRole._id] });
            await user.save();
            return res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Registration error" });
        }
    }

    async log(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username }).populate('roles'); // Заполняем roles
            if (!user) {
                return res.status(400).json({ message: `Пользователь ${username} не найден` });
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Введён неверный пароль" });
            }

            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Login error" });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find().select('-password'); // Исключаем пароли
            res.json(users);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = new AuthController();