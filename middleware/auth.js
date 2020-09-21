const jwt = require('jsonwebtoken');
const config = require('config');
const {
    response
} = require('express');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({
            message: "No token, authorization denied"
        });
    }

    try {
        const decode = jwt.decode(token, config.get('jwtSecret'));

        req.user = decode.user;
        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Token is not valid'
        });
    }
}