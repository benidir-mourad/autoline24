import "../styles/cars.css";

export default function FilterBar({ filters, onChange, onSubmit }) {
    return (
        <form className="filters" onSubmit={onSubmit}>
            <input
                type="text"
                name="search"
                placeholder="Recherche marque ou modèle"
                value={filters.search}
                onChange={onChange}
            />

            <input
                type="text"
                name="brand"
                placeholder="Marque"
                value={filters.brand}
                onChange={onChange}
            />

            <input
                type="number"
                name="min_price"
                placeholder="Prix min"
                value={filters.min_price}
                onChange={onChange}
            />

            <input
                type="number"
                name="max_price"
                placeholder="Prix max"
                value={filters.max_price}
                onChange={onChange}
            />

            <input
                type="number"
                name="min_year"
                placeholder="Année min"
                value={filters.min_year}
                onChange={onChange}
            />

            <input
                type="number"
                name="max_mileage"
                placeholder="Km max"
                value={filters.max_mileage}
                onChange={onChange}
            />

            <select name="fuel_type" value={filters.fuel_type} onChange={onChange}>
                <option value="">Carburant</option>
                <option value="Diesel">Diesel</option>
                <option value="Essence">Essence</option>
                <option value="Hybride">Hybride</option>
                <option value="Électrique">Électrique</option>
            </select>

            <select name="sort" value={filters.sort} onChange={onChange}>
                <option value="">Trier par</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="year_desc">Année récente</option>
                <option value="mileage_asc">Kilométrage croissant</option>
            </select>

            <button type="submit">Filtrer</button>
        </form>
    );
}