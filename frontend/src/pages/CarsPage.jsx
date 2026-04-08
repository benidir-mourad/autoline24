import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import CarCard from "../components/CarCard";
import FilterBar from "../components/FilterBar";
import "../styles/cars.css";

function getInitialFilters(searchParams) {
    return {
        search: searchParams.get("search") || "",
        brand: searchParams.get("brand") || "",
        min_price: searchParams.get("min_price") || "",
        max_price: searchParams.get("max_price") || "",
        min_year: searchParams.get("min_year") || "",
        max_mileage: searchParams.get("max_mileage") || "",
        fuel_type: searchParams.get("fuel_type") || "",
        sort: searchParams.get("sort") || "",
        option_ids: searchParams.getAll("option_ids") || [],
        per_page: searchParams.get("per_page") || 9,
    };
}

function getInitialPage(searchParams) {
    return Number(searchParams.get("page") || 1);
}

export default function CarsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [cars, setCars] = useState([]);
    const [options, setOptions] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const [meta, setMeta] = useState({
        total: 0,
        current_page: getInitialPage(searchParams),
        last_page: 1,
    });

    const [filters, setFilters] = useState(() => getInitialFilters(searchParams));

    useEffect(() => {
        fetchOptions();
        fetchBrands();
    }, []);

    useEffect(() => {
        const urlFilters = getInitialFilters(searchParams);
        const urlPage = getInitialPage(searchParams);

        setFilters(urlFilters);
        setMeta((prev) => ({
            ...prev,
            current_page: urlPage,
        }));
    }, [searchParams]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            updateUrlFromState(filters, meta.current_page);
            fetchCars(filters, meta.current_page);
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [filters, meta.current_page]);

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
            setMeta((prev) => ({
                ...prev,
                total: response.data.total ?? 0,
                current_page: response.data.current_page ?? 1,
                last_page: response.data.last_page ?? 1,
            }));
        } catch (error) {
            console.error("Erreur lors du chargement des voitures :", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchOptions() {
        try {
            const response = await api.get("/options");
            setOptions(response.data ?? []);
        } catch (error) {
            console.error("Erreur lors du chargement des options :", error);
        }
    }

    async function fetchBrands() {
        try {
            const response = await api.get("/brands");
            setBrands(response.data ?? []);
        } catch (error) {
            console.error("Erreur lors du chargement des marques :", error);
        }
    }

    function updateUrlFromState(currentFilters, currentPage = 1) {
        const params = new URLSearchParams();

        if (currentFilters.search) params.set("search", currentFilters.search);
        if (currentFilters.brand) params.set("brand", currentFilters.brand);
        if (currentFilters.min_price) params.set("min_price", currentFilters.min_price);
        if (currentFilters.max_price) params.set("max_price", currentFilters.max_price);
        if (currentFilters.min_year) params.set("min_year", currentFilters.min_year);
        if (currentFilters.max_mileage) params.set("max_mileage", currentFilters.max_mileage);
        if (currentFilters.fuel_type) params.set("fuel_type", currentFilters.fuel_type);
        if (currentFilters.sort) params.set("sort", currentFilters.sort);
        if (currentFilters.per_page) params.set("per_page", currentFilters.per_page);

        currentFilters.option_ids.forEach((id) => {
            params.append("option_ids", id);
        });

        if (currentPage > 1) {
            params.set("page", String(currentPage));
        }

        setSearchParams(params, { replace: true });
    }

    function handleFilterChange(event) {
        const { name, value, checked } = event.target;

        if (name === "option_ids") {
            setFilters((prev) => {
                let updated = [...prev.option_ids];

                if (checked) {
                    if (!updated.includes(String(value))) {
                        updated.push(String(value));
                    }
                } else {
                    updated = updated.filter((id) => id !== String(value));
                }

                return {
                    ...prev,
                    option_ids: updated,
                };
            });

            setMeta((prev) => ({
                ...prev,
                current_page: 1,
            }));

            return;
        }

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));

        setMeta((prev) => ({
            ...prev,
            current_page: 1,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
    }

    function handleReset() {
        setFilters({
            search: "",
            brand: "",
            min_price: "",
            max_price: "",
            min_year: "",
            max_mileage: "",
            fuel_type: "",
            sort: "",
            option_ids: [],
            per_page: 9,
        });

        setMeta((prev) => ({
            ...prev,
            current_page: 1,
            last_page: 1,
        }));

        setSearchParams({});
    }

    function handlePageChange(page) {
        setMeta((prev) => ({
            ...prev,
            current_page: page,
        }));

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="page cars-page">
            <div className="cars-page__header">
                <h1>Nos voitures</h1>
                <p>Découvrez notre sélection de véhicules d’occasion disponibles.</p>
            </div>

            <FilterBar
                filters={filters}
                options={options}
                brands={brands}
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