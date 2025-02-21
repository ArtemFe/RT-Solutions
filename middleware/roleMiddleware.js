const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const token = req.headers.authorization.split(' ')[1]; // Получаем токен из заголовка
            if (!token) {
                return res.status(401).json({ message: "Пользователь не авторизован" });
            }

            // Проверяем токен
            const decoded = jwt.verify(token, secret);
            req.user = decoded; // Добавляем декодированные данные в запрос

            // Проверяем, есть ли у пользователя нужная роль
            if (!roles.includes(decoded.roles)) {
                return res.status(403).json({ message: "Нет доступа" });
            }

            next(); // Передаем управление следующему middleware
        } catch (e) {
            console.error(e);
            return res.status(401).json({ message: "Пользователь не авторизован" });
        }
    };
};