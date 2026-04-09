import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import HomePage from "./pages/HomePage";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminCarsPage from "./pages/AdminCarsPage";
import AdminCarFormPage from "./pages/AdminCarFormPage";

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminRoute && <Navbar />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cars" element={<CarsPage />} />
                <Route path="/cars/:id" element={<CarDetailPage />} />

                <Route element={<PublicOnlyRoute />}>
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/admin/cars" element={<AdminCarsPage />} />
                    <Route path="/admin/cars/create" element={<AdminCarFormPage />} />
                    <Route path="/admin/cars/:id/edit" element={<AdminCarFormPage />} />
                </Route>
            </Routes>
        </>
    );
}
