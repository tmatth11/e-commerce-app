const dbClient = require('../db');

class UserAccountsRepository {
    constructor() {}

    // Insert a new user account
    async insert(username, password, role) {
        const balance = role === 'buyer' ? 1000.00 : null;
        const sql = `INSERT INTO users (username, password, role, balance) VALUES ($1, $2, $3, $4) RETURNING id`;
        const values = [username, password, role, balance];
        const result = await dbClient.query(sql, values);
        return result.rows[0];
    }

    // Select a user account by username
    async select(username) {
        const sql = `SELECT id, username, password, role FROM users WHERE username = $1`;
        const values = [username];
        const result = await dbClient.query(sql, values);
        return result.rows[0];
    }

    // Select a user account by ID
    async selectById(id) {
        const sql = `SELECT id, username, password, role FROM users WHERE id = $1`;
        const values = [id];
        const result = await dbClient.query(sql, values);
        return result.rows[0];
    }

    // Get the user's account by ID
    async getUserById(userId) {
        const query = `SELECT * FROM users WHERE id = $1;`;
        const values = [userId];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    // Update the user's balance
    async updateUserBalance(userId, newBalance) {
        const query = `UPDATE users SET balance = $1 WHERE id = $2 RETURNING *;`;
        const values = [newBalance, userId];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }
}

module.exports = UserAccountsRepository;