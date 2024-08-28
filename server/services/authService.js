const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Generate an access token for the user
const generateAccessToken = (user) => {
    const { exp, ...userWithoutExp } = user;
    return jwt.sign({
        ...userWithoutExp,
        timestamp: Date.now() 
    }, accessTokenSecret, { expiresIn: '15m' });
};

// Generate a refresh token for the user
const generateRefreshToken = (user) => {
    const { exp, ...userWithoutExp } = user;
    return jwt.sign(userWithoutExp, refreshTokenSecret, { expiresIn: '7d' });
};

// Verify the refresh token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, refreshTokenSecret);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};