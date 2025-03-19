const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const mongoose = require("mongoose");
const authRouter = require("./authRouter");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();
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
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use(express.static(path.join(__dirname, "../client")));

app.use('/', authRouter);

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