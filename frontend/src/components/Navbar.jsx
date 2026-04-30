import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/navbar.css";

function SunIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    );
}

export default function Navbar() {
    const { contactSettings } = useSiteSettings();
    const { theme, toggle } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 12);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
            <NavLink to="/" className="navbar__brand" end>
                <div className="navbar__logo">
                    Autoline<span>24</span>
                </div>
                {contactSettings.contact_phone && (
                    <div className="navbar__contact">{contactSettings.contact_phone}</div>
                )}
            </NavLink>

            <div className="navbar__links">
                <NavLink to="/" end>Accueil</NavLink>
                <NavLink to="/contact">Contact</NavLink>
                <NavLink to="/admin">Admin</NavLink>
                <NavLink to="/cars" className="navbar__cta">Nos voitures</NavLink>
                <button
                    className="navbar__theme-toggle"
                    onClick={toggle}
                    aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </nav>
    );
}
