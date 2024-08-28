import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';

const Cart = ({ role, loggedIn }) => {
    const [loading, setLoading] = useState(true); // Store if the page is loading
    const [cartItems, setCartItems] = useState([]); // Store the cart items
    const [cartTotal, setCartTotal] = useState(0); // Store the cart total
    const [budgetExceeded, setBudgetExceeded] = useState(false); // Store if the budget is exceeded
    const [alertMessage, setAlertMessage] = useState(''); // Store the alert message
    const [showAlert, setShowAlert] = useState(false); // Store if the alert is shown

    const navigate = useNavigate();

    // Fetch the cart data
    useEffect(() => {
        const fetchCart = async () => {
            try {
                // Redirect to the home page if the user is not logged in or the role is not a buyer
                if (!loggedIn || (role !== null && role !== 'buyer')) {
                    navigate('/');
                    return;
                }

                // Check if the role is null
                if (role === null) {
                    return;
                }

                // Stop loading the page
                setLoading(false);

                // Redirect to the home page if the user's role is not a buyer
                if (role !== 'buyer') {
                    console.log("Not a buyer");
                    navigate('/');
                    return;
                }

                // Get the access token from the cookies
                let accessToken = getCookie('accessToken');
                // Send a GET request to the server
                const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
                });

                // Detect if the response is not successful
                if (!cartResponse.ok) {
                    console.error('Failed to fetch cart');
                    return;
                }

                // Set the cart items and total if the response is successful
                const cartData = await cartResponse.json();
                setCartItems(cartData.cartItems);
                setCartTotal(cartData.totalAmount);
                setBudgetExceeded(cartData.budgetExceeded);
            } catch (error) {
                console.error('Error:', error);
                navigate('/');
            }
        };

        fetchCart();
    }, [navigate, cartTotal]);

    // Handle the decrease of the quantity
    const handleDecreaseQuantity = async (productId, currentQuantity) => {
        if (currentQuantity <= 1) return;
    
        const newQuantity = currentQuantity - 1;
    
        await updateCartItemQuantity(productId, newQuantity);
    };
    
    // Handle the increase of the quantity
    const handleIncreaseQuantity = async (productId, currentQuantity) => {
        const newQuantity = currentQuantity + 1;
    
        await updateCartItemQuantity(productId, newQuantity);
    };
    
    // Update the cart item quantity
    const updateCartItemQuantity = async (productId, newQuantity) => {
        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        // Send a PUT request to the server
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        // Detect if the response is not successful and if the stock is insufficient
        if (!response.ok) {
            if (response.status === 400) {
                alert('Insufficient stock');
            }
            console.error('Failed to update quantity');
            return;
        }
        
        // Update the cart items and total if the response is successful
        const data = await response.json();
        const updatedCartItem = data.cartItem;
        
        // Update the cart items
        setCartItems(prevItems => {
            const newCartItems = prevItems.map(item =>
                item.product_id === productId ? { ...item, quantity: updatedCartItem.quantity, price: updatedCartItem.price } : item
            );
            updateCartTotal(newCartItems);
            return newCartItems;
        });

        await fetchCartData();
    };
    
    // Update the cart total
    const updateCartTotal = (cartItems) => {
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
        setCartTotal(total);
    };

    // Fetch the cart data
    const fetchCartData = async () => {
        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        // Send a GET request to the server
        const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
        });

        // Detect if the response is not successful
        if (!cartResponse.ok) {
            console.error('Failed to fetch cart');
            return;
        }

        // Set the cart items and total if the response is successful
        const cartData = await cartResponse.json();
        setCartTotal(cartData.totalAmount);
        setBudgetExceeded(cartData.budgetExceeded);
    };

    // Handle the deletion of a cart item
    const handleDeleteCartItem = async (productId) => {
        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        // Send a DELETE request to the server
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
        });

        // Detect if the response is not successful
        if (!response.ok) {
            console.error('Failed to delete cart item');
            return;
        }

        // Update the cart items and total if the response is successful
        const updatedCartItems = cartItems.filter(item => item.product_id !== productId);
        setCartItems(updatedCartItems);
        updateCartTotal(updatedCartItems);
        await fetchCartData();
        showAlertMessage('Item removed from cart');
    };

    // Handle the clearing of the cart
    const handleClearCart = async () => {
        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        // Send a DELETE request to the server
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
        });

        // Detect if the response is not successful
        if (!response.ok) {
            console.error('Failed to clear cart');
            return;
        }

        // Clear the cart if the response is successful
        setCartItems([]);
        setCartTotal(0);
        setBudgetExceeded(false);
    };

    // Handle the purchase of the cart
    const handlePurchase = async () => {
        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        // Send a POST request to the server
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Detect if the response is not successful
        if (!response.ok) {
            console.error('Failed to complete purchase');
            return;
        }

        // Clear the cart if the response is successful
        setCartItems([]);
        setCartTotal(0);
        setBudgetExceeded(false);
    };

    // Show an alert message for 3 seconds
    const showAlertMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 3000);
    };

    // Check if the page is loading and display a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // Check if the cart is empty
    if (cartItems.length === 0) {
        return <div className="mt-5 text-center container d-flex flex-column align-items-center">
            <h1 className='mb-3'>Cart</h1>
            <p>Your cart is empty.</p>
        </div>;
    }

    // Display the cart items
    return (
        <div className="mt-5 text-center container d-flex flex-column align-items-center">
            <h1 className='mb-3'>Cart</h1>
            {showAlert && (
                <div className="alert alert-success" role="alert">
                    {alertMessage}
                </div>
            )}
            {budgetExceeded && (
                <div className="alert alert-warning" role="alert">
                    Warning: Your budget has been exceeded!
                </div>
            )}
            <table className='table table-bordered table-striped table-responsive'>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((product) => (
                        <tr key={product.product_id}>
                            <td>{product.name}</td>
                            <td className='d-flex flex-column align-items-center'>
                                <p>{product.quantity}</p>
                                <div className="d-flex gap-3">
                                    <button className="btn btn-primary shop-btn" onClick={() => handleIncreaseQuantity(product.product_id, product.quantity)}>+</button>
                                    <button className="btn btn-danger shop-btn" onClick={() => handleDecreaseQuantity(product.product_id, product.quantity)}>-</button>
                                </div>
                            </td>
                            <td className="text-success">${product.price}</td>
                            <td><button className="btn btn-danger shop-btn" onClick={() => handleDeleteCartItem(product.product_id)}><i className="bi bi-x"></i></button></td>
                        </tr>
                    ))}
                    <tr>
                        <td></td>
                        <td></td>
                        <td className='fw-bold'>Total:</td>
                        <td className='text-success'>${cartTotal}</td>
                    </tr>
                </tbody>
            </table>
            <div className='d-flex justify-content-end ms-auto mb-2'>
                <button className="btn btn-danger me-2" onClick={handleClearCart}>Clear Cart</button>
                <button className="btn btn-success" onClick={handlePurchase} disabled={budgetExceeded}>Checkout</button>
            </div>
        </div>
    );
};

export default Cart;