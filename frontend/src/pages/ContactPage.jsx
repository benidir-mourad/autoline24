import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../services/api";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/contact.css";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
    const { contactSettings } = useSiteSettings();
    const [searchParams] = useSearchParams();
    const formRef = useRef(null);

    const carLabel = searchParams.get("car") || "";
    const carRef   = searchParams.get("ref") || "";
    const fullLabel = [carLabel, carRef ? `(Réf. ${carRef})` : ""].filter(Boolean).join(" ");

    const [form, setForm] = useState(() => ({
        ...initialForm,
        message: fullLabel
            ? `Bonjour,\n\nJe suis intéressé(e) par votre ${fullLabel}.\n\nPourriez-vous me contacter pour plus d'informations ?\n\nCordialement`
            : "",
    }));
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fullLabel && formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [fullLabel]);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            setStatus({ type: "", message: "" });
            await api.post("/contact", {
                ...form,
                car_label: fullLabel || undefined,
            });
            setStatus({ type: "success", message: "Message envoyé ! Nous vous répondrons dans les plus brefs délais." });
            setForm(initialForm);
        } catch (error) {
            const msg = error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
            setStatus({ type: "error", message: msg });
        } finally {
            setLoading(false);
        }
    }

    const siteUrl = window.location.origin;
    const metaDesc = "Contactez Autoline24 pour toute question sur nos véhicules. Appelez-nous, envoyez un e-mail ou venez nous rendre visite.";

    return (
        <main className="page contact-page">
            <Helmet>
                <title>Contact | Autoline24</title>
                <meta name="description" content={metaDesc} />
                <link rel="canonical" href={`${siteUrl}/contact`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Contact | Autoline24" />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:url" content={`${siteUrl}/contact`} />
                <meta name="twitter:card" content="summary" />
            </Helmet>
            <div className="page-backlinks">
                <Link to="/cars">Nos voitures</Link>
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
                    <a className="page-button page-button--secondary" href={`mailto:${contactSettings.contact_email}`}>
                        Envoyer un e-mail
                    </a>
                </div>
            </section>

            <section className="contact-page__grid">
                <article className="contact-page__card">
                    <span>Téléphone</span>
                    <a href={`tel:${contactSettings.contact_phone}`}>{contactSettings.contact_phone}</a>
                </article>
                <article className="contact-page__card">
                    <span>E-mail</span>
                    <a href={`mailto:${contactSettings.contact_email}`}>{contactSettings.contact_email}</a>
                </article>
                <article className="contact-page__card">
                    <span>Adresse</span>
                    <strong>{contactSettings.contact_address}</strong>
                </article>
                <article className="contact-page__card">
                    <span>TVA</span>
                    <strong>{contactSettings.company_vat || "À compléter"}</strong>
                </article>
            </section>

            {/* ── Contact form ── */}
            <section className="contact-form-section" ref={formRef}>
                <div className="contact-form-section__header">
                    <h2>Envoyer un message</h2>
                    {fullLabel && (
                        <div className="contact-form-section__prefill-badge">
                            Demande au sujet de : <strong>{fullLabel}</strong>
                        </div>
                    )}
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form__row">
                        <div className="contact-form__field">
                            <label htmlFor="cf-name">Nom *</label>
                            <input
                                id="cf-name"
                                type="text"
                                name="name"
                                placeholder="Votre nom"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="contact-form__field">
                            <label htmlFor="cf-email">E-mail *</label>
                            <input
                                id="cf-email"
                                type="email"
                                name="email"
                                placeholder="votre@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="contact-form__field">
                        <label htmlFor="cf-message">Message *</label>
                        <textarea
                            id="cf-message"
                            name="message"
                            rows={6}
                            placeholder="Votre message..."
                            value={form.message}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {status.message && (
                        <div className={`contact-form__feedback contact-form__feedback--${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    <button type="submit" className="page-button page-button--secondary contact-form__submit" disabled={loading}>
                        {loading ? "Envoi en cours…" : "Envoyer le message"}
                    </button>
                </form>
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
