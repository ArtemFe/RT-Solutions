const mongoose = require('mongoose');
const Category = require('./models/Category');

const categories = [
    { name: 'Строительная техника'},
    { name: 'Техника для мероприятий'},
    { name: 'Для дома'},
    { name: 'Видеоконференц- оборудование'}
];

async function seedCategories() {
    try {
        await mongoose.connect('mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Подключение к MongoDB успешно');

        // Очищаем существующие категории (опционально)
        await Category.deleteMany({});
        console.log('Существующие категории удалены');

        // Добавляем новые категории
        await Category.insertMany(categories);
        console.log('Категории успешно добавлены:', categories);

        mongoose.connection.close();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

seedCategories();