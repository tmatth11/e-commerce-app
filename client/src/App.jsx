import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Products from './components/Products';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Logout from './components/Logout';
import NotFound from './components/NotFound';
import { getCookie } from './utils/cookies';

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false); // Store if the user is logged in as a boolean
    const [userId, setUserId] = useState(null); // Store the user ID
    const [role, setRole] = useState(null); // Store the user role

    // Handle the user session state
    const handleUserSessionState = (isLoggedIn, id = null) => {
        setLoggedIn(isLoggedIn);
        setUserId(id);
    }

    // Fetch the user's role
    const fetchRole = async () => {
        try {
            // Get the access token from the cookies
            const accessToken = getCookie('accessToken');

            // Send a GET request to the server to get the user's role
            const response = await fetch(`${import.meta.env.VITE_API_URL}/role`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include',
            });

            // Set the role if the response is successful
            if (response.ok) {
                const data = await response.json();
                setRole(data.role);
            }
            // Fail to fetch the role
            else {
                console.error('Failed to fetch role');
                setRole(null);
            }
        } 
        catch (error) {
            console.error('Error fetching role:', error);
            setRole(null);
        }
    };

    // Automatically refresh the access token before it expires
    useEffect(() => {
        // Get the access token and refresh token from the cookies
        const accessToken = getCookie('accessToken');
        const refreshToken = getCookie('refreshToken');

        // Check if the access token and refresh token are valid
        const checkTokens = async () => {
            if (!accessToken && !refreshToken) {
                handleUserSessionState(false);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    handleUserSessionState(true, data.id);
                    fetchRole();
                    
                    // Calculate the time to refresh the access token
                    const tokenExpirationTime = 15 * 60 * 1000;
                    const refreshTime = tokenExpirationTime - 2 * 60 * 1000;
                    
                    // Refresh the access token before it expires
                    setTimeout(async () => {
                        const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            },
                            credentials: 'include',
                        });
                        
                        // Set the user session state based on the response
                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            handleUserSessionState(true, refreshData.id);
                            fetchRole();
                        } 
                        else {
                            handleUserSessionState(false);
                        }
                    }, refreshTime);
                } else {
                    handleUserSessionState(false);
                }
            } catch (error) {
                console.error('Token Check Error:', error);
                handleUserSessionState(false);
            }
        };

        checkTokens();
    }, [loggedIn]);

    // Fetch the user's role when the user logs in
    useEffect(() => {
        if (loggedIn) {
            fetchRole();
        } else {
            setRole(null);
        }
    }, [loggedIn]);
    
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout loggedIn={loggedIn} role={role} />}>
                        <Route index element={<Home />} />
                        <Route path="register" element={<Register handleLogin={handleUserSessionState} role={role} loggedIn={loggedIn} />} />
                        <Route path="login" element={<Login handleLogin={handleUserSessionState} role={role} loggedIn={loggedIn} />} />
                        <Route path="products" element={<Products role={role} loggedIn={loggedIn} />} />
                        <Route path="shop" element={<Shop role={role} loggedIn={loggedIn} />} />
                        <Route path="cart" element={<Cart role={role} loggedIn={loggedIn} />} />
                        <Route path="logout" element={<Logout handleLogin={handleUserSessionState} role={role} loggedIn={loggedIn} />} />
                        <Route path="*" element={<NotFound role={role} loggedIn={loggedIn} />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;