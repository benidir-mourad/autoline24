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
                    <div className="site-footer__logo">
                        Autoline<span>24</span>
                    </div>
                    <p>Voitures d'occasion sélectionnées avec soin.<br />Accompagnement et contact direct avec le vendeur.</p>
                    <Link to="/cars" className="site-footer__brand-cta">Voir nos voitures →</Link>
                </div>

                <div className="site-footer__col">
                    <span className="site-footer__heading">Navigation</span>
                    <Link to="/">Accueil</Link>
                    <Link to="/cars">Voitures</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                <div className="site-footer__col">
                    <span className="site-footer__heading">Coordonnées</span>
                    {contactSettings.contact_phone && (
                        <a href={`tel:${contactSettings.contact_phone}`}>
                            {contactSettings.contact_phone}
                        </a>
                    )}
                    {contactSettings.contact_email && (
                        <a href={`mailto:${contactSettings.contact_email}`}>
                            {contactSettings.contact_email}
                        </a>
                    )}
                    {contactSettings.contact_address && (
                        <span>{contactSettings.contact_address}</span>
                    )}
                    {contactSettings.company_vat && (
                        <span className="site-footer__vat">TVA : {contactSettings.company_vat}</span>
                    )}
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>© {year} Autoline24. Tous droits réservés.</span>
                <span className="site-footer__bottom-sep">·</span>
                <Link to="/contact">Contact</Link>
            </div>
        </footer>
    );
}
