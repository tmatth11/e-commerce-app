const { verifyRefreshToken, generateAccessToken } = require('./authService');
const UserAccountsRepository = require('../repositories/userAccountsRepository');

const refreshToken = async (request, response) => {
    const { refreshToken, accessToken } = request.cookies;

    // Check if the refresh token is provided
    if (!refreshToken) {
        return response.status(401).json({ error: 'Refresh token not provided' });
    }

    try {
        // Verify the refresh token
        const user = verifyRefreshToken(refreshToken);
        const userAccountsRepository = new UserAccountsRepository();
        
        // Check if the user account exists
        const existingUserAccount = await userAccountsRepository.selectById(user.id);
        if (!existingUserAccount) {
            return response.status(401).json({ error: 'Invalid refresh token' });
        }

        // Generate a new access token
        const newAccessToken = generateAccessToken({
            id: existingUserAccount.id,
            username: existingUserAccount.username,
            role: existingUserAccount.role
        });

        // Check if the new access token is identical to the old access token
        if (accessToken === newAccessToken) {
            console.error("Error: New token is identical to old token");
        }

        // Store the new access token as a cookie and return a success message
        response.cookie('accessToken', newAccessToken, { secure: true });
        return response.status(200).json({ message: 'Access token refreshed' });
    } catch (err) {
        console.error(err);
        return response.status(403).json({ error: 'Invalid refresh token' });
    }
};

module.exports = refreshToken;