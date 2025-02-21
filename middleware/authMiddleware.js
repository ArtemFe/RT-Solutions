const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        return next(); // Прекращаем выполнение для предварительных запросов
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; // Получаем токен из заголовка
        if (!token) {
            return res.status(401).json({ message: "Пользователь не авторизован" });
        }

        // Проверяем токен
        const decodedData = jwt.verify(token, secret);
        req.user = decodedData; // Добавляем декодированные данные в запрос
        next(); // Передаем управление следующему middleware
    } catch (e) {
        console.error(e); // Логируем ошибку
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }
};