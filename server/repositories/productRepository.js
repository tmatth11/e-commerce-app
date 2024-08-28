const db = require('../db');

class ProductRepository {
    // Get all products by a seller
    static async getProductsBySellerId(sellerId) {
        const result = await db.query('SELECT * FROM products WHERE seller_id = $1', [sellerId]);
        return result.rows;
    }

    // Get all products by all sellers
    static async getAllProducts() {
        const result = await db.query('SELECT * FROM products');
        return result.rows;
    }

    // Create a new product
    static async createProduct(sellerId, name, description, price, stock) {
        const result = await db.query(
            'INSERT INTO products (seller_id, name, description, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [sellerId, name, description, price, stock]
        );
        return result.rows[0];
    }

    // Get a product by its ID
    static async getProductById(productId) {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        return result.rows[0];
    }

    // Update a product's details
    static async updateProduct(productId, name, description, price, stock) {
        const result = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
            [name, description, price, stock, productId]
        );
        return result.rows[0];
    }

    // Delete a product from the products table and the cart table
    static async deleteProduct(productId) {
        await db.query('DELETE FROM cart WHERE product_id = $1', [productId]);

        await db.query('DELETE FROM products WHERE id = $1', [productId]);
    }
}

module.exports = ProductRepository;