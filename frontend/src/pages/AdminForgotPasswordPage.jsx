import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function AdminForgotPasswordPage() {
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
            const response = await api.post("/admin/forgot-password", { email });
            setFeedback({ type: "success", message: response.data.message });
            setDebugResetUrl(response.data.debug_reset_url || "");
        } catch (error) {
            console.error("Erreur lors de la demande de réinitialisation :", error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Impossible de lancer la réinitialisation.",
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
                <h1>Mot de passe oublié</h1>
                <p>
                    Saisissez l'adresse e-mail de votre compte admin pour recevoir un lien
                    de réinitialisation.
                </p>

                <form className="filters admin-login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail admin"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Envoi..." : "Envoyer le lien"}
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
                            Ouvrir le lien de réinitialisation
                        </a>
                    </div>
                )}
            </section>
        </main>
    );
}