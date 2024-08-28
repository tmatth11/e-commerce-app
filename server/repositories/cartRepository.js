const db = require('../db');
const ProductRepository = require('./productRepository');

class CartRepository {
    // Add a product to the cart
    async addToCart(userId, productId, quantity) {
        // Select the stock of the chosen product
        const productResult = await db.query('SELECT stock FROM products WHERE id = $1', [productId]);
        const product = productResult.rows[0];

        // Check if the product exists
        if (!product) {
            throw new Error('Product not found');
        }

        // Select the quantity of the chosen product in the cart
        const cartResult = await db.query('SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2', [userId, productId]);
        const cartItem = cartResult.rows[0];

        // Calculate the new quantity of the chosen product
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        const newQuantity = currentQuantity + quantity;

        // Check if the new quantity exceeds the stock
        if (newQuantity > product.stock) {
            throw new Error('Cannot add more items than available in stock');
        }

        // Insert the product into the cart
        const query = `
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET quantity = cart.quantity + $3
            RETURNING *;
        `;
        const values = [userId, productId, quantity];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Get the cart of a user and return the products in the cart
    async getCartByUserId(userId) {
        const query = `
            SELECT c.*, p.name, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1;
        `;
        const values = [userId];
        const result = await db.query(query, values);
        return result.rows;
    }

    // Clear the cart of a user
    async clearCart(userId) {
        const query = `DELETE FROM cart WHERE user_id = $1;`;
        const values = [userId];
        await db.query(query, values);
    }

    // Update the stock of a product after purchasing the cart
    async updateProductStock(productId, quantity) {
        const query = `
            UPDATE products
            SET stock = stock - $1
            WHERE id = $2
            RETURNING *;
        `;
        const values = [quantity, productId];
        const result = await db.query(query, values);
        const updatedProduct = result.rows[0];

        // Remove the product if the stock is 0 after updating the stock
        if (updatedProduct.stock === 0) {
            await ProductRepository.deleteProduct(productId);
        }

        return updatedProduct;
    }

    // Update the quantity of a product in the cart
    async updateCartItemQuantity(userId, productId, quantity) {
        if (quantity == null) {
            throw new Error('Quantity cannot be null');
        }

        // Update the quantity of the chosen product
        const query = `
            UPDATE cart
            SET quantity = $3
            WHERE user_id = $1 AND product_id = $2
            RETURNING *, (SELECT price FROM products WHERE id = $2) AS price;
        `;
        const values = [userId, productId, quantity];
        const result = await db.query(query, values);
        const updatedCartItem = result.rows[0];
        updatedCartItem.total_price = (updatedCartItem.price * updatedCartItem.quantity).toFixed(2);
        return updatedCartItem;
    }

    // Remove a product from the cart
    async removeCartItem(userId, productId) {
        const query = `
            DELETE FROM cart
            WHERE user_id = $1 AND product_id = $2;
        `;
        const values = [userId, productId];
        await db.query(query, values);
    }
}

module.exports = new CartRepository();