import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminForgotPasswordPage from "./pages/AdminForgotPasswordPage";
import AdminResetPasswordPage from "./pages/AdminResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCarsPage from "./pages/AdminCarsPage";
import AdminCarFormPage from "./pages/AdminCarFormPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminRoute && <Navbar />}
            <Routes>
                <Route path="/" element={<Navigate to="/cars" replace />} />
                <Route path="/cars" element={<CarsPage />} />
                <Route path="/cars/:id" element={<CarDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />

                <Route element={<PublicOnlyRoute />}>
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                    <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/cars" element={<AdminCarsPage />} />
                    <Route path="/admin/cars/create" element={<AdminCarFormPage />} />
                    <Route path="/admin/cars/:id/edit" element={<AdminCarFormPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>
            </Routes>
            {!isAdminRoute && <Footer />}
        </>
    );
}
