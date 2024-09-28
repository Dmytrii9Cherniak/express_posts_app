const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Імпортуємо маршрути
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

require('./associations');

// Ініціалізація dotenv
dotenv.config();

const app = express();

// Middleware для обробки JSON
app.use(express.json());

// Маршрути
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Старт сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Синхронізація моделей з базою даних
sequelize.sync();
