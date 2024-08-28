// Logout the user by clearing the cookies
const logoutUser = (request, response) => {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return response.status(200).json({ message: "Successfully logged out!" });
};

module.exports = logoutUser;