import { Link, Outlet } from 'react-router-dom';
import Footer from './Footer';

const Layout = ({ loggedIn, role }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <nav className='navbar navbar-expand-lg bg-dark navbar-dark border-4 border-bottom border-primary py-3'>
                <div className="container">
                    <Link to="/" className="navbar-brand">E-Commerce App</Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navmenu">
                        <ul className="navbar-nav ms-auto my-2">
                            <li className="nav-item me-3">
                                <Link to="/" className="nav-link btn btn-primary">Home</Link>
                            </li>
                            {!loggedIn && (
                                <li className="nav-item me-3">
                                    <Link to="/register" className="nav-link btn btn-primary">Register</Link>
                                </li>
                            )}
                            {!loggedIn && (
                                <li className="nav-item me-3">
                                    <Link to="/login" className="nav-link btn btn-primary">Login</Link>
                                </li>
                            )}
                            {loggedIn && role === 'seller' && (
                                <li className="nav-item me-3">
                                    <Link to="/products" className="nav-link btn btn-primary">Products</Link>
                                </li>
                            )}
                            {loggedIn && role === 'buyer' && (
                                <li className="nav-item me-3">
                                    <Link to="/shop" className="nav-link btn btn-primary">Shop</Link>
                                </li>
                            )}
                            {loggedIn && role === 'buyer' && (
                                <li className="nav-item me-3">
                                    <Link to="/cart" className="nav-link btn btn-primary">Cart</Link>
                                </li>
                            )}
                            {loggedIn && (
                                <li className="nav-item me-3">
                                    <Link to="/logout" className="nav-link active btn btn-primary">Log Out</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
            <main className="flex-grow-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;