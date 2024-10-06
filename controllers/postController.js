const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.createPost = async (req, res) => {
    const { title, description, imageUrl } = req.body;

    try {
        const post = await Post.create({
            title,
            description,
            imageUrl,
            userId: req.user.id
        });

        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Post.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'fullName', 'email']
                        }
                    ]
                }
            ],
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            totalPosts: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            posts: rows
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};


exports.updatePost = async (req, res) => {
    const { title, description, imageUrl } = req.body;

    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ errors: { message: 'Post not found' } });
        }

        if (post.userId !== req.user.id) {
            return res.status(401).json({ errors: { message: 'Unauthorized' } });
        }

        post.title = title;
        post.description = description;
        post.imageUrl = imageUrl;

        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ errors: { message: 'Post not found' } });
        }

        if (post.userId !== req.user.id) {
            return res.status(401).json({ errors: { message: 'Unauthorized' } });
        }

        await post.destroy();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};