import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/cars.css";

export default function FilterBar({
    filters,
    options,
    brands,
    onChange,
    onSubmit,
    onReset,
}) {
    const [open, setOpen] = useState(false);
    const [optionSearch, setOptionSearch] = useState("");
    const dropdownRef = useRef();

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!optionSearch.trim()) return options;

        return options.filter((option) =>
            option.name.toLowerCase().includes(optionSearch.toLowerCase())
        );
    }, [options, optionSearch]);

    const selectedOptions = useMemo(() => {
        return options.filter((option) =>
            filters.option_ids.includes(String(option.id))
        );
    }, [options, filters.option_ids]);

    function removeSelectedOption(optionId) {
        const fakeEvent = {
            target: {
                name: "option_ids",
                value: String(optionId),
                checked: false,
            },
        };

        onChange(fakeEvent);
    }

    function clearAllOptions() {
        filters.option_ids.forEach((id) => {
            const fakeEvent = {
                target: {
                    name: "option_ids",
                    value: id,
                    checked: false,
                },
            };

            onChange(fakeEvent);
        });
    }

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
                <select
                    id="brand"
                    name="brand"
                    value={filters.brand}
                    onChange={onChange}
                >
                    <option value="">Toutes</option>
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
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
                <select
                    id="sort"
                    name="sort"
                    value={filters.sort}
                    onChange={onChange}
                >
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

            <div className="filters__group filters__group--full" ref={dropdownRef}>
                <div className="filters__label-row">
                    <label>Options</label>

                    {filters.option_ids.length > 0 && (
                        <button
                            type="button"
                            className="filters__clear-link"
                            onClick={clearAllOptions}
                        >
                            Tout effacer
                        </button>
                    )}
                </div>

                <div className="dropdown">
                    <button
                        type="button"
                        className="dropdown__button"
                        onClick={() => setOpen(!open)}
                    >
                        {filters.option_ids.length > 0
                            ? `${filters.option_ids.length} option(s) sélectionnée(s)`
                            : "Toutes les options"}
                    </button>

                    {open && (
                        <div className="dropdown__menu">
                            <input
                                type="text"
                                className="dropdown__search"
                                placeholder="Rechercher une option..."
                                value={optionSearch}
                                onChange={(e) => setOptionSearch(e.target.value)}
                            />

                            <div className="dropdown__list">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <label key={option.id} className="dropdown__item">
                                            <input
                                                type="checkbox"
                                                name="option_ids"
                                                value={option.id}
                                                checked={filters.option_ids.includes(String(option.id))}
                                                onChange={onChange}
                                            />
                                            {option.name}
                                        </label>
                                    ))
                                ) : (
                                    <p className="dropdown__empty">Aucune option trouvée.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {selectedOptions.length > 0 && (
                    <div className="filters__chips">
                        {selectedOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className="filters__chip"
                                onClick={() => removeSelectedOption(option.id)}
                            >
                                {option.name} <span>×</span>
                            </button>
                        ))}
                    </div>
                )}
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
