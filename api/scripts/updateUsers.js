const mongoose = require('mongoose');
require('dotenv').config();

// Подключаемся к MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Импортируем модель User
const User = require('../models/User');

async function updateUsers() {
  try {
    // Получаем всех пользователей
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    // Обновляем каждого пользователя
    for (const user of users) {
      // Если у пользователя нет полей firstName, lastName и т.д., добавляем их
      if (!user.firstName) user.firstName = '';
      if (!user.lastName) user.lastName = '';
      if (!user.middleName) user.middleName = '';
      if (!user.address) user.address = '';

      // Сохраняем обновленного пользователя
      await user.save();
      console.log(`Updated user: ${user.username}`);
    }

    console.log('All users have been updated successfully');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    // Закрываем соединение с базой данных
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Запускаем обновление
updateUsers(); 