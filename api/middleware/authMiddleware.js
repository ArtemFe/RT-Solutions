const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('Токен отсутствует');
            return res.status(401).json({ message: "Пользователь не авторизован" });
        }
        const decodedData = jwt.verify(token, secret);
        req.user = decodedData;
        next();
    } catch (e) {
        console.log('Ошибка проверки токена:', e);
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }
};