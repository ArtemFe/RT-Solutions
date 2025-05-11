const express = require('express');
const router = express.Router();
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');

// Получить профиль
router.get('/api/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    middleName: user.middleName || '',
    address: user.address || ''
  });
});

// Обновить профиль
router.put('/api/profile', authMiddleware, async (req, res) => {
  const { firstName, lastName, middleName, address } = req.body;
  const user = await User.findById(req.user.id);
  user.firstName = firstName;
  user.lastName = lastName;
  user.middleName = middleName;
  user.address = address;
  await user.save();
  res.json({ message: 'Профиль обновлён' });
});

module.exports = router;