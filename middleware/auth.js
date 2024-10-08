const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const splitToken = token.split(' ');

        if (splitToken[0] !== 'Bearer' || splitToken.length !== 2) {
            return res.status(401).json({ msg: 'Token format is not valid' });
        }

        const decoded = jwt.verify(splitToken[1], process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
