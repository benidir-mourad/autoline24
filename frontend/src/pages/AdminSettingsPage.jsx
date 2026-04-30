import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/admin.css";

const initialForm = {
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    company_vat: "",
    contact_map_embed_url: "",
};

const initialEmailForm = {
    email: "",
    current_password: "",
};

const initialPasswordForm = {
    current_password: "",
    password: "",
    password_confirmation: "",
};

const initialMailForm = {
    mail_host: "",
    mail_port: "587",
    mail_encryption: "tls",
    mail_username: "",
    mail_password: "",
    mail_from_address: "",
};

export default function AdminSettingsPage() {
    const { refreshContactSettings } = useSiteSettings();
    const { user, changeEmail, changePassword } = useAuth();
    const [form, setForm] = useState(initialForm);
    const [emailForm, setEmailForm] = useState(initialEmailForm);
    const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
    const [mailForm, setMailForm] = useState(initialMailForm);
    const [mailPasswordConfigured, setMailPasswordConfigured] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [mailSaving, setMailSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [emailFeedback, setEmailFeedback] = useState({ type: "", message: "" });
    const [passwordFeedback, setPasswordFeedback] = useState({ type: "", message: "" });
    const [mailFeedback, setMailFeedback] = useState({ type: "", message: "" });

    useEffect(() => {
        async function fetchSettings() {
            try {
                setLoading(true);
                const [contactRes, mailRes] = await Promise.all([
                    api.get("/admin/settings/contact"),
                    api.get("/admin/settings/mail"),
                ]);

                setForm({
                    contact_phone: contactRes.data.contact_phone || "",
                    contact_email: contactRes.data.contact_email || "",
                    contact_address: contactRes.data.contact_address || "",
                    company_vat: contactRes.data.company_vat || "",
                    contact_map_embed_url: contactRes.data.contact_map_embed_url || "",
                });

                setMailForm({
                    mail_host: mailRes.data.mail_host || "",
                    mail_port: mailRes.data.mail_port || "587",
                    mail_encryption: mailRes.data.mail_encryption || "tls",
                    mail_username: mailRes.data.mail_username || "",
                    mail_password: "",
                    mail_from_address: mailRes.data.mail_from_address || "",
                });
                setMailPasswordConfigured(mailRes.data.mail_password_configured || false);
            } catch (error) {
                console.error("Erreur lors du chargement des paramètres :", error);
                setFeedback({
                    type: "error",
                    message: "Impossible de charger les paramètres du site.",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    useEffect(() => {
        setEmailForm((prev) => ({
            ...prev,
            email: user?.email || "",
        }));
    }, [user?.email]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleEmailChange(event) {
        const { name, value } = event.target;
        setEmailForm((prev) => ({ ...prev, [name]: value }));
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleMailChange(event) {
        const { name, value } = event.target;
        setMailForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setFeedback({ type: "", message: "" });
            await api.put("/admin/settings/contact", form);
            await refreshContactSettings();
            setFeedback({ type: "success", message: "Paramètres enregistrés." });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des paramètres :", error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Impossible d'enregistrer les paramètres.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleEmailSubmit(event) {
        event.preventDefault();

        try {
            setEmailSaving(true);
            setEmailFeedback({ type: "", message: "" });
            await changeEmail(emailForm);
            setEmailForm((prev) => ({ ...prev, current_password: "" }));
            setEmailFeedback({
                type: "success",
                message: "Adresse e-mail de connexion mise à jour avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors du changement d'e-mail :", error);
            setEmailFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.email?.[0] ||
                    error.response?.data?.errors?.current_password?.[0] ||
                    "Impossible de mettre à jour l'adresse e-mail de connexion.",
            });
        } finally {
            setEmailSaving(false);
        }
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();

        try {
            setPasswordSaving(true);
            setPasswordFeedback({ type: "", message: "" });
            await changePassword(passwordForm);
            setPasswordForm(initialPasswordForm);
            setPasswordFeedback({
                type: "success",
                message: "Mot de passe mis à jour avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe :", error);
            setPasswordFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.current_password?.[0] ||
                    error.response?.data?.errors?.password?.[0] ||
                    "Impossible de mettre à jour le mot de passe.",
            });
        } finally {
            setPasswordSaving(false);
        }
    }

    async function handleMailSubmit(event) {
        event.preventDefault();

        try {
            setMailSaving(true);
            setMailFeedback({ type: "", message: "" });

            const payload = { ...mailForm };
            if (!payload.mail_password) {
                delete payload.mail_password;
            }

            await api.put("/admin/settings/mail", payload);
            setMailPasswordConfigured(true);
            setMailForm((prev) => ({ ...prev, mail_password: "" }));
            setMailFeedback({
                type: "success",
                message: "Configuration mail enregistrée.",
            });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la config mail :", error);
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setMailFeedback({
                type: "error",
                message:
                    firstError ||
                    error.response?.data?.message ||
                    "Impossible d'enregistrer la configuration mail.",
            });
        } finally {
            setMailSaving(false);
        }
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/admin">Retour au choix admin</Link>
                <Link to="/admin/cars">Liste des voitures</Link>
                <Link to="/contact">Voir la page contact</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>Paramètres</h1>
                    <p className="admin-page__subtitle">
                        Coordonnées du vendeur, configuration mail et sécurité du compte admin.
                    </p>
                </div>
            </div>

            {feedback.message && (
                <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                    {feedback.message}
                </p>
            )}

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <>
                    <form className="admin-form" onSubmit={handleSubmit}>
                        <input
                            name="contact_phone"
                            placeholder="Téléphone"
                            value={form.contact_phone}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_email"
                            type="email"
                            placeholder="E-mail public de contact"
                            value={form.contact_email}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_address"
                            placeholder="Adresse"
                            value={form.contact_address}
                            onChange={handleChange}
                        />
                        <input
                            name="company_vat"
                            placeholder="Numéro de TVA"
                            value={form.company_vat}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_map_embed_url"
                            placeholder="URL de la carte intégrée"
                            value={form.contact_map_embed_url}
                            onChange={handleChange}
                        />

                        <div className="admin-form__actions">
                            <button type="submit" className="admin-button" disabled={saving}>
                                {saving ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </div>
                    </form>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>Configuration de l'envoi de mails</h2>
                            <p>
                                Paramètres SMTP pour l'envoi des mails de réinitialisation de mot de passe.
                                Ces informations sont stockées en base de données — jamais dans le code.
                            </p>
                        </div>

                        {mailFeedback.message && (
                            <p className={`admin-feedback admin-feedback--${mailFeedback.type}`}>
                                {mailFeedback.message}
                            </p>
                        )}

                        <form className="admin-form" onSubmit={handleMailSubmit}>
                            <input
                                name="mail_host"
                                placeholder="Serveur SMTP (ex: smtp-mail.outlook.com)"
                                value={mailForm.mail_host}
                                onChange={handleMailChange}
                                required
                            />

                            <input
                                name="mail_port"
                                type="number"
                                placeholder="Port (ex: 587)"
                                value={mailForm.mail_port}
                                onChange={handleMailChange}
                                required
                            />

                            <select
                                name="mail_encryption"
                                value={mailForm.mail_encryption}
                                onChange={handleMailChange}
                            >
                                <option value="tls">TLS (port 587 — recommandé)</option>
                                <option value="ssl">SSL (port 465)</option>
                                <option value="none">Aucun chiffrement</option>
                            </select>

                            <input
                                name="mail_username"
                                type="email"
                                placeholder="Adresse e-mail expéditeur (ex: ton@outlook.com)"
                                value={mailForm.mail_username}
                                onChange={handleMailChange}
                                required
                            />

                            <input
                                name="mail_password"
                                type="password"
                                placeholder={
                                    mailPasswordConfigured
                                        ? "Mot de passe configuré — laisser vide pour le conserver"
                                        : "Mot de passe du compte mail"
                                }
                                value={mailForm.mail_password}
                                onChange={handleMailChange}
                            />

                            <input
                                name="mail_from_address"
                                type="email"
                                placeholder="Adresse expéditeur affichée dans le mail reçu"
                                value={mailForm.mail_from_address}
                                onChange={handleMailChange}
                                required
                            />

                            <div className="admin-form__actions">
                                <button type="submit" className="admin-button" disabled={mailSaving}>
                                    {mailSaving ? "Enregistrement..." : "Enregistrer la configuration mail"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>Adresse e-mail de connexion admin</h2>
                            <p>
                                Modifiez ici l'adresse utilisée pour vous connecter à l'admin.
                            </p>
                        </div>

                        {emailFeedback.message && (
                            <p className={`admin-feedback admin-feedback--${emailFeedback.type}`}>
                                {emailFeedback.message}
                            </p>
                        )}

                        <form className="admin-form" onSubmit={handleEmailSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Nouvelle adresse e-mail de connexion"
                                value={emailForm.email}
                                onChange={handleEmailChange}
                            />
                            <input
                                type="password"
                                name="current_password"
                                placeholder="Mot de passe actuel"
                                value={emailForm.current_password}
                                onChange={handleEmailChange}
                            />

                            <div className="admin-form__actions">
                                <button
                                    type="submit"
                                    className="admin-button"
                                    disabled={emailSaving}
                                >
                                    {emailSaving
                                        ? "Mise à jour..."
                                        : "Mettre à jour l'e-mail de connexion"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>Sécurité du compte admin</h2>
                            <p>Modifiez le mot de passe de votre compte une fois connecté.</p>
                        </div>

                        {passwordFeedback.message && (
                            <p
                                className={`admin-feedback admin-feedback--${passwordFeedback.type}`}
                            >
                                {passwordFeedback.message}
                            </p>
                        )}

                        <form className="admin-form" onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                name="current_password"
                                placeholder="Mot de passe actuel"
                                value={passwordForm.current_password}
                                onChange={handlePasswordChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Nouveau mot de passe"
                                value={passwordForm.password}
                                onChange={handlePasswordChange}
                            />
                            <input
                                type="password"
                                name="password_confirmation"
                                placeholder="Confirmation du mot de passe"
                                value={passwordForm.password_confirmation}
                                onChange={handlePasswordChange}
                            />

                            <div className="admin-form__actions">
                                <button
                                    type="submit"
                                    className="admin-button"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving
                                        ? "Mise à jour..."
                                        : "Mettre à jour le mot de passe"}
                                </button>
                            </div>
                        </form>
                    </section>
                </>
            )}
        </main>
    );
}
