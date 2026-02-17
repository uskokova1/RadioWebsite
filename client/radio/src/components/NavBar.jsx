import { Link } from "react-router-dom";
import "../css/NavBar.css"

function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/Home" className="navbar-brand">WSIN Radio</Link>
            <div className="navbar-links">
                <Link to="/Home" className="nav-link">Home</Link>
                <Link to="/Account" className="nav-link">Account</Link>
                <Link to="/Blog" className="nav-link">Blogs</Link>
            </div>
        </nav>
    );
}

export default NavBar