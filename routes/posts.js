const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const postController = require('../controllers/postController'); // Переконайся, що шлях правильний і контролер існує
const authMiddleware = require('../middleware/auth');

// Створення поста
router.post(
    '/',
    [
        authMiddleware,
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ],
    postController.createPost // Перевір правильність імені функції
);

// Отримання всіх постів
router.get('/', postController.getPosts);

// Оновлення поста
router.put('/:id', authMiddleware, postController.updatePost);

// Видалення поста
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
