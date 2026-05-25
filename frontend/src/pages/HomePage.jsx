import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function HomePage() {
    const { t } = useTranslation();
    const { contactSettings } = useSiteSettings();
    const siteUrl = window.location.origin;

    return (
        <main className="page home-page">
            <Helmet>
                <title>{t("home.metaTitle")}</title>
                <meta name="description" content={t("home.metaDesc")} />
                <link rel="canonical" href={siteUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={t("home.ogTitle")} />
                <meta property="og:description" content={t("home.metaDesc")} />
                <meta property="og:url" content={siteUrl} />
                <meta name="twitter:card" content="summary" />
            </Helmet>

            <section className="home-hero">
                <span className="page-eyebrow">{t("home.eyebrow")}</span>
                <h1>{t("home.title")}</h1>
                <p>{t("home.description")}</p>

                <div className="page-actions">
                    <Link to="/cars" className="page-button">
                        {t("home.browseCatalog")}
                    </Link>
                    <Link to="/contact" className="page-button page-button--secondary">
                        {t("home.takeContact")}
                    </Link>
                </div>
            </section>

            <section className="home-highlight-grid">
                <article className="page-card">
                    <span>{t("home.catalogLabel")}</span>
                    <strong>{t("home.catalogTitle")}</strong>
                    <p>{t("home.catalogText")}</p>
                </article>

                <article className="page-card">
                    <span>{t("home.directContactLabel")}</span>
                    <strong>{contactSettings.contact_phone}</strong>
                    <p>{contactSettings.contact_email}</p>
                </article>

                <article className="page-card">
                    <span>{t("home.onSiteLabel")}</span>
                    <strong>{contactSettings.contact_address}</strong>
                    <p>{t("home.onSiteText")}</p>
                </article>
            </section>
        </main>
    );
}
