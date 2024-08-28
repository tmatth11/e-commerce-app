import {useState} from 'react';
import EditModal from './EditModal';
import { getCookie } from '../utils/cookies';

const ProductCard = ({ product, onDelete }) => {
    const [currentName, setCurrentName] = useState(product.name); // Store the current name
    const [currentPrice, setCurrentPrice] = useState(product.price); // Store the current price
    const [currentDescription, setCurrentDescription] = useState(product.description); // Store the current description
    const [currentStock, setCurrentStock] = useState(product.stock); // Store the current stock

    // Handle the deletion of the product
    const handleDelete = async () => {
        try {
            // Get the access token from the cookies
            const accessToken = getCookie('accessToken');
            // Send a DELETE request to the server
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${product.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            
            // Delete the product if the response is successful
            if (response.ok) {
                onDelete(product.id);
            }
            else {
                console.error('Failed to delete product');
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>  
            {/* Product details stored in card */}
            <div className="col">
                <div className="product-card card mb-2">
                    <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-end gap-2 mb-3">
                            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target={`#editModal${product.id}`}>Edit</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                        <h2 className="card-title">{currentName}</h2>
                        <div className="card-subtitle mb-2 text-success">${currentPrice}</div>
                        <p className="card-text">{currentDescription}</p>
                    </div>
                    <div className="d-flex flex-column align-items-end p-2">
                        <p className="text-muted">Stock: {currentStock}</p>
                    </div>
                </div>
            </div>

            {/* Modal to edit product details */}
            <EditModal product={product} currentName={currentName} setCurrentName={setCurrentName} currentDescription={currentDescription} setCurrentDescription={setCurrentDescription} currentPrice={currentPrice} setCurrentPrice={setCurrentPrice} currentStock={currentStock} setCurrentStock={setCurrentStock} />
        </>
    );
};

export default ProductCard;