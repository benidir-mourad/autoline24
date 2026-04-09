import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function AdminResetPasswordPage() {
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
            const response = await api.post("/admin/reset-password", form);
            setFeedback({ type: "success", message: response.data.message });
            setTimeout(() => navigate("/admin/login", { replace: true }), 1200);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation :", error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    error.response?.data?.errors?.email?.[0] ||
                    "Impossible de réinitialiser le mot de passe.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <div className="page-backlinks">
                <Link to="/admin/login">Retour à la connexion</Link>
            </div>

            <section className="home-hero">
                <span className="page-eyebrow">Admin</span>
                <h1>Réinitialiser le mot de passe</h1>
                <p>
                    {isPrefilled
                        ? "Définissez un nouveau mot de passe pour votre compte admin."
                        : "Renseignez votre e-mail, le token reçu et votre nouveau mot de passe."}
                </p>

                <form className="filters" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail admin"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="token"
                        placeholder="Token de réinitialisation"
                        value={form.token}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Nouveau mot de passe"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password_confirmation"
                        placeholder="Confirmation du mot de passe"
                        value={form.password_confirmation}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Enregistrement..." : "Réinitialiser"}
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
