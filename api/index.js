require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRouter = require("./authRouter");
const path = require("path");
const PORT = process.env.PORT || 5000;
const cartRouter = require('./cartRouter');
const favoriteRouter = require('./routers/favoriteRouter');
const orderRouter = require('./orderRouter');
const profileRouter = require('./profileRouter');

// Проверка наличия необходимых переменных окружения
if (!process.env.DB_URL) {
    console.error('DB_URL is not defined in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://rt-solutions.onrender.com/',
    credentials: true
}));
app.use(express.json());

// MongoDB connection
const start = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('DB_URL:', process.env.DB_URL); // для отладки
        
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // Session configuration
        app.use(session({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                ttl: 24 * 60 * 60 // 1 день
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

        // Добавляем логирование запросов
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        app.use('/', authRouter);
        app.use('/cart', cartRouter);
        app.use('/favorites', favoriteRouter);
        app.use('/api/orders', orderRouter);
        app.use('/api/profile', profileRouter);

        // Обработка 404
        app.use((req, res, next) => {
            res.status(404).json({ message: 'Маршрут не найден' });
        });

        // Обработка ошибок
        app.use((err, req, res, next) => {
            if (process.env.NODE_ENV === 'production') {
                res.status(err.status || 500).json({ message: 'Что-то пошло не так!' });
            } else {
                res.status(err.status || 500).json({ 
                    message: err.message || 'Что-то пошло не так!',
                    error: err
                });
            }
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

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

start();