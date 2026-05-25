import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/footer.css";

export default function Footer() {
    const { t } = useTranslation();
    const { contactSettings } = useSiteSettings();
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__brand">
                    <div className="site-footer__logo">
                        Autoline<span>24</span>
                    </div>
                    <p style={{ whiteSpace: "pre-line" }}>{t("footer.tagline")}</p>
                    <Link to="/cars" className="site-footer__brand-cta">{t("footer.seeCars")}</Link>
                </div>

                <div className="site-footer__col">
                    <span className="site-footer__heading">{t("footer.navigation")}</span>
                    <Link to="/cars">{t("footer.cars")}</Link>
                    <Link to="/contact">{t("footer.contact")}</Link>
                </div>

                <div className="site-footer__col">
                    <span className="site-footer__heading">{t("footer.coordinates")}</span>
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
                        <span className="site-footer__vat">
                            {t("footer.vat", { vat: contactSettings.company_vat })}
                        </span>
                    )}
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>{t("footer.copyright", { year })}</span>
                <span className="site-footer__bottom-sep">·</span>
                <Link to="/contact">{t("footer.contact")}</Link>
            </div>
        </footer>
    );
}
