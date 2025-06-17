const User = require('../models/User');
const Order = require('../models/Order');

// Создание нового заказа
exports.createOrder = async (req, res) => {
    try {
        const { name, phone, email, address, comment } = req.body;
        console.log('createOrder: received body =', req.body);

        const user = await User.findById(req.user.id).populate('cart.product');
        
        if (!user) {
            console.error('createOrder: User not found for ID:', req.user.id);
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        console.log('createOrder: User cart =', user.cart);

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        // Создаем заказ
        const order = new Order({
            user: req.user.id,
            items: user.cart.map(item => {
                console.log('createOrder: processing cart item =', item);
                if (!item.product) {
                    console.error('createOrder: Cart item missing product data', item);
                    throw new Error('Некоторые товары в корзине отсутствуют или некорректны.');
                }
                return {
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price,
                    dateFrom: item.dateFrom,
                    dateTo: item.dateTo
                };
            }),
            totalAmount: user.cart.reduce((total, item) => {
                if (!item.product) {
                    console.error('createOrder: Reduce item missing product data', item);
                    throw new Error('Некоторые товары в корзине отсутствуют или некорректны.');
                }
                const days = (new Date(item.dateTo) - new Date(item.dateFrom)) / (1000*60*60*24) || 1;
                return total + (item.product.price * item.quantity * days);
            }, 0),
            customerInfo: {
                name,
                phone,
                email,
                address
            },
            comment,
            status: 'pending'
        });

        await order.save();

        // Очищаем корзину пользователя
        user.cart = [];
        await user.save();

        res.status(201).json({ 
            message: 'Заказ успешно создан',
            orderId: order._id
        });
    } catch (error) {
        console.error('Fatal Error in createOrder:', error); // Более специфичный лог
        res.status(500).json({ message: 'Ошибка при создании заказа' });
    }
};

// Получение списка заказов пользователя
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({ message: 'Ошибка при получении заказов' });
    }
};

// Получение списка активных заказов пользователя (которые сейчас в процессе аренды)
exports.getUserActiveOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        console.log('getUserActiveOrders: currentDate =', currentDate);

        const activeOrders = await Order.find({
            user: userId,
            'items.dateFrom': { $lte: currentDate }, // Дата начала <= текущей даты
            'items.dateTo': { $gte: currentDate },   // Дата окончания >= текущей даты
            status: { $in: ['pending', 'completed', 'active'] } // Учитываем статусы, которые могут быть активными
        })
        .populate({
            path: 'items.product',
            populate: { path: 'category', select: 'name' }
        })
        .sort({ createdAt: -1 }); // Сортировка по новым заказам сверху

        res.json(activeOrders);
    } catch (error) {
        console.error('Error getting user active orders:', error);
        res.status(500).json({ message: 'Ошибка при получении активных заказов' });
    }
};