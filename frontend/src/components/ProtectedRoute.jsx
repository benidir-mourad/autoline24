import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="page">
                <p>Verification de la session...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
