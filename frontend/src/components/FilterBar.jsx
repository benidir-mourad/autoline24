import "../styles/cars.css";

export default function FilterBar({ filters, onChange, onSubmit, onReset }) {
    return (
        <form className="filters filters--card" onSubmit={onSubmit}>
            <div className="filters__group filters__group--full">
                <label htmlFor="search">Recherche</label>
                <input
                    id="search"
                    type="text"
                    name="search"
                    placeholder="Marque ou modèle"
                    value={filters.search}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="brand">Marque</label>
                <input
                    id="brand"
                    type="text"
                    name="brand"
                    placeholder="Ex: Volkswagen"
                    value={filters.brand}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="fuel_type">Carburant</label>
                <select
                    id="fuel_type"
                    name="fuel_type"
                    value={filters.fuel_type}
                    onChange={onChange}
                >
                    <option value="">Tous</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                </select>
            </div>

            <div className="filters__group">
                <label htmlFor="min_price">Prix min</label>
                <input
                    id="min_price"
                    type="number"
                    name="min_price"
                    placeholder="0"
                    value={filters.min_price}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="max_price">Prix max</label>
                <input
                    id="max_price"
                    type="number"
                    name="max_price"
                    placeholder="30000"
                    value={filters.max_price}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="min_year">Année min</label>
                <input
                    id="min_year"
                    type="number"
                    name="min_year"
                    placeholder="2018"
                    value={filters.min_year}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="max_mileage">Km max</label>
                <input
                    id="max_mileage"
                    type="number"
                    name="max_mileage"
                    placeholder="100000"
                    value={filters.max_mileage}
                    onChange={onChange}
                />
            </div>

            <div className="filters__group">
                <label htmlFor="sort">Tri</label>
                <select id="sort" name="sort" value={filters.sort} onChange={onChange}>
                    <option value="">Par défaut</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                    <option value="year_desc">Année récente</option>
                    <option value="mileage_asc">Kilométrage croissant</option>
                </select>
            </div>

            <div className="filters__group">
                <label htmlFor="per_page">Résultats</label>
                <select
                    id="per_page"
                    name="per_page"
                    value={filters.per_page}
                    onChange={onChange}
                >
                    <option value="6">6</option>
                    <option value="9">9</option>
                    <option value="12">12</option>
                </select>
            </div>

            <div className="filters__actions">
                <button type="submit">Filtrer</button>
                <button
                    type="button"
                    className="filters__reset"
                    onClick={onReset}
                >
                    Réinitialiser
                </button>
            </div>
        </form>
    );
}