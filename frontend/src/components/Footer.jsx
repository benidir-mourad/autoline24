import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/footer.css";

export default function Footer() {
    const { contactSettings } = useSiteSettings();
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__brand">
                    <strong>Autoline24</strong>
                    <p>Voitures d'occasion sélectionnées avec soin.<br />Accompagnement et contact direct avec le vendeur.</p>
                </div>

                <div className="site-footer__links">
                    <span className="site-footer__heading">Navigation</span>
                    <Link to="/">Accueil</Link>
                    <Link to="/cars">Voitures</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                <div className="site-footer__contact">
                    <span className="site-footer__heading">Coordonnées</span>
                    <a href={`tel:${contactSettings.contact_phone}`}>
                        {contactSettings.contact_phone}
                    </a>
                    <a href={`mailto:${contactSettings.contact_email}`}>
                        {contactSettings.contact_email}
                    </a>
                    <span>{contactSettings.contact_address}</span>
                    {contactSettings.company_vat && (
                        <span>TVA : {contactSettings.company_vat}</span>
                    )}
                </div>
            </div>

            <div className="site-footer__bottom">
                © {year} Autoline24. Tous droits réservés.
            </div>
        </footer>
    );
}
