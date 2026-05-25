import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/admin.css";

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

export default function AdminCarsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [cars, setCars] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [carToDelete, setCarToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const fetchCars = useCallback(async (currentPage = 1) => {
        try {
            setLoading(true);
            const response = await api.get("/admin/cars", { params: { page: currentPage } });
            setCars(response.data.data ?? []);
            setPage(response.data.current_page ?? 1);
            setLastPage(response.data.last_page ?? 1);
            setTotal(response.data.total ?? 0);
        } catch (error) {
            console.error(error);
            navigate("/admin/login", { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCars(1);
    }, [fetchCars]);

    async function handleDeleteConfirm() {
        if (!carToDelete) return;

        try {
            setDeleteLoading(true);
            setFeedback({ type: "", message: "" });
            await api.delete(`/admin/cars/${carToDelete.id}`);
            setCars((prev) => prev.filter((car) => car.id !== carToDelete.id));
            setTotal((prev) => prev - 1);
            setFeedback({ type: "success", message: t("admin.carDeleted") });
            setCarToDelete(null);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: error.response?.data?.message || t("admin.deleteErrorFallback"),
            });
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleExportCars() {
        try {
            setExportLoading(true);
            const response = await api.get("/admin/exports/cars", {
                responseType: "blob",
            });
            downloadBlob(response.data, "autoline24-voitures.csv");
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: t("admin.exportErrorFallback"),
            });
        } finally {
            setExportLoading(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate("/admin/login", { replace: true });
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/admin">{t("admin.backToAdmin")}</Link>
                <Link to="/cars">{t("admin.backToSite")}</Link>
            </div>

            {feedback.message && (
                <p className={`admin-feedback admin-feedback--${feedback.type}`}>
                    {feedback.message}
                </p>
            )}

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>{t("admin.carsTitle")}</h1>
                    <p className="admin-page__subtitle">
                        {t("admin.carsSubtitle")}
                    </p>
                </div>

                <div className="admin-page__actions">
                    <Link to="/admin/settings" className="admin-button admin-button--secondary">
                        {t("admin.settings")}
                    </Link>

                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={handleExportCars}
                        disabled={exportLoading}
                    >
                        {exportLoading ? t("admin.exporting") : t("admin.exportCsv")}
                    </button>

                    <Link to="/admin/cars/create" className="admin-button">
                        {t("admin.addCar")}
                    </Link>

                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={handleLogout}
                    >
                        {t("admin.logout")}
                    </button>
                </div>
            </div>

            {loading ? (
                <p>{t("common.loading")}</p>
            ) : cars.length === 0 ? (
                <p>{t("admin.noCars")}</p>
            ) : (
                <>
                    <p className="admin-page__count">
                        {t("admin.carsCount", { total, page, lastPage })}
                    </p>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t("admin.tableId")}</th>
                                    <th>{t("admin.tableBrand")}</th>
                                    <th>{t("admin.tableModel")}</th>
                                    <th>{t("admin.tableYear")}</th>
                                    <th>{t("admin.tablePrice")}</th>
                                    <th>{t("admin.tableStatus")}</th>
                                    <th>{t("admin.tablePublication")}</th>
                                    <th>{t("admin.tableActions")}</th>
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
                                        <td>{t(`values.statuses.${car.status}`, { defaultValue: car.status })}</td>
                                        <td>{t(`values.publicationStatuses.${car.publication_status}`, { defaultValue: car.publication_status })}</td>
                                        <td className="admin-table__actions">
                                            <Link to={`/admin/cars/${car.id}/edit`} className="admin-link">
                                                {t("admin.editCar")}
                                            </Link>

                                            <button
                                                type="button"
                                                className="admin-link admin-link--danger"
                                                onClick={() => setCarToDelete(car)}
                                            >
                                                {t("admin.deleteCar")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {lastPage > 1 && (
                        <div className="cars-pagination">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => fetchCars(page - 1)}
                            >
                                {t("common.previous")}
                            </button>

                            <span>{t("common.page", { current: page, last: lastPage })}</span>

                            <button
                                type="button"
                                disabled={page === lastPage}
                                onClick={() => fetchCars(page + 1)}
                            >
                                {t("common.next")}
                            </button>
                        </div>
                    )}
                </>
            )}

            <ConfirmDialog
                open={Boolean(carToDelete)}
                title={t("admin.deleteCarTitle")}
                message={
                    carToDelete
                        ? t("admin.deleteCarMessage", { brand: carToDelete.brand, model: carToDelete.model })
                        : ""
                }
                confirmLabel={t("common.delete")}
                loading={deleteLoading}
                onCancel={() => setCarToDelete(null)}
                onConfirm={handleDeleteConfirm}
            />
        </main>
    );
}
