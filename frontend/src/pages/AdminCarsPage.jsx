import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/admin.css";

export default function AdminCarsPage() {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCars();
    }, []);

    async function fetchCars() {
        try {
            setLoading(true);
            const response = await api.get("/admin/cars");
            setCars(response.data ?? []);
        } catch (error) {
            console.error(error);
            navigate("/admin/login");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm("Supprimer cette voiture ?");

        if (!confirmed) return;

        try {
            await api.delete(`/admin/cars/${id}`);
            setCars((prev) => prev.filter((car) => car.id !== id));
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression.");
        }
    }

    async function handleLogout() {
        try {
            await api.post("/admin/logout");
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            navigate("/admin/login");
        }
    }

    return (
        <main className="page admin-page">
            <div className="admin-page__header">
                <h1>Administration - Voitures</h1>

                <div className="admin-page__actions">
                    <Link to="/admin/cars/create" className="admin-button">
                        Ajouter une voiture
                    </Link>

                    <button type="button" className="admin-button admin-button--secondary" onClick={handleLogout}>
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
                                <td>{Number(car.price).toLocaleString("fr-BE")} €</td>
                                <td>{car.status}</td>
                                <td>{car.publication_status}</td>
                                <td className="admin-table__actions">
                                    <Link to={`/admin/cars/${car.id}/edit`} className="admin-link">
                                        Modifier
                                    </Link>

                                    <button
                                        type="button"
                                        className="admin-link admin-link--danger"
                                        onClick={() => handleDelete(car.id)}
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
        </main>
    );
}