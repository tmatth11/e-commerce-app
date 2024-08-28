const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const registerService = require('./services/registerService');
const loginService = require('./services/loginService');
const logoutService = require('./services/logoutService');
const tokenService = require('./services/tokenService');
const productService = require('./services/productService');
const cartService = require('./services/cartService');
const { authenticateToken, logger, checkSellerRole, checkBuyerRole } = require('./middleware');

// Create express app
const app = express();
const CLIENT_PORT = process.env.CLIENT_PORT || 5173;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `http://localhost:${CLIENT_PORT}`,
    credentials: true
}));
app.use(logger);

// Test route
app.get('/', (req, res) => {
    res.json({message: 'Welcome to the e-commerce app!'});
});

// Login and register routes
app.post('/register', registerService);
app.post('/login', loginService);
app.post('/logout', logoutService);
app.post('/token', tokenService);

// Check user role
app.get('/role', authenticateToken, (req, res) => {
    res.json({ role: req.user.role });
});

// Protected route for sellers
app.get('/seller', authenticateToken, checkSellerRole, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}!` });
});

// Protected route for buyers
app.get('/buyer', authenticateToken, checkBuyerRole, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}!` });
});

// Free money
app.post('/earn', authenticateToken, checkBuyerRole, cartService.earnMoney);

// Product routes
app.get('/products', productService.getAllProducts);
app.get('/products/seller', authenticateToken, checkSellerRole, productService.getProductsBySeller);
app.post('/products', authenticateToken, checkSellerRole, productService.createProduct);
app.put('/products/:productId', authenticateToken, checkSellerRole, productService.updateProduct);
app.delete('/products/:productId', authenticateToken, checkSellerRole, productService.deleteProduct);

// Cart Routes
app.post('/cart', authenticateToken, checkBuyerRole, cartService.addToCart);
app.get('/cart', authenticateToken, checkBuyerRole, cartService.viewCart);
app.post('/cart/purchase', authenticateToken, checkBuyerRole, cartService.purchaseCart);
app.put('/cart/:productId', authenticateToken, checkBuyerRole, cartService.updateCartItemQuantity);
app.delete('/cart/:productId', authenticateToken, checkBuyerRole, cartService.removeCartItem);
app.delete('/cart', authenticateToken, checkBuyerRole, cartService.clearCart);

// Start server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});