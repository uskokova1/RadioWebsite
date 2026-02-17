import { Link } from "react-router-dom";

function NavBar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">WSIN Radio</Link>
            </div>
            <div className="navbar-links">
                <Link to="/Home" className="nav-link">Home</Link>
                <Link to="/Account" className="nav-link">Account</Link>
            </div>
        </nav>
    );
}

export default NavBar