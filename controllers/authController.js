const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const generateAccessToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.validateRegistration = [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Please include a valid phone number').isMobilePhone(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),

    check('email').custom(async (email) => {
        const user = await User.findOne({ where: { email } });
        if (user) {
            throw new Error('Email already in use');
        }
    }),

    check('phone').custom(async (phone) => {
        const user = await User.findOne({ where: { phone } });
        if (user) {
            throw new Error('Phone number already in use');
        }
    }),
];

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: { message: errors.array()[0].msg } });
    }

    const { fullName, email, phone, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ errors: { message: 'Invalid credentials' } });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: { message: 'Invalid credentials' } });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.create({ token: refreshToken, userId: user.id });

        res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};



exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ errors: { message: 'No token provided' } });
    }

    try {
        const storedToken = await Token.findOne({ where: { token } });
        if (!storedToken) {
            return res.status(403).json({ errors: { message: 'Invalid refresh token' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken(decoded.user);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ errors: { message: 'Invalid refresh token' } });
    }
};

exports.logout = async (req, res) => {
    const { token } = req.body;

    try {
        const deletedToken = await Token.destroy({ where: { token } });

        if (deletedToken === 0) {
            return res.status(400).json({ errors: { message: 'Invalid token' } });
        }

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ errors: { message: 'Server error' } });
    }
};