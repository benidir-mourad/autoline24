import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminLoginPage() {
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
            setMessage("Connexion réussie.");
            navigate(location.state?.from?.pathname || "/admin", { replace: true });
        } catch (error) {
            setMessage("Erreur de connexion.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <section className="home-hero">
                <span className="page-eyebrow">Admin</span>
                <h1>Connexion admin</h1>

                <form className="filters admin-login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className="page-backlinks admin-login-links">
                    <Link to="/admin/forgot-password">Mot de passe oublié ?</Link>
                    <Link to="/cars">Retour au site</Link>
                </div>

                {message && <p>{message}</p>}
            </section>
        </main>
    );
}
