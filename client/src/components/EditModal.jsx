import { useState, useEffect } from 'react';
import { getCookie } from '../utils/cookies';

const EditModal = ({ product, currentName, setCurrentName, currentPrice, setCurrentPrice, currentDescription, setCurrentDescription, currentStock, setCurrentStock }) => {
    const [editName, setEditName] = useState(product.name); // Store the updated name
    const [editPrice, setEditPrice] = useState(product.price); // Store the updated price
    const [editDescription, setEditDescription] = useState(product.description); // Store the updated description
    const [editStock, setEditStock] = useState(product.stock); // Store the updated stock

    // Display the current product details in the modal
    useEffect(() => {
        setEditName(currentName);
        setEditPrice(currentPrice);
        setEditDescription(currentDescription);
        setEditStock(currentStock);
    }, [currentName, currentPrice, currentDescription, currentStock]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Get the access token from the cookies
            const accessToken = getCookie('accessToken');

            // Send a PUT request to the server
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    price: editPrice,
                    stock: editStock
                })
            });

            // Update the product if the response is successful
            if (response.ok) {
                setCurrentName(editName);
                setCurrentPrice(editPrice);
                setCurrentDescription(editDescription);
                setCurrentStock(editStock);

                // Hide the modal after updating the product
                const modalElement = document.getElementById(`editModal${product.id}`);
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            }
            else {
                console.error('Failed to update product');
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={`modal fade`} id={`editModal${product.id}`} tabIndex="-1" aria-labelledby={`editModalLabel${product.id}`} aria-hidden="true">
            <div className="modal-dialog">
                <form onSubmit={handleUpdate}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id={`editModalLabel${product.id}`}>Edit Product</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor={`updatedName${product.id}`} className="form-label">Updated Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id={`updatedName${product.id}`}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`updatedDescription${product.id}`} className="form-label">Updated Description</label>
                                <textarea
                                    className="form-control"
                                    id={`updatedDescription${product.id}`}
                                    rows="3"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`updatedPrice${product.id}`} className="form-label">Updated Price</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id={`updatedPrice${product.id}`}
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`updatedStock${product.id}`} className="form-label">Updated Stock</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id={`updatedStock${product.id}`}
                                    value={editStock}
                                    onChange={(e) => setEditStock(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="submit" className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;