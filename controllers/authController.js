const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Реєстрація
exports.register = async (req, res) => {
    const { fullName, email, phone, password } = req.body;

    try {
        // Перевіряємо, чи існує користувач
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Створюємо нового користувача
        user = await User.create({ fullName, email, phone, password });

        res.status(201).json({ msg: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Логін
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Шукаємо користувача за email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Перевіряємо пароль
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Генеруємо JWT токен
        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};