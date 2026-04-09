import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/footer.css";

export default function Footer() {
    const { contactSettings } = useSiteSettings();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__brand">
                    <strong>Autoline24</strong>
                    <p>Voitures d'occasion, accompagnement et contact direct.</p>
                </div>

                <div className="site-footer__links">
                    <Link to="/">Accueil</Link>
                    <Link to="/cars">Voitures</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                <div className="site-footer__contact">
                    <a href={`tel:${contactSettings.contact_phone}`}>
                        {contactSettings.contact_phone}
                    </a>
                    <a href={`mailto:${contactSettings.contact_email}`}>
                        {contactSettings.contact_email}
                    </a>
                    <span>{contactSettings.contact_address}</span>
                    <span>TVA: {contactSettings.company_vat || "À compléter"}</span>
                </div>
            </div>
        </footer>
    );
}
