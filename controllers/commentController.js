const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// Створення коментаря
exports.createComment = async (req, res) => {
    const { content } = req.body;
    const { postId } = req.params;

    try {
        // Перевіряємо чи існує пост
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Створюємо коментар
        const comment = await Comment.create({
            content,
            postId: post.id,
            userId: req.user.id, // Беремо ID користувача з токену
        });

        res.status(201).json({ comment });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Отримання всіх коментарів до поста
exports.getComments = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findByPk(postId, {
            include: [{ model: Comment, as: 'comments' }],
        });

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(200).json({ comments: post.comments });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Видалення коментаря
exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await comment.destroy();

        res.status(200).json({ msg: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};