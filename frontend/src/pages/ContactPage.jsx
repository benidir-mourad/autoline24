import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/contact.css";

export default function ContactPage() {
    const { contactSettings } = useSiteSettings();

    return (
        <main className="page contact-page">
            <div className="page-backlinks">
                <Link to="/">Accueil</Link>
                <Link to="/cars">Voir les voitures</Link>
            </div>

            <section className="contact-page__hero">
                <div className="contact-page__hero-copy">
                    <span className="page-eyebrow">Contact</span>
                    <h1>Contacter le vendeur</h1>
                    <p>
                        Une question sur un véhicule, un financement ou une visite ?
                        Retrouvez ici toutes les coordonnées utiles pour nous joindre.
                    </p>
                </div>

                <div className="contact-page__quick-actions">
                    <a className="page-button" href={`tel:${contactSettings.contact_phone}`}>
                        Appeler
                    </a>
                    <a
                        className="page-button page-button--secondary"
                        href={`mailto:${contactSettings.contact_email}`}
                    >
                        Envoyer un e-mail
                    </a>
                </div>
            </section>

            <section className="contact-page__grid">
                <article className="contact-page__card">
                    <span>Téléphone</span>
                    <a href={`tel:${contactSettings.contact_phone}`}>
                        {contactSettings.contact_phone}
                    </a>
                </article>

                <article className="contact-page__card">
                    <span>E-mail</span>
                    <a href={`mailto:${contactSettings.contact_email}`}>
                        {contactSettings.contact_email}
                    </a>
                </article>

                <article className="contact-page__card">
                    <span>Adresse</span>
                    <strong>{contactSettings.contact_address}</strong>
                </article>
            </section>

            <section className="contact-page__map">
                <div className="contact-page__map-header">
                    <div>
                        <h2>Nous trouver</h2>
                        <p>{contactSettings.contact_address}</p>
                    </div>
                    <Link to="/cars" className="contact-page__map-link">
                        Retour au catalogue
                    </Link>
                </div>

                {contactSettings.contact_map_embed_url ? (
                    <iframe
                        title="Carte Autoline24"
                        src={contactSettings.contact_map_embed_url}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="contact-page__map-placeholder">
                        Carte indisponible pour le moment.
                    </div>
                )}
            </section>
        </main>
    );
}
