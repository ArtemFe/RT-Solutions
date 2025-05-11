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