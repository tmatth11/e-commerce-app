const CartRepository = require('../repositories/cartRepository');
const ProductRepository = require('../repositories/productRepository');
const UserAccountsRepository = require('../repositories/userAccountsRepository');

// Add a product to the cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Check if the product exists
        const product = await ProductRepository.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the product is in stock
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Add the product to the cart
        const cartItem = await CartRepository.addToCart(userId, productId, quantity);
        res.status(201).json(cartItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View the cart
const viewCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await CartRepository.getCartByUserId(userId);

        // Calculate the total amount for each product depending on the quantity
        const updatedCartItems = cartItems.map(item => ({
            ...item,
            price: (parseFloat(item.price) * item.quantity).toFixed(2)
        }));

        // Determine if the total amount exceeds the user's budget
        const totalAmount = updatedCartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
        const budgetExceeded = totalAmount > req.user.budget;

        // Return the cart items, total amount, and budget exceeded status
        res.json({ cartItems: updatedCartItems, totalAmount, budgetExceeded });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Purchase the cart
const purchaseCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await CartRepository.getCartByUserId(userId);

        // Calculate the total amount for each product depending on the quantity
        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const userAccountsRepository = new UserAccountsRepository();
        const user = await userAccountsRepository.getUserById(userId);
        // Determine if the user has enough balance to purchase the cart
        if (user.balance < totalAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Check if the products are in stock
        for (const item of cartItems) {
            const product = await ProductRepository.getProductById(item.product_id);
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
            }
        }

        // Update the user's balance and product stock
        const newBalance = (user.balance - totalAmount).toFixed(2);
        await userAccountsRepository.updateUserBalance(userId, newBalance);

        for (const item of cartItems) {
            await CartRepository.updateProductStock(item.product_id, item.quantity);
        }

        // Clear the cart after purchase
        await CartRepository.clearCart(userId);

        // Return a success message and the new balance
        res.status(200).json({ message: 'Purchase successful', newBalance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update the quantity of a cart item
const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const { quantity } = req.body;

        // Update the quantity of the cart item
        const updatedCartItem = await CartRepository.updateCartItemQuantity(userId, productId, quantity);

        // Return the updated cart item
        res.status(200).json({
            message: 'Cart item updated',
            cartItem: {
                productId: updatedCartItem.product_id,
                quantity: updatedCartItem.quantity,
                price: updatedCartItem.total_price
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Remove a cart item
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Remove the cart item
        await CartRepository.removeCartItem(userId, productId);

        // Return a success message
        res.status(204).json({message: 'Cart item removed'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Clear the cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Clear the cart
        await CartRepository.clearCart(userId);

        // Return a success message
        res.status(204).json({message: 'Cart cleared'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Give the user money (secret route)
const earnMoney = async (req, res) => {
    try {
        const userId = req.user.id;
        const amount = parseFloat(req.body.amount); 

        const userAccountsRepository = new UserAccountsRepository();
        const user = await userAccountsRepository.getUserById(userId);

        // Calculate the user's new balance
        const currentBalance = parseFloat(user.balance);
        const newBalance = (currentBalance + amount).toFixed(2);

        // Update the user's balance
        await userAccountsRepository.updateUserBalance(userId, newBalance);

        // Return a success message and the new balance
        res.status(200).json({ message: 'Balance updated', newBalance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { addToCart, viewCart, purchaseCart, updateCartItemQuantity, removeCartItem, clearCart, earnMoney };