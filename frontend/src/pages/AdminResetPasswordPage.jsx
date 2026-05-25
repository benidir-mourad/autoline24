import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";

export default function AdminResetPasswordPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: searchParams.get("email") || "",
        token: searchParams.get("token") || "",
        password: "",
        password_confirmation: "",
    });
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const isPrefilled = useMemo(
        () => Boolean(form.email && form.token),
        [form.email, form.token]
    );

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setFeedback({ type: "", message: "" });
            const response = await api.post("/admin/renew", form);
            setFeedback({ type: "success", message: response.data.message });
            setTimeout(() => navigate("/admin/login", { replace: true }), 1200);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.email?.[0] ||
                    t("admin.reset.errorFallback"),
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <div className="page-backlinks">
                <Link to="/admin/login">{t("admin.reset.backToLogin")}</Link>
            </div>

            <section className="home-hero">
                <span className="page-eyebrow">{t("admin.reset.eyebrow")}</span>
                <h1>{t("admin.reset.title")}</h1>
                <p>
                    {isPrefilled
                        ? t("admin.reset.descPrefilled")
                        : t("admin.reset.descManual")}
                </p>

                <form className="filters" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("admin.reset.emailPlaceholder")}
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="token"
                        placeholder={t("admin.reset.tokenPlaceholder")}
                        value={form.token}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder={t("admin.reset.newPasswordPlaceholder")}
                        value={form.password}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password_confirmation"
                        placeholder={t("admin.reset.confirmPasswordPlaceholder")}
                        value={form.password_confirmation}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? t("admin.reset.saving") : t("admin.reset.submit")}
                    </button>
                </form>

                {feedback.message && (
                    <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                        {feedback.message}
                    </p>
                )}
            </section>
        </main>
    );
}
