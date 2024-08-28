import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import registerImage from '../img/register.png';

const Register = ({ handleLogin }) => {
    const [username, setUsername] = useState(''); // Store the username
    const [password, setPassword] = useState(''); // Store the password
    const [role, setRole] = useState('buyer'); // Store the role
    const [repeatPassword, setRepeatPassword] = useState(''); // Store the repeated password
    const [confirmationMessage, setConfirmationMessage] = useState(''); // Store the confirmation message

    const navigate = useNavigate();

    // Handle the form submission
    const handleSubmit = async (event) => {
        try {
            event.preventDefault();

            // Check if the passwords match
            if (password !== repeatPassword) {
                setConfirmationMessage('Passwords do not match.');
                setUsername('');
                setPassword('');
                setRepeatPassword('');
                return;
            }

            // Send a POST request to the server
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, role }),
                credentials: 'include'
            });

            const status = response.status;
            const responseJson = await response.json();

            // Succesfully handle the registration
            if (status === 201) {
                handleLogin(true, responseJson.id);
                navigate('/');
            }
            // Detect if the username already exists
            else if (status === 409) {
                setConfirmationMessage('There is already an account with that username. Please try again with a new username.');
                handleLogin(false);
            }
        }
        catch (e) {
            console.error('Error during registration:', e);
            setConfirmationMessage('An error occurred during registration. Please try again.');
        }
    }

    // Reset the form fields
    const handleReset = () => {
        setUsername('');
        setPassword('');
        setRole('buyer');
        setRepeatPassword('');
    }

    return (
        <section className="p-2 p-sm-5">
            <div className="container">
                {/* Display conformation message */}
                {confirmationMessage && <div className="alert alert-success text-center my-3">{confirmationMessage}</div>}

                <h1 className="text-center fw-bold my-3">Register</h1>
                <img id="register" className="w-25 rounded my-3 d-block mx-auto" src={registerImage}
                    alt="Register Image" />
                <p className="text-center">Please fill in this form to create an account.</p>
                
                {/* Display form fields */}
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <form onSubmit={handleSubmit}>
                            <div className="w-75 mx-auto">
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control" id="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="repeat-password" className="form-label">Repeat Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="repeat-password"
                                        placeholder="Repeat password"
                                        value={repeatPassword}
                                        onChange={(event) => setRepeatPassword(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        value={role}
                                        onChange={(event) => setRole(event.target.value)}
                                        required
                                    >
                                        <option value="buyer">Buyer</option>
                                        <option value="seller">Seller</option>
                                    </select>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                    <button type="reset" className="btn btn-secondary" onClick={handleReset}>Reset</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Register;