const ProductRepository = require('../repositories/productRepository');

// Get all products by a seller
const getProductsBySeller = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const products = await ProductRepository.getProductsBySellerId(sellerId);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all products by all sellers
const getAllProducts = async (req, res) => {
    try {
        const products = await ProductRepository.getAllProducts();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new product
const createProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { name, description, price, stock } = req.body;
        const newProduct = await ProductRepository.createProduct(sellerId, name, description, price, stock);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a product's details
const updateProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.productId;
        const { name, description, price, stock } = req.body;

        const product = await ProductRepository.getProductById(productId);

        // Check if the seller owns the product
        if (product.seller_id !== sellerId) {
            return res.status(403).json({ error: 'You can only update your own products' });
        }

        // Return the updated product
        const updatedProduct = await ProductRepository.updateProduct(productId, name, description, price, stock);
        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.productId;

        const product = await ProductRepository.getProductById(productId);

        // Check if the seller owns the product
        if (product.seller_id !== sellerId) {
            return res.status(403).json({ error: 'You can only delete your own products' });
        }

        // Delete the product and return a success message
        await ProductRepository.deleteProduct(productId);
        res.status(204).json({message: 'Product deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getProductsBySeller, getAllProducts, createProduct, updateProduct, deleteProduct };