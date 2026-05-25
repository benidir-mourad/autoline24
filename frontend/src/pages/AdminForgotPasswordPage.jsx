import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";

export default function AdminForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [debugResetUrl, setDebugResetUrl] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setFeedback({ type: "", message: "" });
            setDebugResetUrl("");
            const response = await api.post("/admin/recover", { email });
            setFeedback({ type: "success", message: response.data.message });
            setDebugResetUrl(response.data.debug_reset_url || "");
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    t("admin.recover.errorFallback"),
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <div className="page-backlinks">
                <Link to="/admin/login">{t("admin.recover.backToLogin")}</Link>
            </div>

            <section className="home-hero">
                <span className="page-eyebrow">{t("admin.recover.eyebrow")}</span>
                <h1>{t("admin.recover.title")}</h1>
                <p>{t("admin.recover.description")}</p>

                <form className="filters admin-login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("admin.recover.emailPlaceholder")}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? t("admin.recover.sending") : t("admin.recover.submit")}
                    </button>
                </form>

                {feedback.message && (
                    <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                        {feedback.message}
                    </p>
                )}

                {debugResetUrl && (
                    <div className="page-actions">
                        <a href={debugResetUrl} className="page-button page-button--secondary">
                            {t("admin.recover.openResetLink")}
                        </a>
                    </div>
                )}
            </section>
        </main>
    );
}
