import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar__logo">Autoline24</div>

            <div className="navbar__links">
                <Link to="/">Accueil</Link>
                <Link to="/cars">Voitures</Link>
                <Link to="/admin/login">Admin</Link>
            </div>
        </nav>
    );
}