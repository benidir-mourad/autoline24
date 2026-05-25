import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import "../styles/admin.css";

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        navigate("/admin/login", { replace: true });
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <Link to="/cars">{t("admin.backToSite")}</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>{t("admin.dashboard.title")}</h1>
                    <p className="admin-page__subtitle">
                        {t("admin.dashboard.subtitle")}
                    </p>
                </div>

                <div className="admin-page__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={handleLogout}
                    >
                        {t("admin.logout")}
                    </button>
                </div>
            </div>

            <div className="admin-dashboard-shortcuts">
                <Link to="/admin/cars" className="admin-button admin-dashboard-shortcuts__button">
                    {t("admin.dashboard.cars")}
                </Link>
                <Link
                    to="/admin/settings"
                    className="admin-button admin-button--secondary admin-dashboard-shortcuts__button"
                >
                    {t("admin.dashboard.settings")}
                </Link>
            </div>

            <section className="admin-dashboard-grid">
                <Link to="/admin/cars" className="admin-dashboard-card">
                    <span className="admin-dashboard-card__eyebrow">{t("admin.dashboard.stockEyebrow")}</span>
                    <h2>{t("admin.dashboard.stockTitle")}</h2>
                    <p>{t("admin.dashboard.stockDesc")}</p>
                    <strong>{t("admin.dashboard.openCars")}</strong>
                </Link>

                <Link to="/admin/settings" className="admin-dashboard-card">
                    <span className="admin-dashboard-card__eyebrow">{t("admin.dashboard.configEyebrow")}</span>
                    <h2>{t("admin.dashboard.configTitle")}</h2>
                    <p>{t("admin.dashboard.configDesc")}</p>
                    <strong>{t("admin.dashboard.openSettings")}</strong>
                </Link>
            </section>
        </main>
    );
}
