import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export default function AdminLoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            setMessage("");
            await login(form);
            setMessage(t("admin.login.successMessage"));
            navigate(location.state?.from?.pathname || "/admin", { replace: true });
        } catch (error) {
            setMessage(t("admin.login.errorMessage"));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <section className="home-hero">
                <span className="page-eyebrow">{t("admin.login.eyebrow")}</span>
                <h1>{t("admin.login.title")}</h1>

                <form className="filters admin-login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("admin.login.emailPlaceholder")}
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder={t("admin.login.passwordPlaceholder")}
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? t("admin.login.loading") : t("admin.login.submit")}
                    </button>
                </form>

                <div className="page-backlinks admin-login-links">
                    <Link to="/admin/recover">{t("admin.login.forgotPassword")}</Link>
                    <Link to="/cars">{t("admin.login.backToSite")}</Link>
                </div>

                {message && <p>{message}</p>}
            </section>
        </main>
    );
}
