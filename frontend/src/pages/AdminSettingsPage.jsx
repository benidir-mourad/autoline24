import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
                console.error(error);
                setFeedback({
                    type: "error",
                    message: t("admin.settings.loadError"),
                });
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            setFeedback({ type: "success", message: t("admin.settings.saveSuccess") });
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    t("admin.settings.saveError"),
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
                message: t("admin.settings.emailUpdateSuccess"),
            });
        } catch (error) {
            console.error(error);
            setEmailFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.email?.[0] ||
                    error.response?.data?.errors?.current_password?.[0] ||
                    t("admin.settings.emailUpdateError"),
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
                message: t("admin.settings.passwordUpdateSuccess"),
            });
        } catch (error) {
            console.error(error);
            setPasswordFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.current_password?.[0] ||
                    error.response?.data?.errors?.password?.[0] ||
                    t("admin.settings.passwordUpdateError"),
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
                message: t("admin.settings.mailSaveSuccess"),
            });
        } catch (error) {
            console.error(error);
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setMailFeedback({
                type: "error",
                message:
                    firstError ||
                    error.response?.data?.message ||
                    t("admin.settings.mailSaveError"),
            });
        } finally {
            setMailSaving(false);
        }
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/admin">{t("admin.backToAdmin")}</Link>
                <Link to="/admin/cars">{t("admin.settings.backToAdminList")}</Link>
                <Link to="/contact">{t("admin.seeContactPage")}</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>{t("admin.settings.title")}</h1>
                    <p className="admin-page__subtitle">
                        {t("admin.settings.subtitle")}
                    </p>
                </div>
            </div>

            {feedback.message && (
                <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                    {feedback.message}
                </p>
            )}

            {loading ? (
                <p>{t("common.loading")}</p>
            ) : (
                <>
                    <form className="admin-form" onSubmit={handleSubmit}>
                        <input
                            name="contact_phone"
                            placeholder={t("admin.settings.phonePlaceholder")}
                            value={form.contact_phone}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_email"
                            type="email"
                            placeholder={t("admin.settings.emailPlaceholder")}
                            value={form.contact_email}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_address"
                            placeholder={t("admin.settings.addressPlaceholder")}
                            value={form.contact_address}
                            onChange={handleChange}
                        />
                        <input
                            name="company_vat"
                            placeholder={t("admin.settings.vatPlaceholder")}
                            value={form.company_vat}
                            onChange={handleChange}
                        />
                        <input
                            name="contact_map_embed_url"
                            placeholder={t("admin.settings.mapUrlPlaceholder")}
                            value={form.contact_map_embed_url}
                            onChange={handleChange}
                        />

                        <div className="admin-form__actions">
                            <button type="submit" className="admin-button" disabled={saving}>
                                {saving ? t("admin.settings.saving") : t("admin.settings.save")}
                            </button>
                        </div>
                    </form>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>{t("admin.settings.mailTitle")}</h2>
                            <p>{t("admin.settings.mailDesc")}</p>
                        </div>

                        {mailFeedback.message && (
                            <p className={`admin-feedback admin-feedback--${mailFeedback.type}`}>
                                {mailFeedback.message}
                            </p>
                        )}

                        <form className="admin-form" onSubmit={handleMailSubmit}>
                            <input
                                name="mail_host"
                                placeholder={t("admin.settings.mailHost")}
                                value={mailForm.mail_host}
                                onChange={handleMailChange}
                                required
                            />

                            <input
                                name="mail_port"
                                type="number"
                                placeholder={t("admin.settings.mailPort")}
                                value={mailForm.mail_port}
                                onChange={handleMailChange}
                                required
                            />

                            <select
                                name="mail_encryption"
                                value={mailForm.mail_encryption}
                                onChange={handleMailChange}
                            >
                                <option value="tls">{t("admin.settings.mailEncryptionTls")}</option>
                                <option value="ssl">{t("admin.settings.mailEncryptionSsl")}</option>
                                <option value="none">{t("admin.settings.mailEncryptionNone")}</option>
                            </select>

                            <input
                                name="mail_username"
                                type="email"
                                placeholder={t("admin.settings.mailUsername")}
                                value={mailForm.mail_username}
                                onChange={handleMailChange}
                                required
                            />

                            <input
                                name="mail_password"
                                type="password"
                                placeholder={
                                    mailPasswordConfigured
                                        ? t("admin.settings.mailPasswordConfigured")
                                        : t("admin.settings.mailPassword")
                                }
                                value={mailForm.mail_password}
                                onChange={handleMailChange}
                            />

                            <input
                                name="mail_from_address"
                                type="email"
                                placeholder={t("admin.settings.mailFromAddress")}
                                value={mailForm.mail_from_address}
                                onChange={handleMailChange}
                                required
                            />

                            <div className="admin-form__actions">
                                <button type="submit" className="admin-button" disabled={mailSaving}>
                                    {mailSaving ? t("admin.settings.savingMail") : t("admin.settings.saveMail")}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>{t("admin.settings.emailTitle")}</h2>
                            <p>{t("admin.settings.emailDesc")}</p>
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
                                placeholder={t("admin.settings.newEmailPlaceholder")}
                                value={emailForm.email}
                                onChange={handleEmailChange}
                            />
                            <input
                                type="password"
                                name="current_password"
                                placeholder={t("admin.settings.currentPasswordPlaceholder")}
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
                                        ? t("admin.settings.updatingEmail")
                                        : t("admin.settings.updateEmail")}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-settings-panel">
                        <div className="admin-settings-panel__header">
                            <h2>{t("admin.settings.passwordTitle")}</h2>
                            <p>{t("admin.settings.passwordDesc")}</p>
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
                                placeholder={t("admin.settings.currentPasswordLabel")}
                                value={passwordForm.current_password}
                                onChange={handlePasswordChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder={t("admin.settings.newPasswordLabel")}
                                value={passwordForm.password}
                                onChange={handlePasswordChange}
                            />
                            <input
                                type="password"
                                name="password_confirmation"
                                placeholder={t("admin.settings.confirmPasswordLabel")}
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
                                        ? t("admin.settings.updatingPassword")
                                        : t("admin.settings.updatePassword")}
                                </button>
                            </div>
                        </form>
                    </section>
                </>
            )}
        </main>
    );
}
