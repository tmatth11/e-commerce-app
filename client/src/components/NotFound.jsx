import { Link } from "react-router-dom";
import errorImage from '../img/error.jpg';

const NotFound = () => {
    return (
        // Not found message
        <div className="d-flex flex-column align-items-center mt-5 p-2">
            <img className="rounded-4" width="300px" src={errorImage} alt="not found" />
            <h1 className="my-3">404: Not Found</h1>
            <p className="">Sorry, the page you are looking for does not exist.</p>
            <Link className="btn btn-primary btn-lg" to="/" role="button">Return Home</Link>
        </div>
    );
}

export default NotFound;