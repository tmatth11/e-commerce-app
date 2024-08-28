import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import ProductCard from './ProductCard';

const Products = ({role, loggedIn}) => {
    const [products, setProducts] = useState([]); // Store the products
    const [newProductName, setNewProductName] = useState(''); // Store the new product name
    const [newProductPrice, setNewProductPrice] = useState(''); // Store the new product price
    const [newProductDescription, setNewProductDescription] = useState(''); // Store the new product description
    const [newProductStock, setNewProductStock] = useState(''); // Store the new product stock
    const [loading, setLoading] = useState(true); // Store if the page is loading
    
    const navigate = useNavigate();

    useEffect(() => {
        // Check the user's role and fetch the products
        const checkRoleAndFetchProducts = async () => {
            try {
                // Redirect to the home page if the user is not logged in or the role is not a seller
                if (!loggedIn || (role !== null && role !== 'seller')) {
                    navigate('/');
                    return;
                }
                
                // Check if the role is null
                if (role === null) {
                    return;
                }
                
                // Stop loading the page
                setLoading(false);

                // Redirect to the home page if the user's role is not a seller
                if (role !== 'seller') {
                    console.log("Not a seller");
                    navigate('/');
                    return;
                }
                
                // Get the access token from the cookies
                let accessToken = getCookie('accessToken');
                // Fetch the seller's products from the server
                const productsResponse = await fetch(`${import.meta.env.VITE_API_URL}/products/seller`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
                });

                // Set the products if the response is successful
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setProducts(productsData.reverse());
                } else {
                    console.error('Failed to fetch products');
                }

            } catch (error) {
                console.error('Error:', error);
                navigate('/');
            }
        };

        checkRoleAndFetchProducts();
    }, [navigate, role]);

    // Handle the deletion of a product
    const handleDelete = (productId) => {
        setProducts(products.filter(product => product.id !== productId));
    };

    // Handle the submission of a new product
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get the access token from the cookies
        const accessToken = getCookie('accessToken');
        if (!accessToken) {
            navigate('/');
            return;
        }

        try {
            // Send a POST request to the server to create a new product
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: newProductName,
                    description: newProductDescription,
                    price: newProductPrice,
                    stock: newProductStock
                })
            });

            // Check if the response is successful
            if (response.ok) {
                const newProduct = await response.json();
                // Set the new product
                setProducts([newProduct, ...products]);
                setNewProductName('');
                setNewProductDescription('');
                setNewProductPrice('');
                setNewProductStock('');
            } else {
                console.error('Failed to create new product');
            }
        } catch (err) {
            console.error('Error creating new product');
        }
    };

    // Show a loading message if the page is loading
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-5 text-center container d-flex flex-column align-items-center">
            <h1>Products</h1>

            {/* Product submission form */}
            <form onSubmit={handleSubmit} className="mb-4 w-50">
                <div className="mb-3">
                    <label htmlFor="productName" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="productName"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="productDescription" className="form-label">Content</label>
                    <textarea
                        className="form-control"
                        id="productDescription"
                        rows="3"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="productPrice" className="form-label">Price</label>
                    <input
                        type="number"
                        className="form-control"
                        id="productPrice"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="productStock" className="form-label">Stock</label>
                    <input
                        type="number"
                        className="form-control"
                        id="productStock"
                        value={newProductStock}
                        onChange={(e) => setNewProductStock(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create Product</button>
            </form>

            {/* Store each product in a card */}
            {products.map(product => (
                <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
        </div>
    );
};

export default Products;