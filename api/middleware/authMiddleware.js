const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        // Проверяем JWT-токен (если он есть)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1]; // Извлекаем токен
            if (token) {
                const decodedData = jwt.verify(token, secret); // Проверяем токен
                req.user = decodedData; // Добавляем данные пользователя в запрос
                return next(); // Передаем управление следующему middleware
            }
        }

        // Если JWT-токена нет, проверяем сессию
        if (req.session.user) {
            req.user = req.session.user; // Добавляем данные пользователя из сессии
            return next(); // Передаем управление следующему middleware
        }

        // Если ни JWT, ни сессия не найдены
        return res.status(403).json({ message: "Пользователь не авторизован" });
    } catch (e) {
        console.log(e);
        return res.status(403).json({ message: "Пользователь не авторизован" });
    }
};