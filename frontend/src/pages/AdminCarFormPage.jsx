import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../services/api";
import "../styles/admin.css";

const expenseCategories = [
    "Technique",
    "Esthétique",
    "Administratif",
    "Logistique",
    "Commercial",
];

const suggestedExpenses = [
    { category: "Technique", expense_type: "Entretien" },
    { category: "Technique", expense_type: "Vidange" },
    { category: "Technique", expense_type: "Pneus" },
    { category: "Technique", expense_type: "Freins" },
    { category: "Technique", expense_type: "Distribution" },
    { category: "Administratif", expense_type: "Contrôle technique" },
    { category: "Esthétique", expense_type: "Préparation" },
    { category: "Esthétique", expense_type: "Nettoyage" },
    { category: "Administratif", expense_type: "Carte grise" },
    { category: "Logistique", expense_type: "Transport" },
];

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

const initialExpenseForm = {
    category: suggestedExpenses[0].category,
    expense_type: suggestedExpenses[0].expense_type,
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    description: "",
};

function formatCurrency(value) {
    return new Intl.NumberFormat("fr-BE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return "Date non renseignée";

    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
    }).format(new Date(value));
}

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

export default function AdminCarFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState(initialForm);
    const [carSummary, setCarSummary] = useState(null);
    const [images, setImages] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [newOptionName, setNewOptionName] = useState("");
    const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [expenseFilterCategory, setExpenseFilterCategory] = useState("all");

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [optionCreateLoading, setOptionCreateLoading] = useState(false);
    const [expensesLoading, setExpensesLoading] = useState(false);
    const [expenseCreateLoading, setExpenseCreateLoading] = useState(false);
    const [optionCreateMessage, setOptionCreateMessage] = useState("");
    const [optionCreateError, setOptionCreateError] = useState("");
    const [formFeedback, setFormFeedback] = useState({ type: "", message: "" });
    const [imageFeedback, setImageFeedback] = useState({ type: "", message: "" });
    const [expenseFeedback, setExpenseFeedback] = useState({ type: "", message: "" });
    const [expenseExportLoading, setExpenseExportLoading] = useState(false);
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: "",
        id: null,
        title: "",
        message: "",
    });
    const [confirmLoading, setConfirmLoading] = useState(false);

    const previewUrl = useMemo(() => {
        if (!selectedFile) return "";
        return URL.createObjectURL(selectedFile);
    }, [selectedFile]);

    const financialSummary = useMemo(() => {
        const purchasePrice = Number(carSummary?.purchase_price ?? form.purchase_price ?? 0);
        const salePrice = Number(carSummary?.price ?? form.price ?? 0);
        const totalExpenses = Number(carSummary?.total_expenses ?? 0);
        const totalInvestment =
            Number(carSummary?.total_investment ?? purchasePrice + totalExpenses);
        const estimatedMargin =
            Number(carSummary?.estimated_margin ?? salePrice - totalInvestment);

        return {
            purchasePrice,
            salePrice,
            totalExpenses,
            totalInvestment,
            estimatedMargin,
        };
    }, [carSummary, form.price, form.purchase_price]);

    const mainImage = useMemo(
        () => images.find((image) => image.is_main) ?? images[0] ?? null,
        [images]
    );

    const expenseTotalsByCategory = useMemo(
        () =>
            expenseCategories.map((category) => ({
                category,
                total: expenses
                    .filter((expense) => expense.category === category)
                    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
            })),
        [expenses]
    );

    const filteredExpenses = useMemo(() => {
        if (expenseFilterCategory === "all") return expenses;
        return expenses.filter((expense) => expense.category === expenseFilterCategory);
    }, [expenseFilterCategory, expenses]);

    const selectedOptions = useMemo(
        () =>
            options.filter((option) =>
                selectedOptionIds.includes(String(option.id))
            ),
        [options, selectedOptionIds]
    );

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function setScopedFeedback(setter, type, message) {
        setter({ type, message });
    }

    const fetchCar = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/cars/${id}`);
            const car = response.data;

            setCarSummary(car);
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
                    ? String(car.first_registration_date).slice(0, 10)
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

    const fetchExpenses = useCallback(async () => {
        try {
            setExpensesLoading(true);
            const response = await api.get(`/admin/cars/${id}/expenses`);
            const totalExpenses = Number(response.data.total_expenses ?? 0);

            setExpenses(response.data.expenses ?? []);
            setCarSummary((prev) =>
                prev
                    ? {
                          ...prev,
                          total_expenses: totalExpenses,
                          total_investment: Number(prev.purchase_price ?? 0) + totalExpenses,
                          estimated_margin:
                              Number(prev.price ?? 0) -
                              (Number(prev.purchase_price ?? 0) + totalExpenses),
                      }
                    : prev
            );
        } catch (error) {
            console.error("Erreur lors du chargement des frais :", error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                "Impossible de charger les frais de ce véhicule."
            );
        } finally {
            setExpensesLoading(false);
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
            console.error("Erreur lors du chargement des options du véhicule :", error);
        }
    }, [id]);

    useEffect(() => {
        fetchAllOptions();

        if (isEdit) {
            fetchCar();
            fetchImages();
            fetchCarOptions();
            fetchExpenses();
        }
    }, [fetchAllOptions, fetchCar, fetchCarOptions, fetchExpenses, fetchImages, isEdit]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleExpenseChange(event) {
        const { name, value } = event.target;

        setExpenseForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleExpenseSuggestionSelect(suggestion) {
        setExpenseForm((prev) => ({
            ...prev,
            category: suggestion.category,
            expense_type: suggestion.expense_type,
        }));
    }

    function updateSelectedFile(file) {
        if (!file) return;

        setSelectedFile(file);
        setScopedFeedback(setImageFeedback, "", "");
        setIsDragOver(false);
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0] || null;
        updateSelectedFile(file);
    }

    function handleDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0] || null;
        updateSelectedFile(file);
    }

    function handleDragOver(event) {
        event.preventDefault();
        setIsDragOver(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setIsDragOver(false);
    }

    function clearSelectedFile() {
        setSelectedFile(null);
        setIsDragOver(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                const response = await api.put(`/admin/cars/${id}`, payload);
                setCarSummary(response.data.car ?? null);
            } else {
                const response = await api.post("/admin/cars", payload);
                carId = response.data.car.id;
            }

            if (selectedOptionIds.length > 0 || isEdit) {
                await api.put(`/admin/cars/${carId}/options`, {
                    option_ids: selectedOptionIds.map((optionId) => Number(optionId)),
                });
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append("image", selectedFile);
                formData.append("is_main", "1");
                formData.append("sort_order", "0");

                await api.post(`/admin/cars/${carId}/images`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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
            console.error("Erreur lors de la création de l'option :", error);
            setOptionCreateMessage("");
            setOptionCreateError(
                error.response?.data?.message || "Impossible de créer cette option."
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
                error.response?.data?.message || "Erreur lors de la mise à jour des options."
            );
        } finally {
            setOptionsLoading(false);
        }
    }
    async function handleCreateExpense(event) {
        event.preventDefault();

        if (!id) return;

        try {
            setExpenseCreateLoading(true);
            setScopedFeedback(setExpenseFeedback, "", "");

            const payload = {
                ...expenseForm,
                amount: Number(expenseForm.amount),
            };

            if (editingExpenseId) {
                await api.put(`/admin/expenses/${editingExpenseId}`, payload);
            } else {
                await api.post(`/admin/cars/${id}/expenses`, payload);
            }

            setExpenseForm(initialExpenseForm);
            setEditingExpenseId(null);
            await fetchCar();
            await fetchExpenses();
            setScopedFeedback(
                setExpenseFeedback,
                "success",
                editingExpenseId ? "Frais mis à jour avec succès." : "Frais ajouté avec succès."
            );
        } catch (error) {
            console.error("Erreur lors de l'ajout du frais :", error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                error.response?.data?.message || "Impossible d'ajouter ce frais."
            );
        } finally {
            setExpenseCreateLoading(false);
        }
    }

    function handleEditExpense(expense) {
        setEditingExpenseId(expense.id);
        setExpenseForm({
            category: expense.category || expenseCategories[0],
            expense_type: expense.expense_type || "",
            amount: String(expense.amount ?? ""),
            expense_date: expense.expense_date ? String(expense.expense_date).slice(0, 10) : "",
            description: expense.description || "",
        });
        setScopedFeedback(setExpenseFeedback, "", "");
    }

    function handleCancelExpenseEdit() {
        setEditingExpenseId(null);
        setExpenseForm(initialExpenseForm);
        setScopedFeedback(setExpenseFeedback, "", "");
    }

    function handlePrintSheet() {
        window.print();
    }

    async function handleExportExpenses() {
        if (!id) return;

        try {
            setExpenseExportLoading(true);
            const response = await api.get(`/admin/exports/cars/${id}/expenses`, {
                responseType: "blob",
            });
            downloadBlob(response.data, `autoline24-voiture-${id}-frais.csv`);
        } catch (error) {
            console.error("Erreur lors de l'export des frais :", error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                "Impossible d'exporter les frais de ce véhicule."
            );
        } finally {
            setExpenseExportLoading(false);
        }
    }

    async function handleDeleteExpense(expenseId) {
        try {
            setConfirmLoading(true);
            setScopedFeedback(setExpenseFeedback, "", "");
            await api.delete(`/admin/expenses/${expenseId}`);
            setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
            await fetchCar();
            await fetchExpenses();
            setScopedFeedback(setExpenseFeedback, "success", "Frais supprimé.");
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error("Erreur lors de la suppression du frais :", error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                error.response?.data?.message || "Impossible de supprimer ce frais."
            );
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

            clearSelectedFile();
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
                error.response?.data?.message ||
                    "Erreur lors du changement d'image principale."
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

    function openDeleteExpenseConfirm(expense) {
        setConfirmState({
            open: true,
            type: "expense",
            id: expense.id,
            title: "Supprimer ce frais ?",
            message: `Le frais "${expense.expense_type}" du ${formatDate(
                expense.expense_date
            )} sera supprimé.`,
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
            return;
        }

        if (confirmState.type === "expense") {
            handleDeleteExpense(confirmState.id);
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
            <div className="page-backlinks admin-print-hidden">
                <button type="button" className="page-link-button" onClick={() => navigate(-1)}>
                    Retour
                </button>
                <Link to="/admin/cars">Retour à la liste admin</Link>
                <Link to="/admin/settings">Paramètres contact</Link>
                <Link to="/cars">Voir le site</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>{isEdit ? "Modifier une voiture" : "Ajouter une voiture"}</h1>
                    {isEdit && carSummary && (
                        <p className="admin-page__subtitle">
                            {carSummary.brand} {carSummary.model}
                            {carSummary.version ? ` • ${carSummary.version}` : ""}
                            {carSummary.reference ? ` • Réf. ${carSummary.reference}` : ""}
                        </p>
                    )}
                </div>

                {isEdit && (
                    <div className="admin-page__actions admin-print-hidden">
                        <button
                            type="button"
                            className="admin-button admin-button--secondary"
                            onClick={handleExportExpenses}
                            disabled={expenseExportLoading}
                        >
                            {expenseExportLoading ? "Export..." : "Exporter les frais"}
                        </button>

                        <button
                            type="button"
                            className="admin-button admin-button--secondary"
                            onClick={handlePrintSheet}
                        >
                            Imprimer la fiche
                        </button>
                    </div>
                )}
            </div>

            {formFeedback.message && (
                <p className={`admin-feedback admin-feedback--${formFeedback.type}`}>
                    {formFeedback.message}
                </p>
            )}

            {isEdit && (
                <>
                    <section className="admin-vehicle-sheet">
                        <div className="admin-vehicle-sheet__media">
                            {mainImage ? (
                                <img
                                    src={mainImage.image_url}
                                    alt={`${carSummary?.brand || "Voiture"} ${carSummary?.model || ""}`}
                                    className="admin-vehicle-sheet__image"
                                />
                            ) : (
                                <div className="admin-vehicle-sheet__placeholder">
                                    Aucune image principale
                                </div>
                            )}
                        </div>

                        <div className="admin-vehicle-sheet__content">
                            <div className="admin-vehicle-sheet__badges">
                                <span className="admin-badge">{form.status}</span>
                                <span className="admin-badge admin-badge--muted">
                                    {form.publication_status}
                                </span>
                                {form.featured && <span className="admin-badge">Mise en avant</span>}
                            </div>

                            <h2>
                                {form.brand} {form.model}
                                {form.version ? ` ${form.version}` : ""}
                            </h2>

                            <div className="admin-vehicle-sheet__facts">
                                <span>{form.year || "Année non renseignée"}</span>
                                <span>{form.mileage ? `${form.mileage} km` : "Kilométrage à compléter"}</span>
                                <span>{form.fuel_type}</span>
                                <span>{form.transmission}</span>
                                <span>{form.color || "Couleur à compléter"}</span>
                                <span>{form.body_type || "Carrosserie à compléter"}</span>
                            </div>

                            <div className="admin-vehicle-sheet__stats">
                                <div>
                                    <span>Prix de vente</span>
                                    <strong>{formatCurrency(financialSummary.salePrice)}</strong>
                                </div>
                                <div>
                                    <span>Prix d'achat</span>
                                    <strong>{formatCurrency(financialSummary.purchasePrice)}</strong>
                                </div>
                                <div>
                                    <span>Options actives</span>
                                    <strong>{selectedOptionIds.length}</strong>
                                </div>
                                <div>
                                    <span>Images</span>
                                    <strong>{images.length}</strong>
                                </div>
                            </div>

                            <div className="admin-vehicle-sheet__options">
                                <span>Options actives</span>
                                <div className="admin-vehicle-sheet__option-list">
                                    {selectedOptions.length > 0 ? (
                                        selectedOptions.map((option) => (
                                            <span
                                                key={option.id}
                                                className="admin-badge admin-badge--muted"
                                            >
                                                {option.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="admin-vehicle-sheet__empty">
                                            Aucune option sélectionnée
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="admin-summary-section">
                        <div className="admin-summary-card">
                            <span>Prix d'achat</span>
                            <strong>{formatCurrency(financialSummary.purchasePrice)}</strong>
                        </div>
                        <div className="admin-summary-card">
                            <span>Total des frais</span>
                            <strong>{formatCurrency(financialSummary.totalExpenses)}</strong>
                        </div>
                        <div className="admin-summary-card">
                            <span>Investissement total</span>
                            <strong>{formatCurrency(financialSummary.totalInvestment)}</strong>
                        </div>
                        <div
                            className={`admin-summary-card ${
                                financialSummary.estimatedMargin >= 0
                                    ? "is-positive"
                                    : "is-negative"
                            }`}
                        >
                            <span>Marge estimée</span>
                            <strong>{formatCurrency(financialSummary.estimatedMargin)}</strong>
                        </div>
                    </section>

                    <section className="admin-expenses-section">
                        <div className="admin-expenses-section__header">
                            <div>
                                <h2>Suivi des frais</h2>
                                <p>
                                    Suivez les dépenses liées à cette voiture pour garder une vue
                                    claire sur le coût réel.
                                </p>
                            </div>

                            <div className="admin-expenses-section__tools admin-print-hidden">
                                <select
                                    value={expenseFilterCategory}
                                    onChange={(event) =>
                                        setExpenseFilterCategory(event.target.value)
                                    }
                                >
                                    <option value="all">Toutes les catégories</option>
                                    {expenseCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {expenseFeedback.message && (
                            <p className={`admin-feedback admin-feedback--${expenseFeedback.type}`}>
                                {expenseFeedback.message}
                            </p>
                        )}

                        <form className="admin-expense-form" onSubmit={handleCreateExpense}>
                            <select
                                name="category"
                                value={expenseForm.category}
                                onChange={handleExpenseChange}
                            >
                                {expenseCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="expense_type"
                                value={expenseForm.expense_type}
                                onChange={handleExpenseChange}
                            >
                                {suggestedExpenses.map((suggestion) => (
                                    <option
                                        key={`${suggestion.category}-${suggestion.expense_type}`}
                                        value={suggestion.expense_type}
                                    >
                                        {suggestion.expense_type}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="amount"
                                placeholder="Montant"
                                value={expenseForm.amount}
                                onChange={handleExpenseChange}
                                required
                            />

                            <input
                                type="date"
                                name="expense_date"
                                value={expenseForm.expense_date}
                                onChange={handleExpenseChange}
                                required
                            />

                            <input
                                type="text"
                                name="description"
                                placeholder="Description ou note"
                                value={expenseForm.description}
                                onChange={handleExpenseChange}
                            />

                            <button
                                type="submit"
                                className="admin-button"
                                disabled={expenseCreateLoading}
                            >
                                {expenseCreateLoading
                                    ? "Enregistrement..."
                                    : editingExpenseId
                                      ? "Enregistrer le frais"
                                      : "Ajouter le frais"}
                            </button>

                            {editingExpenseId && (
                                <button
                                    type="button"
                                    className="admin-button admin-button--secondary"
                                    onClick={handleCancelExpenseEdit}
                                    disabled={expenseCreateLoading}
                                >
                                    Annuler
                                </button>
                            )}
                        </form>

                        <div className="admin-expense-suggestions admin-print-hidden">
                            {suggestedExpenses.map((suggestion) => (
                                <button
                                    key={`${suggestion.category}-${suggestion.expense_type}`}
                                    type="button"
                                    className={`admin-chip ${
                                        expenseForm.expense_type === suggestion.expense_type &&
                                        expenseForm.category === suggestion.category
                                            ? "is-active"
                                            : ""
                                    }`}
                                    onClick={() => handleExpenseSuggestionSelect(suggestion)}
                                >
                                    {suggestion.category} • {suggestion.expense_type}
                                </button>
                            ))}
                        </div>

                        <div className="admin-expense-totals">
                            {expenseTotalsByCategory.map(({ category, total }) => (
                                <div key={category} className="admin-expense-total-card">
                                    <span>{category}</span>
                                    <strong>{formatCurrency(total)}</strong>
                                </div>
                            ))}
                        </div>

                        {expensesLoading ? (
                            <p>Chargement des frais...</p>
                        ) : filteredExpenses.length > 0 ? (
                            <div className="admin-expenses-list">
                                {filteredExpenses.map((expense) => (
                                    <article key={expense.id} className="admin-expense-card">
                                        <div className="admin-expense-card__top">
                                            <div>
                                                <span className="admin-badge admin-badge--muted">
                                                    {expense.category}
                                                </span>
                                                <h3>{expense.expense_type}</h3>
                                                <p>{formatDate(expense.expense_date)}</p>
                                            </div>

                                            <strong>{formatCurrency(expense.amount)}</strong>
                                        </div>

                                        {expense.description && (
                                            <p className="admin-expense-card__description">
                                                {expense.description}
                                            </p>
                                        )}

                                        <div className="admin-expense-card__actions">
                                            <button
                                                type="button"
                                                className="admin-link admin-print-hidden"
                                                onClick={() => handleEditExpense(expense)}
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-link admin-link--danger admin-print-hidden"
                                                onClick={() => openDeleteExpenseConfirm(expense)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p>
                                {expenseFilterCategory === "all"
                                    ? "Aucun frais ajouté pour le moment."
                                    : "Aucun frais dans cette catégorie pour le moment."}
                            </p>
                        )}
                    </section>
                </>
            )}

            <form className="admin-form" onSubmit={handleSubmit}>
                <input name="brand" placeholder="Marque" value={form.brand} onChange={handleChange} />
                <input name="model" placeholder="Modèle" value={form.model} onChange={handleChange} />
                <input name="version" placeholder="Version" value={form.version} onChange={handleChange} />
                <input name="year" type="number" placeholder="Année" value={form.year} onChange={handleChange} />
                <input name="mileage" type="number" placeholder="Kilométrage" value={form.mileage} onChange={handleChange} />
                <input name="price" type="number" placeholder="Prix de vente" value={form.price} onChange={handleChange} />
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

            <section className="admin-images-section">
                    <div className="admin-images-section__header">
                        <div>
                            <h2>Images</h2>
                            <p>
                                {isEdit
                                    ? "Glissez une image ici ou cliquez pour en sélectionner une."
                                    : "Ajoutez déjà une image principale. Elle sera envoyée juste après la création de la voiture."}
                            </p>
                        </div>
                    </div>

                    {imageFeedback.message && (
                        <p className={`admin-feedback admin-feedback--${imageFeedback.type}`}>
                            {imageFeedback.message}
                        </p>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="admin-images-input"
                    />

                    <button
                        type="button"
                        className={`admin-upload-dropzone ${isDragOver ? "is-dragover" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <span className="admin-upload-dropzone__icon">+</span>
                        <strong>Déposer une image</strong>
                        <span>ou cliquer pour parcourir</span>
                    </button>

                    {selectedFile && (
                        <div className="admin-upload-preview">
                            <img
                                src={previewUrl}
                                alt="Aperçu avant upload"
                                className="admin-upload-preview__image"
                            />

                            <div className="admin-upload-preview__content">
                                <h3>{selectedFile.name}</h3>
                                <p>{Math.round(selectedFile.size / 1024)} Ko</p>

                                <div className="admin-upload-preview__actions">
                                    {isEdit ? (
                                        <button
                                            type="button"
                                            className="admin-button"
                                            onClick={handleImageUpload}
                                            disabled={imageLoading}
                                        >
                                            {imageLoading ? "Upload..." : "Envoyer l'image"}
                                        </button>
                                    ) : (
                                        <span className="admin-upload-preview__hint">
                                            Cette image sera envoyée après l’enregistrement.
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className="admin-button admin-button--secondary"
                                        onClick={clearSelectedFile}
                                        disabled={imageLoading}
                                    >
                                        Retirer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEdit && images.length > 0 ? (
                        <div className="admin-images-grid">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className={`admin-image-card ${image.is_main ? "is-main" : ""}`}
                                >
                                    <img
                                        src={image.image_url}
                                        alt="Voiture"
                                        className="admin-image-card__img"
                                    />

                                    <div className="admin-image-card__content">
                                        <div className="admin-image-card__meta">
                                            {image.is_main ? (
                                                <span className="admin-image-card__badge">
                                                    Image principale
                                                </span>
                                            ) : (
                                                <span className="admin-image-card__hint">
                                                    Image secondaire
                                                </span>
                                            )}
                                        </div>

                                        <div className="admin-image-card__actions">
                                            {!image.is_main && (
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>
                            {isEdit
                                ? "Aucune image ajoutée."
                                : "Aucune image préparée pour le moment."}
                        </p>
                    )}
                </section>

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
