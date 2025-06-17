const express = require('express');
const router = express.Router();
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');

// Получить профиль
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      middleName: user.middleName || '',
      address: user.address || ''
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
});

// Обновить профиль
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, middleName, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.middleName = middleName;
    user.address = address;
    await user.save();
    res.json({ message: 'Профиль обновлён' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;