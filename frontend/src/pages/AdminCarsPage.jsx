import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/admin.css";

export default function AdminCarsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [carToDelete, setCarToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchCars = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/cars");
            setCars(response.data ?? []);
        } catch (error) {
            console.error(error);
            navigate("/admin/login", { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    async function handleDeleteConfirm() {
        if (!carToDelete) return;

        try {
            setDeleteLoading(true);
            setFeedback({ type: "", message: "" });
            await api.delete(`/admin/cars/${carToDelete.id}`);
            setCars((prev) => prev.filter((car) => car.id !== carToDelete.id));
            setFeedback({ type: "success", message: "Voiture supprimée." });
            setCarToDelete(null);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || "Erreur lors de la suppression.",
            });
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate("/admin/login", { replace: true });
    }

    return (
        <main className="page admin-page">
            {feedback.message && (
                <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                    {feedback.message}
                </p>
            )}

            <div className="admin-page__header">
                <h1>Administration - Voitures</h1>

                <div className="admin-page__actions">
                    <Link to="/admin/cars/create" className="admin-button">
                        Ajouter une voiture
                    </Link>

                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={handleLogout}
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Chargement...</p>
            ) : cars.length === 0 ? (
                <p>Aucune voiture enregistrée.</p>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Marque</th>
                                <th>Modèle</th>
                                <th>Année</th>
                                <th>Prix</th>
                                <th>Statut</th>
                                <th>Publication</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cars.map((car) => (
                                <tr key={car.id}>
                                    <td>{car.id}</td>
                                    <td>{car.brand}</td>
                                    <td>{car.model}</td>
                                    <td>{car.year}</td>
                                    <td>{Number(car.price).toLocaleString("fr-BE")} EUR</td>
                                    <td>{car.status}</td>
                                    <td>{car.publication_status}</td>
                                    <td className="admin-table__actions">
                                        <Link to={`/admin/cars/${car.id}/edit`} className="admin-link">
                                            Modifier
                                        </Link>

                                        <button
                                            type="button"
                                            className="admin-link admin-link--danger"
                                            onClick={() => setCarToDelete(car)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(carToDelete)}
                title="Supprimer cette voiture ?"
                message={
                    carToDelete
                        ? `La voiture ${carToDelete.brand} ${carToDelete.model} sera retirée définitivement.`
                        : ""
                }
                confirmLabel="Supprimer"
                loading={deleteLoading}
                onCancel={() => setCarToDelete(null)}
                onConfirm={handleDeleteConfirm}
            />
        </main>
    );
}
