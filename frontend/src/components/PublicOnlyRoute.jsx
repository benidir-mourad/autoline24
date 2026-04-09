import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicOnlyRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="page">
                <p>Verification de la session...</p>
            </main>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}
