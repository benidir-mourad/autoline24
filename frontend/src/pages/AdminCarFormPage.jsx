import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../services/api";
import "../styles/admin.css";

const initialForm = {
    brand: "",
    model: "",
    version: "",
    year: "",
    mileage: "",
    price: "",
    purchase_price: "",
    fuel_type: "Diesel",
    transmission: "Manuelle",
    power_hp: "",
    fiscal_power: "",
    engine_size: "",
    doors: "",
    seats: "",
    color: "",
    body_type: "",
    first_registration_date: "",
    description: "",
    status: "available",
    publication_status: "published",
    featured: false,
    reference: "",
};

export default function AdminCarFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(initialForm);
    const [images, setImages] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newOptionName, setNewOptionName] = useState("");

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [optionCreateLoading, setOptionCreateLoading] = useState(false);
    const [optionCreateMessage, setOptionCreateMessage] = useState("");
    const [optionCreateError, setOptionCreateError] = useState("");
    const [formFeedback, setFormFeedback] = useState({ type: "", message: "" });
    const [imageFeedback, setImageFeedback] = useState({ type: "", message: "" });
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: "",
        id: null,
        title: "",
        message: "",
    });
    const [confirmLoading, setConfirmLoading] = useState(false);

    function setScopedFeedback(setter, type, message) {
        setter({ type, message });
    }

    const fetchCar = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/cars/${id}`);
            const car = response.data;

            setForm({
                brand: car.brand || "",
                model: car.model || "",
                version: car.version || "",
                year: car.year || "",
                mileage: car.mileage || "",
                price: car.price || "",
                purchase_price: car.purchase_price || "",
                fuel_type: car.fuel_type || "Diesel",
                transmission: car.transmission || "Manuelle",
                power_hp: car.power_hp || "",
                fiscal_power: car.fiscal_power || "",
                engine_size: car.engine_size || "",
                doors: car.doors || "",
                seats: car.seats || "",
                color: car.color || "",
                body_type: car.body_type || "",
                first_registration_date: car.first_registration_date
                    ? String(car.first_registration_date).substring(0, 10)
                    : "",
                description: car.description || "",
                status: car.status || "available",
                publication_status: car.publication_status || "published",
                featured: Boolean(car.featured),
                reference: car.reference || "",
            });
        } catch (error) {
            console.error(error);
            navigate("/admin/cars");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchImages = useCallback(async () => {
        try {
            const response = await api.get(`/admin/cars/${id}/images`);
            setImages(response.data.images ?? []);
        } catch (error) {
            console.error("Erreur lors du chargement des images :", error);
        }
    }, [id]);

    const fetchAllOptions = useCallback(async () => {
        try {
            const response = await api.get("/admin/options");
            setOptions(response.data ?? []);
        } catch (error) {
            console.error("Erreur lors du chargement des options :", error);
        }
    }, []);

    const fetchCarOptions = useCallback(async () => {
        try {
            const response = await api.get(`/admin/cars/${id}/options`);
            const carOptions = response.data.options ?? [];
            setSelectedOptionIds(carOptions.map((option) => String(option.id)));
        } catch (error) {
            console.error("Erreur lors du chargement des options de la voiture :", error);
        }
    }, [id]);

    useEffect(() => {
        fetchAllOptions();

        if (isEdit) {
            fetchCar();
            fetchImages();
            fetchCarOptions();
        }
    }, [fetchAllOptions, fetchCar, fetchCarOptions, fetchImages, isEdit]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
    }

    function handleOptionToggle(optionId) {
        setSelectedOptionIds((prev) => {
            const stringId = String(optionId);

            if (prev.includes(stringId)) {
                return prev.filter((currentId) => currentId !== stringId);
            }

            return [...prev, stringId];
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setScopedFeedback(setFormFeedback, "", "");
            const payload = {
                ...form,
                featured: form.featured ? 1 : 0,
            };

            let carId = id;

            if (isEdit) {
                await api.put(`/admin/cars/${id}`, payload);
            } else {
                const response = await api.post("/admin/cars", payload);
                carId = response.data.car.id;
            }

            if (selectedOptionIds.length > 0 || isEdit) {
                await api.put(`/admin/cars/${carId}/options`, {
                    option_ids: selectedOptionIds.map((optionId) => Number(optionId)),
                });
            }

            navigate("/admin/cars");
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setFormFeedback,
                "error",
                error.response?.data?.message || "Erreur lors de l'enregistrement."
            );
        }
    }

    async function handleCreateOption(event) {
        event.preventDefault();

        const trimmedName = newOptionName.trim();

        if (!trimmedName) {
            setOptionCreateError("Entrez un nom d'option.");
            setOptionCreateMessage("");
            return;
        }

        try {
            setOptionCreateLoading(true);
            setOptionCreateError("");
            setOptionCreateMessage("");

            const response = await api.post("/admin/options", {
                name: trimmedName,
            });

            const createdOption = response.data.option;

            setOptions((prev) =>
                [...prev, createdOption].sort((a, b) => a.name.localeCompare(b.name, "fr"))
            );
            setSelectedOptionIds((prev) => {
                const nextId = String(createdOption.id);
                return prev.includes(nextId) ? prev : [...prev, nextId];
            });
            setNewOptionName("");
            setOptionCreateMessage("Option créée et sélectionnée.");
        } catch (error) {
            console.error("Erreur lors de la creation de l'option :", error);
            setOptionCreateMessage("");
            setOptionCreateError(
                error.response?.data?.message || "Impossible de creer cette option."
            );
        } finally {
            setOptionCreateLoading(false);
        }
    }

    async function handleDeleteOption(optionId) {
        try {
            setConfirmLoading(true);
            setOptionCreateError("");
            setOptionCreateMessage("");

            await api.delete(`/admin/options/${optionId}`);

            setOptions((prev) => prev.filter((option) => option.id !== optionId));
            setSelectedOptionIds((prev) => prev.filter((value) => value !== String(optionId)));
            setOptionCreateMessage("Option supprimée.");
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'option :", error);
            setOptionCreateError("Impossible de supprimer cette option.");
        } finally {
            setConfirmLoading(false);
        }
    }

    async function handleImageUpload() {
        if (!selectedFile || !id) return;

        try {
            setImageLoading(true);
            setScopedFeedback(setImageFeedback, "", "");

            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("is_main", images.length === 0 ? "1" : "0");
            formData.append("sort_order", String(images.length));

            await api.post(`/admin/cars/${id}/images`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSelectedFile(null);
            await fetchImages();
            setScopedFeedback(setImageFeedback, "success", "Image ajoutée avec succès.");
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || "Erreur lors de l'upload de l'image."
            );
        } finally {
            setImageLoading(false);
        }
    }

    async function handleSetMain(imageId) {
        try {
            setScopedFeedback(setImageFeedback, "", "");
            await api.patch(`/admin/images/${imageId}/set-main`);
            await fetchImages();
            setScopedFeedback(setImageFeedback, "success", "Image principale mise à jour.");
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || "Erreur lors du changement d'image principale."
            );
        }
    }

    async function handleDeleteImage(imageId) {
        try {
            setConfirmLoading(true);
            setScopedFeedback(setImageFeedback, "", "");
            await api.delete(`/admin/images/${imageId}`);
            await fetchImages();
            setScopedFeedback(setImageFeedback, "success", "Image supprimée.");
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || "Erreur lors de la suppression de l'image."
            );
        } finally {
            setConfirmLoading(false);
        }
    }

    function openDeleteOptionConfirm(option) {
        setConfirmState({
            open: true,
            type: "option",
            id: option.id,
            title: "Supprimer cette option ?",
            message: `L'option ${option.name} sera retirée de toutes les voitures.`,
        });
    }

    function openDeleteImageConfirm(image) {
        setConfirmState({
            open: true,
            type: "image",
            id: image.id,
            title: "Supprimer cette image ?",
            message: "Cette image sera retirée définitivement du véhicule.",
        });
    }

    function closeConfirmDialog() {
        if (confirmLoading) return;

        setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
    }

    function handleConfirmAction() {
        if (confirmState.type === "option") {
            handleDeleteOption(confirmState.id);
            return;
        }

        if (confirmState.type === "image") {
            handleDeleteImage(confirmState.id);
        }
    }

    async function handleSaveOptionsOnly() {
        if (!id) return;

        try {
            setOptionsLoading(true);
            setOptionCreateError("");
            setOptionCreateMessage("");

            await api.put(`/admin/cars/${id}/options`, {
                option_ids: selectedOptionIds.map((optionId) => Number(optionId)),
            });

            setOptionCreateMessage("Options mises à jour avec succès.");
        } catch (error) {
            console.error(error);
            setOptionCreateError(
                error.response?.data?.message || "Erreur lors de la mise a jour des options."
            );
        } finally {
            setOptionsLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="page">
                <p>Chargement...</p>
            </main>
        );
    }

    return (
        <main className="page admin-page">
            <h1>{isEdit ? "Modifier une voiture" : "Ajouter une voiture"}</h1>

            {formFeedback.message && (
                <p className={`admin-feedback admin-feedback--${formFeedback.type}`}>
                    {formFeedback.message}
                </p>
            )}

            <form className="admin-form" onSubmit={handleSubmit}>
                <input name="brand" placeholder="Marque" value={form.brand} onChange={handleChange} />
                <input name="model" placeholder="Modèle" value={form.model} onChange={handleChange} />
                <input name="version" placeholder="Version" value={form.version} onChange={handleChange} />
                <input name="year" type="number" placeholder="Année" value={form.year} onChange={handleChange} />
                <input name="mileage" type="number" placeholder="Kilométrage" value={form.mileage} onChange={handleChange} />
                <input name="price" type="number" placeholder="Prix" value={form.price} onChange={handleChange} />
                <input name="purchase_price" type="number" placeholder="Prix d'achat" value={form.purchase_price} onChange={handleChange} />

                <select name="fuel_type" value={form.fuel_type} onChange={handleChange}>
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                </select>

                <select name="transmission" value={form.transmission} onChange={handleChange}>
                    <option value="Manuelle">Manuelle</option>
                    <option value="Automatique">Automatique</option>
                </select>

                <input name="power_hp" type="number" placeholder="Puissance (ch)" value={form.power_hp} onChange={handleChange} />
                <input name="fiscal_power" type="number" placeholder="Puissance fiscale" value={form.fiscal_power} onChange={handleChange} />
                <input name="engine_size" type="number" placeholder="Cylindrée" value={form.engine_size} onChange={handleChange} />
                <input name="doors" type="number" placeholder="Portes" value={form.doors} onChange={handleChange} />
                <input name="seats" type="number" placeholder="Places" value={form.seats} onChange={handleChange} />
                <input name="color" placeholder="Couleur" value={form.color} onChange={handleChange} />
                <input name="body_type" placeholder="Carrosserie" value={form.body_type} onChange={handleChange} />
                <input name="first_registration_date" type="date" value={form.first_registration_date} onChange={handleChange} />
                <input name="reference" placeholder="Référence" value={form.reference} onChange={handleChange} />

                <select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Disponible</option>
                    <option value="reserved">Réservée</option>
                    <option value="sold">Vendue</option>
                </select>

                <select name="publication_status" value={form.publication_status} onChange={handleChange}>
                    <option value="published">Publiée</option>
                    <option value="draft">Brouillon</option>
                </select>

                <label className="admin-checkbox">
                    <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={handleChange}
                    />
                    <span>Mettre en avant</span>
                </label>

                <textarea
                    name="description"
                    placeholder="Description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                />

                <div className="admin-form__actions">
                    <button type="submit" className="admin-button">
                        {isEdit ? "Enregistrer les modifications" : "Ajouter la voiture"}
                    </button>
                </div>
            </form>

            <section className="admin-options-section">
                <div className="admin-options-section__header">
                    <h2>Options</h2>

                    {isEdit && (
                        <button
                            type="button"
                            className="admin-button"
                            onClick={handleSaveOptionsOnly}
                            disabled={optionsLoading}
                        >
                            {optionsLoading ? "Enregistrement..." : "Mettre à jour les options"}
                        </button>
                    )}
                </div>

                <form className="admin-option-create" onSubmit={handleCreateOption}>
                    <input
                        type="text"
                        value={newOptionName}
                        onChange={(event) => setNewOptionName(event.target.value)}
                        placeholder="Nouvelle option"
                    />

                    <button type="submit" className="admin-button" disabled={optionCreateLoading}>
                        {optionCreateLoading ? "Création..." : "Créer l'option"}
                    </button>
                </form>

                {optionCreateMessage && (
                    <p className="admin-feedback admin-feedback--success">{optionCreateMessage}</p>
                )}

                {optionCreateError && (
                    <p className="admin-feedback admin-feedback--error">{optionCreateError}</p>
                )}

                {options.length > 0 ? (
                    <div className="admin-options-grid">
                        {options.map((option) => (
                            <div key={option.id} className="admin-option-item">
                                <label className="admin-option-item__label">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptionIds.includes(String(option.id))}
                                        onChange={() => handleOptionToggle(option.id)}
                                    />
                                    <span>{option.name}</span>
                                </label>

                                <button
                                    type="button"
                                    className="admin-link admin-link--danger"
                                    onClick={() => openDeleteOptionConfirm(option)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Aucune option disponible.</p>
                )}
            </section>

            {isEdit && (
                <section className="admin-images-section">
                    <h2>Images</h2>

                    {imageFeedback.message && (
                        <p className={`admin-feedback admin-feedback--${imageFeedback.type}`}>
                            {imageFeedback.message}
                        </p>
                    )}

                    <div className="admin-images-upload">
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        <button
                            type="button"
                            className="admin-button"
                            onClick={handleImageUpload}
                            disabled={!selectedFile || imageLoading}
                        >
                            {imageLoading ? "Upload..." : "Ajouter l'image"}
                        </button>
                    </div>

                    {images.length > 0 ? (
                        <div className="admin-images-grid">
                            {images.map((image) => (
                                <div key={image.id} className="admin-image-card">
                                    <img
                                        src={image.image_url}
                                        alt="Voiture"
                                        className="admin-image-card__img"
                                    />

                                    <div className="admin-image-card__actions">
                                        {image.is_main ? (
                                            <span className="admin-image-card__badge">Principale</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="admin-link"
                                                onClick={() => handleSetMain(image.id)}
                                            >
                                                Définir principale
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="admin-link admin-link--danger"
                                            onClick={() => openDeleteImageConfirm(image)}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Aucune image ajoutée.</p>
                    )}
                </section>
            )}

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel="Supprimer"
                loading={confirmLoading}
                onCancel={closeConfirmDialog}
                onConfirm={handleConfirmAction}
            />
        </main>
    );
}
