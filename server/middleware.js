const jwt = require('jsonwebtoken');

// Log requests to the console
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// Authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Check if the user is a seller
const checkSellerRole = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.sendStatus(403);
    }
    next();
};

// Check if the user is a buyer
const checkBuyerRole = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.sendStatus(403);
    }
    next();
};

module.exports = { logger, authenticateToken, checkSellerRole, checkBuyerRole };