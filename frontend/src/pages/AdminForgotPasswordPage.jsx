import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function AdminForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setFeedback({ type: "", message: "" });
            const response = await api.post("/admin/forgot-password", { email });
            setFeedback({ type: "success", message: response.data.message });
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
                    Saisissez l’adresse e-mail de votre compte admin pour recevoir un lien
                    de réinitialisation.
                </p>

                <form className="filters" onSubmit={handleSubmit}>
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
            </section>
        </main>
    );
}
