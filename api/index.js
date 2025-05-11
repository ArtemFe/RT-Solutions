const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require("mongoose");
const authRouter = require("./authRouter");
const path = require("path");
const PORT = process.env.PORT || 5000;
const cartRouter = require('./cartRouter');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Настройка CORS для работы с Render
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-url.onrender.com' 
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        ttl: 24 * 60 * 60, // 1 день
        autoRemove: 'native',
        touchAfter: 24 * 3600 // 1 день
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 день
    }
}));

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

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
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