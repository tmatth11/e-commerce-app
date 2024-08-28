import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';

const Shop = ({ role, loggedIn }) => {
    const [products, setProducts] = useState([]); // Store the products
    const [quantity, setQuantity] = useState({}); // Store the quantity of each product
    const [loading, setLoading] = useState(true); // Store if the page is loading
    const [alertVisible, setAlertVisible] = useState(false); // Store if the alert is visible
    const [alertMessage, setAlertMessage] = useState(''); // Store the alert message

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the products if the role is a buyer and the user is logged in
        const fetchProducts = async () => {
            try {
                // Check if the user is not logged in or the role is not a buyer
                if (!loggedIn || (role !== null && role !== 'buyer')) {
                    // Redirect to the home page
                    navigate('/');
                    return;
                }

                // Check if role is null
                if (role === null) {
                    return;
                }

                // Stop loading the page
                setLoading(false);

                // Send the user to the homepage if the user's role is not a buyer
                if (role !== 'buyer') {
                    console.log("Not a buyer");
                    navigate('/');
                    return;
                }

                // Get the access token from the cookies
                let accessToken = getCookie('accessToken');
                // Fetch the products from the server
                const productsResponse = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
                });

                if (!productsResponse.ok) {
                    console.error('Failed to fetch products');
                    return;
                }

                // Set the products if the response is successful
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                console.error('Error:', error);
                navigate('/');
            }
        };

        fetchProducts();
    }, [navigate]);

    // Add a product to the cart
    const handleAddToCart = async (productId) => {
        window.scrollTo(0, 0);
        const accessToken = getCookie('accessToken');
        try {
            const response = await fetch('http://localhost:3010/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ productId, quantity: quantity[productId] || 1 })
            });

            // Check if the stock is insufficient
            if (response.status === 400) {
                setAlertMessage('Insufficient stock');
                setAlertVisible(true);
                setTimeout(() => setAlertVisible(false), 3000);
                return;
            }

            // Check if the response is not successful
            if (!response.ok) {
                setAlertMessage('Failed to add to cart');
                setAlertVisible(true);
                setTimeout(() => setAlertVisible(false), 3000);
                throw new Error('Failed to add to cart');
            }

            // Set the alert message and make the alert visible
            setAlertMessage('Product added to cart successfully.');
            setAlertVisible(true);
            setTimeout(() => setAlertVisible(false), 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    // Handle the quantity change of a product
    const handleQuantityChange = (productId, value) => {
        setQuantity((prev) => ({ ...prev, [productId]: value }));
    };

    // Show a loading message if the page is loading
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-5 text-center container d-flex flex-column align-items-center">
            {alertVisible && (
                <div className={`alert ${alertMessage === 'Product added to cart successfully.' ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {alertMessage}
                </div>
            )}
            <h1>Shop</h1>

            {/* Display the products */}
            {products.map((product) => (
                <div key={product.id} className='shop-card mb-2 p-3'>
                    <div className="card-body d-flex flex-column gap-3 align-items-center">
                        <h2 className="card-title">{product.name}</h2>
                        <p className="card-subtitle mb-2 text-success">${product.price}</p>
                        <p className="card-text">{product.description}</p>
                        <input
                            type="number"
                            className="form-control text-center w-25 border border-2 border-secondary"
                            value={quantity[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            min="1"
                        />
                        <button className='btn btn-primary' onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                    </div>
                    <div className="d-flex flex-column align-items-end p-2">
                        <p className="text-muted">Stock: {product.stock}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shop;