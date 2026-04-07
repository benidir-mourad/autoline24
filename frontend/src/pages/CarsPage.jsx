import { useEffect, useState } from "react";
import api from "../services/api";
import CarCard from "../components/CarCard";
import FilterBar from "../components/FilterBar";
import "../styles/cars.css";

export default function CarsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({
        total: 0,
        current_page: 1,
        last_page: 1,
    });

    const [filters, setFilters] = useState({
        search: "",
        brand: "",
        min_price: "",
        max_price: "",
        min_year: "",
        max_mileage: "",
        fuel_type: "",
        sort: "",
        per_page: 9,
    });

    useEffect(() => {
        fetchCars();
    }, []);

    async function fetchCars(customFilters = filters, page = 1) {
        try {
            setLoading(true);

            const response = await api.get("/cars", {
                params: {
                    ...customFilters,
                    page,
                },
            });

            setCars(response.data.data ?? []);
            setMeta({
                total: response.data.total ?? 0,
                current_page: response.data.current_page ?? 1,
                last_page: response.data.last_page ?? 1,
            });
        } catch (error) {
            console.error("Erreur lors du chargement des voitures :", error);
        } finally {
            setLoading(false);
        }
    }

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        fetchCars(filters, 1);
    }

    function handleReset() {
        const resetFilters = {
            search: "",
            brand: "",
            min_price: "",
            max_price: "",
            min_year: "",
            max_mileage: "",
            fuel_type: "",
            sort: "",
            per_page: 9,
        };

        setFilters(resetFilters);
        fetchCars(resetFilters, 1);
    }

    function handlePageChange(page) {
        fetchCars(filters, page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="page cars-page">
            <div className="cars-page__header">
                <h1>Nos voitures</h1>
                <p>
                    Découvrez notre sélection de véhicules d’occasion disponibles.
                </p>
            </div>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
            />

            <div className="cars-page__results">
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <p>
                        <strong>{meta.total}</strong> voiture(s) trouvée(s)
                    </p>
                )}
            </div>

            {!loading && (
                <section className="cars-grid">
                    {cars.length > 0 ? (
                        cars.map((car) => <CarCard key={car.id} car={car} />)
                    ) : (
                        <div className="cars-page__empty">
                            <p>Aucune voiture ne correspond à votre recherche.</p>
                        </div>
                    )}
                </section>
            )}

            {!loading && meta.last_page > 1 && (
                <div className="cars-pagination">
                    <button
                        type="button"
                        disabled={meta.current_page === 1}
                        onClick={() => handlePageChange(meta.current_page - 1)}
                    >
                        Précédent
                    </button>

                    <span>
            Page {meta.current_page} / {meta.last_page}
          </span>

                    <button
                        type="button"
                        disabled={meta.current_page === meta.last_page}
                        onClick={() => handlePageChange(meta.current_page + 1)}
                    >
                        Suivant
                    </button>
                </div>
            )}
        </main>
    );
}