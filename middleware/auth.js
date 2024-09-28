const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Забираємо заголовок Authorization
    const token = req.header('Authorization');

    // Перевіряємо, чи є токен
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Розділяємо заголовок "Bearer [токен]"
        const splitToken = token.split(' ');

        // Перевіряємо, чи правильно сформовано заголовок
        if (splitToken[0] !== 'Bearer' || splitToken.length !== 2) {
            return res.status(401).json({ msg: 'Token format is not valid' });
        }

        // Верифікуємо токен
        const decoded = jwt.verify(splitToken[1], process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
