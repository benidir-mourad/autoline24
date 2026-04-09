import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/admin.css";

const initialForm = {
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    contact_map_embed_url: "",
};

export default function AdminSettingsPage() {
    const { refreshContactSettings } = useSiteSettings();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    useEffect(() => {
        async function fetchSettings() {
            try {
                setLoading(true);
                const response = await api.get("/admin/settings/contact");
                setForm({
                    contact_phone: response.data.contact_phone || "",
                    contact_email: response.data.contact_email || "",
                    contact_address: response.data.contact_address || "",
                    contact_map_embed_url: response.data.contact_map_embed_url || "",
                });
            } catch (error) {
                console.error("Erreur lors du chargement des paramètres :", error);
                setFeedback({
                    type: "error",
                    message: "Impossible de charger les coordonnées du site.",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

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
            setSaving(true);
            setFeedback({ type: "", message: "" });
            await api.put("/admin/settings/contact", form);
            await refreshContactSettings();
            setFeedback({ type: "success", message: "Coordonnées enregistrées." });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des paramètres :", error);
            setFeedback({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Impossible d'enregistrer les coordonnées.",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/admin/cars">Retour à la liste admin</Link>
                <Link to="/contact">Voir la page contact</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>Paramètres de contact</h1>
                    <p className="admin-page__subtitle">
                        Gérez les coordonnées visibles sur le site et dans les fiches voiture.
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
                        placeholder="E-mail"
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
            )}
        </main>
    );
}
