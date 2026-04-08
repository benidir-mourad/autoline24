import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

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
            const response = await api.post("/admin/login", form);
            localStorage.setItem("token", response.data.token);
            setMessage("Connexion réussie.");
            navigate("/admin/cars");
        } catch (error) {
            setMessage("Erreur de connexion.");
            console.error(error);
        }
    }

    return (
        <main className="page">
            <h1>Connexion admin</h1>

            <form className="filters" onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
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

                <button type="submit">Se connecter</button>
            </form>

            {message && <p>{message}</p>}
        </main>
    );
}