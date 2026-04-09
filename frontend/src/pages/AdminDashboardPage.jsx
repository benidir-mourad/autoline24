import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/admin.css";

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        navigate("/admin/login", { replace: true });
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/cars">Retour au site</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>Administration</h1>
                    <p className="admin-page__subtitle">
                        Choisissez votre espace de travail avant de continuer.
                    </p>
                </div>

                <div className="admin-page__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={handleLogout}
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            <section className="admin-dashboard-grid">
                <Link to="/admin/cars" className="admin-dashboard-card">
                    <span className="admin-dashboard-card__eyebrow">Stock</span>
                    <h2>Gestion des voitures</h2>
                    <p>
                        Ajouter, modifier et suivre les véhicules, les images, les options
                        et les frais.
                    </p>
                    <strong>Ouvrir l’espace voitures</strong>
                </Link>

                <Link to="/admin/settings" className="admin-dashboard-card">
                    <span className="admin-dashboard-card__eyebrow">Configuration</span>
                    <h2>Paramètres</h2>
                    <p>
                        Modifier les coordonnées du vendeur, l’adresse, la carte et le
                        numéro de TVA.
                    </p>
                    <strong>Ouvrir les paramètres</strong>
                </Link>
            </section>
        </main>
    );
}
