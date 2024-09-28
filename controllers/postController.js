const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Створення поста
exports.createPost = async (req, res) => {
    const { title, description, imageUrl } = req.body;

    try {
        const post = await Post.create({
            title,
            description,
            imageUrl,
            userId: req.user.id // Беремо ідентифікатор користувача з JWT
        });

        res.status(201).json({ post });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Отримання всіх постів
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'author',  // Включаємо інформацію про автора поста
                    attributes: ['id', 'fullName', 'email'] // Вибираємо тільки необхідні поля
                },
                {
                    model: Comment,  // Включаємо коментарі
                    as: 'comments',
                    include: [
                        {
                            model: User,  // Включаємо автора коментаря
                            as: 'author',
                            attributes: ['id', 'fullName', 'email'] // Вибираємо необхідні поля для автора коментаря
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ posts });
    } catch (error) {
        console.error('Error fetching posts:', error);  // Додаємо логування помилок
        res.status(500).json({ error: 'Server error' });
    }
};

// Оновлення поста
exports.updatePost = async (req, res) => {
    const { title, description, imageUrl } = req.body;

    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        post.title = title;
        post.description = description;
        post.imageUrl = imageUrl;

        await post.save();

        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Видалення поста
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await post.destroy();

        res.json({ msg: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
