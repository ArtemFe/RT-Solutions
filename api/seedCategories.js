// seedProducts.js
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

async function seedProducts() {
    try {
        await mongoose.connect('mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Подключение к MongoDB успешно');

        const categories = await Category.find();
        if (categories.length === 0) {
            console.error('Категории не найдены. Сначала запустите seedCategories.js');
            return;
        }

        const categoryMap = categories.reduce((map, cat) => {
            map[cat.name] = cat._id;
            return map;
        }, {});

        const products = [
            { name: 'Проектор', minidesc: 'Компактный проектор', desc: 'Для дома', price: 210, category: categoryMap['Видеоконференц-оборудование'], is_rental: false, is_active: true },
            { name: 'Дрель', minidesc: 'Мощная дрель', desc: 'Строительная техника', price: 860, category: categoryMap['Строительная техника'], is_rental: false, is_active: true },
            { name: 'Ручной пылесос', minidesc: 'Лёгкий пылесос', desc: 'Для дома', price: 320, category: categoryMap['Для дома'], is_rental: false, is_active: true },
            { name: 'Видеокамера Sony PXW-Z150', minidesc: 'Профессиональная камера', desc: 'Для видеоконференций', price: 3000, category: categoryMap['Видеоконференц-оборудование'], is_rental: false, is_active: true },
            { name: 'Микрофон', minidesc: 'Чувствительный микрофон', desc: 'Для мероприятий', price: 210, category: categoryMap['Техника для мероприятий'], is_rental: false, is_active: true },
            { name: 'Диджей пульт', minidesc: 'Пульт для диджеев', desc: 'Для мероприятий', price: 1024, category: categoryMap['Техника для мероприятий'], is_rental: false, is_active: true }
        ];

        await Product.deleteMany({});
        console.log('Существующие товары удалены');

        await Product.insertMany(products);
        console.log('Товары успешно добавлены:', products);

        mongoose.connection.close();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

seedProducts();