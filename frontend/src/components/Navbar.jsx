import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/navbar.css";

export default function Navbar() {
    const { contactSettings } = useSiteSettings();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar__brand">
                <div className="navbar__logo">Autoline24</div>
                <div className="navbar__contact">{contactSettings.contact_phone}</div>
            </Link>

            <div className="navbar__links">
                <Link to="/">Accueil</Link>
                <Link to="/cars">Voitures</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/admin/login">Admin</Link>
            </div>
        </nav>
    );
}
