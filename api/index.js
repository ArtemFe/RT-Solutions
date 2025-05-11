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

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-url.onrender.com' 
        : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// MongoDB connection
const start = async () => {
    try {
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

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

start();