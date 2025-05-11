const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const mongoose = require("mongoose");
const authRouter = require("./authRouter");
const path = require("path");
const PORT = process.env.PORT || 5000;
const cartRouter = require('./cartRouter');

const app = express();

// Добавляем настройки CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const store = new MongoStore({
    uri: `mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`,
    collection: 'sessions',
});

// Настройка сессии
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 часа
            secure: false, // для разработки false, для продакшена true
            httpOnly: true,
            sameSite: 'lax'
        },
    })
);

// Добавляем middleware для проверки сессии
app.use((req, res, next) => {
    console.log('Session:', req.session); // для отладки
    next();
});

app.use(express.static(path.join(__dirname, "../client")));

app.use('/', authRouter);
app.use('/', cartRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

const start = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`
        );
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();