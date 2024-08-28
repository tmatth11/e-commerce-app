import hello from '../img/hello.jpg';

const Home = () => {
    return (
        // Home page content
        <div className="px-5 d-flex flex-column justify-content-center align-items-center">
            <img src={hello} width="200px" height="100px" alt="hello" className="my-3" />
            <h1 className="text-center my-3">Welcome to the E-Commerce App</h1>
            <div className="col col-lg-6">
                <p>
                    This is a full-stack e-commerce application built with the PERN stack. It features user authentication with JWT, protected routes for both buyers and sellers, and a database that manages users, products, and shopping carts. Buyers can earn money, browse products, add them to their cart, and purcahse the items. Sellers can add products, update product information and stock, and delete products. The application is meant to be a personal project to learn more about full-stack development with PostgreSQL, Express, React, and Node.js. It is also styled with Bootstrap.
                </p>
            </div>
        </div>
    );
}

export default Home;