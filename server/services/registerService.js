const UserAccountsRepository = require('../repositories/userAccountsRepository');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./authService');
const saltRounds = 10;

// Register a new user account
const registerLoginCredentials = async (request, response) => {
    try {
        const { username, password, role } = request.body;

        // Check if the role is not empty
        if (role !== 'seller' && role !== 'buyer') {
            return response.status(400).json({ error: 'Invalid role. Only "seller" or "buyer" roles are allowed.' });
        }

        const userAccountsRepository = new UserAccountsRepository();
        const existingUserAccount = await userAccountsRepository.select(username);

        // Check if the user does not exist
        if (!existingUserAccount) {
            // Hash the password and create a new user account
            const salt = await bcrypt.genSalt(saltRounds);
            const passwordHash = await bcrypt.hash(password, salt);
            const newUserAccount = await userAccountsRepository.insert(username, passwordHash, role);
            const id = newUserAccount.id;

            const user = { id, username, role };
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Set the access token and refresh token as cookies
            response.cookie('accessToken', accessToken, { secure: true });
            response.cookie('refreshToken', refreshToken, { secure: true });

            // Return a success message
            return response.status(201).json({ id, message: "Congrats on creating an account!" });
        } else {
            const error = `${username} already has an account`;
            return response.status(409).json({ error });
        }
    } catch (err) {
        console.error(err);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = registerLoginCredentials;