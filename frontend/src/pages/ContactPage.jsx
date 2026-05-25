import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/contact.css";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
    const { t } = useTranslation();
    const { contactSettings } = useSiteSettings();
    const [searchParams] = useSearchParams();
    const formRef = useRef(null);

    const carLabel = searchParams.get("car") || "";
    const carRef   = searchParams.get("ref") || "";
    const fullLabel = [carLabel, carRef ? t("contact.refLabel", { ref: carRef }) : ""].filter(Boolean).join(" ");

    const [form, setForm] = useState(() => ({
        ...initialForm,
        message: fullLabel
            ? t("contact.prefillMessage", { label: [carLabel, carRef].filter(Boolean).join(" ") })
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
            setStatus({ type: "success", message: t("contact.successMessage") });
            setForm(initialForm);
        } catch (error) {
            const msg = error.response?.data?.message || t("contact.errorFallback");
            setStatus({ type: "error", message: msg });
        } finally {
            setLoading(false);
        }
    }

    const siteUrl = window.location.origin;
    const metaDesc = t("contact.metaDesc");

    return (
        <main className="page contact-page">
            <Helmet>
                <title>{t("contact.pageTitle")}</title>
                <meta name="description" content={metaDesc} />
                <link rel="canonical" href={`${siteUrl}/contact`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={t("contact.ogTitle")} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:url" content={`${siteUrl}/contact`} />
                <meta name="twitter:card" content="summary" />
            </Helmet>
            <div className="page-backlinks">
                <Link to="/cars">{t("contact.backToCars")}</Link>
            </div>

            <section className="contact-page__hero">
                <div className="contact-page__hero-copy">
                    <span className="page-eyebrow">{t("contact.eyebrow")}</span>
                    <h1>{t("contact.title")}</h1>
                    <p>{t("contact.description")}</p>
                </div>

                <div className="contact-page__quick-actions">
                    <a className="page-button" href={`tel:${contactSettings.contact_phone}`}>
                        {t("contact.call")}
                    </a>
                    <a className="page-button page-button--secondary" href={`mailto:${contactSettings.contact_email}`}>
                        {t("contact.sendEmail")}
                    </a>
                </div>
            </section>

            <section className="contact-page__grid">
                <article className="contact-page__card">
                    <span>{t("contact.phone")}</span>
                    <a href={`tel:${contactSettings.contact_phone}`}>{contactSettings.contact_phone}</a>
                </article>
                <article className="contact-page__card">
                    <span>{t("contact.email")}</span>
                    <a href={`mailto:${contactSettings.contact_email}`}>{contactSettings.contact_email}</a>
                </article>
                <article className="contact-page__card">
                    <span>{t("contact.address")}</span>
                    <strong>{contactSettings.contact_address}</strong>
                </article>
                <article className="contact-page__card">
                    <span>{t("contact.vat")}</span>
                    <strong>{contactSettings.company_vat || t("contact.vatFallback")}</strong>
                </article>
            </section>

            {/* ── Contact form ── */}
            <section className="contact-form-section" ref={formRef}>
                <div className="contact-form-section__header">
                    <h2>{t("contact.formTitle")}</h2>
                    {fullLabel && (
                        <div className="contact-form-section__prefill-badge">
                            {t("contact.inquiryAbout")} <strong>{fullLabel}</strong>
                        </div>
                    )}
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form__row">
                        <div className="contact-form__field">
                            <label htmlFor="cf-name">{t("contact.nameLabelShort")}</label>
                            <input
                                id="cf-name"
                                type="text"
                                name="name"
                                placeholder={t("contact.namePlaceholder")}
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="contact-form__field">
                            <label htmlFor="cf-email">{t("contact.emailLabelShort")}</label>
                            <input
                                id="cf-email"
                                type="email"
                                name="email"
                                placeholder={t("contact.emailPlaceholder")}
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="contact-form__field">
                        <label htmlFor="cf-message">{t("contact.messageLabelShort")}</label>
                        <textarea
                            id="cf-message"
                            name="message"
                            rows={6}
                            placeholder={t("contact.messagePlaceholder")}
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
                        {loading ? t("contact.sending") : t("contact.submit")}
                    </button>
                </form>
            </section>

            <section className="contact-page__map">
                <div className="contact-page__map-header">
                    <div>
                        <h2>{t("contact.findUs")}</h2>
                        <p>{contactSettings.contact_address}</p>
                    </div>
                    <Link to="/cars" className="contact-page__map-link">
                        {t("contact.backToCatalog")}
                    </Link>
                </div>

                {contactSettings.contact_map_embed_url ? (
                    <iframe
                        title={t("contact.mapTitle")}
                        src={contactSettings.contact_map_embed_url}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="contact-page__map-placeholder">
                        {t("contact.mapUnavailable")}
                    </div>
                )}
            </section>
        </main>
    );
}
