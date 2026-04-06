import { useEffect, useState } from "react";
import api from "../services/api";
import CarCard from "../components/CarCard";
import FilterBar from "../components/FilterBar";
import "../styles/cars.css";

export default function CarsPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        brand: "",
        min_price: "",
        max_price: "",
        fuel_type: "",
        search: "",
        min_year: "",
        max_mileage: "",
        sort: "",
    });

    useEffect(() => {
        fetchCars();
    }, []);

    async function fetchCars(customFilters = filters) {
        try {
            setLoading(true);
            const response = await api.get("/cars", { params: customFilters });
            setCars(response.data.data ?? []);
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
        fetchCars(filters);
    }

    return (
        <main className="page">
            <h1>Nos voitures</h1>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                onSubmit={handleSubmit}
            />

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <>
                    <p>{cars.length} voiture(s) trouvée(s).</p>

                    <section className="cars-grid">
                        {cars.length > 0 ? (
                            cars.map((car) => <CarCard key={car.id} car={car} />)
                        ) : (
                            <p>Aucune voiture trouvée.</p>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}