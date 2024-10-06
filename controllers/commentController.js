const Comment = require('../models/Comment');
const { check, validationResult } = require('express-validator');

exports.getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.findAll({
            where: { postId },
            include: {
                model: User,
                as: 'author',
                attributes: ['id', 'fullName', 'email']
            }
        });

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.createComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: { message: errors.array()[0].msg } });
    }

    const { content } = req.body;
    const { postId } = req.params;

    try {
        const comment = await Comment.create({
            content,
            postId,
            userId: req.user.id
        });

        res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.updateComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: { message: errors.array()[0].msg } });
    }

    const { content } = req.body;
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ errors: { message: 'Comment not found' } });
        }

        if (comment.userId !== req.user.id) {
            return res.status(401).json({ errors: { message: 'Unauthorized' } });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ errors: { message: 'Comment not found' } });
        }

        if (comment.userId !== req.user.id) {
            return res.status(401).json({ errors: { message: 'Unauthorized' } });
        }

        await comment.destroy();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.validateCommentCreation = [
    check('content', 'Content is required').not().isEmpty()
];

exports.validateCommentUpdate = [
    check('content', 'Content cannot be empty').not().isEmpty()
];
