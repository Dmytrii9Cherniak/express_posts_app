const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

// Створення коментаря
router.post(
    '/:postId',
    [
        authMiddleware,
        check('content', 'Content is required').not().isEmpty()
    ],
    commentController.createComment
);

// Отримання всіх коментарів до поста
router.get('/:postId', commentController.getComments);

// Видалення коментаря
router.delete('/:postId/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
