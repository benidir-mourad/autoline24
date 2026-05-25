import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../components/ConfirmDialog";
import ComboboxSelect from "../components/ComboboxSelect";
import { CAR_MAKES, getModelsForMake } from "../data/carMakesModels";
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
    if (!value) return null;
    return new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(new Date(value));
}

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

function ChevronIcon() {
    return (
        <svg className="admin-accordion__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function AccordionSection({ title, badge, actions, open, onToggle, children }) {
    return (
        <div className={`admin-accordion${open ? " is-open" : ""}`}>
            <button type="button" className="admin-accordion__header" onClick={onToggle}>
                <div className="admin-accordion__left">
                    <span className="admin-accordion__title">{title}</span>
                    {badge && <span className="admin-accordion__badge">{badge}</span>}
                </div>
                <div className="admin-accordion__right">
                    {actions && (
                        <div className="admin-accordion__actions" onClick={(e) => e.stopPropagation()}>
                            {actions}
                        </div>
                    )}
                    <ChevronIcon />
                </div>
            </button>
            <div className="admin-accordion__wrap">
                <div className="admin-accordion__body">
                    <div className="admin-accordion__body-inner">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminCarFormPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [form, setForm] = useState(initialForm);
    const [carSummary, setCarSummary] = useState(null);
    const [images, setImages] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewItems, setPreviewItems] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [newOptionName, setNewOptionName] = useState("");
    const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [expenseFilterCategory, setExpenseFilterCategory] = useState("all");

    const [loading, setLoading] = useState(false);
    const [formSaving, setFormSaving] = useState(false);
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
    const [openSections, setOpenSections] = useState({
        info: true,
        expenses: true,
        options: true,
        images: true,
    });

    function toggleSection(key) {
        setOpenSections((s) => ({ ...s, [key]: !s[key] }));
    }

    const financialSummary = useMemo(() => {
        const purchasePrice = Number(carSummary?.purchase_price ?? form.purchase_price ?? 0);
        const salePrice = Number(carSummary?.price ?? form.price ?? 0);
        const totalExpenses = Number(carSummary?.total_expenses ?? 0);
        const totalInvestment =
            Number(carSummary?.total_investment ?? purchasePrice + totalExpenses);
        const estimatedMargin =
            Number(carSummary?.estimated_margin ?? salePrice - totalInvestment);

        return { purchasePrice, salePrice, totalExpenses, totalInvestment, estimatedMargin };
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
        () => options.filter((option) => selectedOptionIds.includes(String(option.id))),
        [options, selectedOptionIds]
    );

    useEffect(() => {
        if (selectedFiles.length === 0) {
            setPreviewItems([]);
            return;
        }
        const items = selectedFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
        setPreviewItems(items);
        return () => items.forEach(item => URL.revokeObjectURL(item.url));
    }, [selectedFiles]);

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
            console.error(error);
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
            console.error(error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                t("admin.expenses.expenseLoadError")
            );
        } finally {
            setExpensesLoading(false);
        }
    }, [id, t]);

    const fetchAllOptions = useCallback(async () => {
        try {
            const response = await api.get("/admin/options");
            setOptions(response.data ?? []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchCarOptions = useCallback(async () => {
        try {
            const response = await api.get(`/admin/cars/${id}/options`);
            const carOptions = response.data.options ?? [];
            setSelectedOptionIds(carOptions.map((option) => String(option.id)));
        } catch (error) {
            console.error(error);
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
        setExpenseForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleExpenseSuggestionSelect(suggestion) {
        setExpenseForm((prev) => ({
            ...prev,
            category: suggestion.category,
            expense_type: suggestion.expense_type,
        }));
    }

    function addFiles(fileList) {
        if (!fileList || fileList.length === 0) return;
        const incoming = Array.from(fileList);
        setSelectedFiles(prev => {
            const existing = new Set(prev.map(f => `${f.name}-${f.size}`));
            const unique = incoming.filter(f => !existing.has(`${f.name}-${f.size}`));
            return [...prev, ...unique];
        });
        setScopedFeedback(setImageFeedback, "", "");
        setIsDragOver(false);
    }

    function handleFileChange(event) {
        addFiles(event.target.files);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleDrop(event) {
        event.preventDefault();
        addFiles(event.dataTransfer.files);
    }

    function handleDragOver(event) {
        event.preventDefault();
        setIsDragOver(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setIsDragOver(false);
    }

    function removeFile(index) {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }

    function clearAllFiles() {
        setSelectedFiles([]);
        setIsDragOver(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
            setFormSaving(true);
            setScopedFeedback(setFormFeedback, "", "");
            const payload = { ...form, featured: form.featured ? 1 : 0 };

            let carId = id;

            if (isEdit) {
                const response = await api.put(`/admin/cars/${id}`, payload);
                setCarSummary(response.data.car ?? null);
            } else {
                const response = await api.post("/admin/cars", payload);
                carId = response.data.car.id;
            }

            await api.put(`/admin/cars/${carId}/options`, {
                option_ids: selectedOptionIds.map((optionId) => Number(optionId)),
            });

            for (let i = 0; i < selectedFiles.length; i++) {
                const formData = new FormData();
                formData.append("image", selectedFiles[i]);
                formData.append("is_main", i === 0 ? "1" : "0");
                formData.append("sort_order", String(i));
                await api.post(`/admin/cars/${carId}/images`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate("/admin/cars");
        } catch (error) {
            console.error(error);
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setScopedFeedback(
                setFormFeedback,
                "error",
                firstError || error.response?.data?.message || t("admin.form.saveFallbackError")
            );
        } finally {
            setFormSaving(false);
        }
    }

    async function handleCreateOption(event) {
        event.preventDefault();

        const trimmedName = newOptionName.trim();

        if (!trimmedName) {
            setOptionCreateError(t("admin.options.optionCreateError"));
            setOptionCreateMessage("");
            return;
        }

        try {
            setOptionCreateLoading(true);
            setOptionCreateError("");
            setOptionCreateMessage("");

            const response = await api.post("/admin/options", { name: trimmedName });
            const createdOption = response.data.option;

            setOptions((prev) =>
                [...prev, createdOption].sort((a, b) => a.name.localeCompare(b.name, "fr"))
            );
            setSelectedOptionIds((prev) => {
                const nextId = String(createdOption.id);
                return prev.includes(nextId) ? prev : [...prev, nextId];
            });
            setNewOptionName("");
            setOptionCreateMessage(t("admin.options.optionCreated"));
        } catch (error) {
            console.error(error);
            setOptionCreateMessage("");
            setOptionCreateError(
                error.response?.data?.message || t("admin.options.optionCreateFallbackError")
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
            setOptionCreateMessage(t("admin.options.optionDeleted"));
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error(error);
            setOptionCreateError(t("admin.options.optionDeleteError"));
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

            setOptionCreateMessage(t("admin.options.optionUpdateFallback"));
        } catch (error) {
            console.error(error);
            setOptionCreateError(
                error.response?.data?.message || t("admin.options.optionUpdateError")
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

            const payload = { ...expenseForm, amount: Number(expenseForm.amount) };

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
                editingExpenseId ? t("admin.expenses.expenseUpdated") : t("admin.expenses.expenseAdded")
            );
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                error.response?.data?.message || t("admin.expenses.expenseAddError")
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
            console.error(error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                t("admin.expenses.expenseExportError")
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
            setScopedFeedback(setExpenseFeedback, "success", t("admin.expenses.expenseSaved"));
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setExpenseFeedback,
                "error",
                error.response?.data?.message || t("admin.expenses.expenseAddError")
            );
        } finally {
            setConfirmLoading(false);
        }
    }

    async function handleImageUpload() {
        if (selectedFiles.length === 0 || !id) return;

        try {
            setImageLoading(true);
            setScopedFeedback(setImageFeedback, "", "");

            for (let i = 0; i < selectedFiles.length; i++) {
                const formData = new FormData();
                formData.append("image", selectedFiles[i]);
                formData.append("is_main", i === 0 && images.length === 0 ? "1" : "0");
                formData.append("sort_order", String(images.length + i));
                await api.post(`/admin/cars/${id}/images`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            const count = selectedFiles.length;
            clearAllFiles();
            await fetchImages();
            setScopedFeedback(setImageFeedback, "success", t("admin.images.imagesAdded", { count }));
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || t("admin.images.imageAddError")
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
            setScopedFeedback(setImageFeedback, "success", t("admin.images.imageAdded"));
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || t("admin.images.imageSetMainError")
            );
        }
    }

    async function handleDeleteImage(imageId) {
        try {
            setConfirmLoading(true);
            setScopedFeedback(setImageFeedback, "", "");
            await api.delete(`/admin/images/${imageId}`);
            await fetchImages();
            setScopedFeedback(setImageFeedback, "success", t("admin.images.imageDeleted"));
            setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
        } catch (error) {
            console.error(error);
            setScopedFeedback(
                setImageFeedback,
                "error",
                error.response?.data?.message || t("admin.images.imageDeleteError")
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
            title: t("admin.options.deleteTitle"),
            message: t("admin.options.deleteMessage", { name: option.name }),
        });
    }

    function openDeleteImageConfirm(image) {
        setConfirmState({
            open: true,
            type: "image",
            id: image.id,
            title: t("admin.images.deleteTitle"),
            message: t("admin.images.deleteMessage"),
        });
    }

    function openDeleteExpenseConfirm(expense) {
        const dateStr = formatDate(expense.expense_date) ?? t("admin.dateFallback");
        setConfirmState({
            open: true,
            type: "expense",
            id: expense.id,
            title: t("admin.expenses.deleteTitle"),
            message: t("admin.expenses.deleteMessage", { type: expense.expense_type, date: dateStr }),
        });
    }

    function closeConfirmDialog() {
        if (confirmLoading) return;
        setConfirmState({ open: false, type: "", id: null, title: "", message: "" });
    }

    function handleConfirmAction() {
        if (confirmState.type === "option") { handleDeleteOption(confirmState.id); return; }
        if (confirmState.type === "image") { handleDeleteImage(confirmState.id); return; }
        if (confirmState.type === "expense") { handleDeleteExpense(confirmState.id); }
    }

    if (loading) {
        return (
            <main className="page">
                <p>{t("common.loading")}</p>
            </main>
        );
    }

    return (
        <main className="page admin-page">
            <div className="page-backlinks admin-print-hidden">
                <button type="button" className="page-link-button" onClick={() => navigate(-1)}>
                    {t("common.back")}
                </button>
                <Link to="/admin">{t("admin.backToAdmin")}</Link>
                <Link to="/admin/cars">{t("admin.backToCars")}</Link>
                <Link to="/admin/settings">{t("admin.seeSettings")}</Link>
                <Link to="/cars">{t("admin.seeSite")}</Link>
            </div>

            <div className="admin-page__header admin-page__header--stacked">
                <div>
                    <h1>{isEdit ? t("admin.editCarTitle") : t("admin.addCarTitle")}</h1>
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
                            {expenseExportLoading ? t("admin.exporting") : t("admin.exportExpenses")}
                        </button>

                        <button
                            type="button"
                            className="admin-button admin-button--secondary"
                            onClick={handlePrintSheet}
                        >
                            {t("admin.printSheet")}
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
                                    alt={`${carSummary?.brand || ""} ${carSummary?.model || ""}`}
                                    className="admin-vehicle-sheet__image"
                                />
                            ) : (
                                <div className="admin-vehicle-sheet__placeholder">
                                    {t("admin.noMainImage")}
                                </div>
                            )}
                        </div>

                        <div className="admin-vehicle-sheet__content">
                            <div className="admin-vehicle-sheet__badges">
                                <span className="admin-badge">
                                    {t(`values.statuses.${form.status}`, { defaultValue: form.status })}
                                </span>
                                <span className="admin-badge admin-badge--muted">
                                    {t(`values.publicationStatuses.${form.publication_status}`, { defaultValue: form.publication_status })}
                                </span>
                                {form.featured && <span className="admin-badge">{t("admin.featured")}</span>}
                            </div>

                            <h2>
                                {form.brand} {form.model}
                                {form.version ? ` ${form.version}` : ""}
                            </h2>

                            <div className="admin-vehicle-sheet__facts">
                                <span>{form.year || t("admin.yearFallback")}</span>
                                <span>{form.mileage ? `${form.mileage} km` : t("admin.mileageFallback")}</span>
                                <span>{form.fuel_type}</span>
                                <span>{form.transmission}</span>
                                <span>{form.color || t("admin.colorFallback")}</span>
                                <span>{form.body_type || t("admin.bodyTypeFallback")}</span>
                            </div>

                            <div className="admin-vehicle-sheet__stats">
                                <div>
                                    <span>{t("admin.salePrice")}</span>
                                    <strong>{formatCurrency(financialSummary.salePrice)}</strong>
                                </div>
                                <div>
                                    <span>{t("admin.purchasePrice")}</span>
                                    <strong>{formatCurrency(financialSummary.purchasePrice)}</strong>
                                </div>
                                <div>
                                    <span>{t("admin.activeOptions")}</span>
                                    <strong>{selectedOptionIds.length}</strong>
                                </div>
                                <div>
                                    <span>{t("admin.images")}</span>
                                    <strong>{images.length}</strong>
                                </div>
                            </div>

                            <div className="admin-vehicle-sheet__options">
                                <span>{t("admin.activeOptions")}</span>
                                <div className="admin-vehicle-sheet__option-list">
                                    {selectedOptions.length > 0 ? (
                                        selectedOptions.map((option) => (
                                            <span key={option.id} className="admin-badge admin-badge--muted">
                                                {option.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="admin-vehicle-sheet__empty">
                                            {t("admin.noOptionSelected")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="admin-summary-section">
                        <div className="admin-summary-card">
                            <span>{t("admin.financialSummary.purchasePrice")}</span>
                            <strong>{formatCurrency(financialSummary.purchasePrice)}</strong>
                        </div>
                        <div className="admin-summary-card">
                            <span>{t("admin.financialSummary.totalExpenses")}</span>
                            <strong>{formatCurrency(financialSummary.totalExpenses)}</strong>
                        </div>
                        <div className="admin-summary-card">
                            <span>{t("admin.financialSummary.totalInvestment")}</span>
                            <strong>{formatCurrency(financialSummary.totalInvestment)}</strong>
                        </div>
                        <div
                            className={`admin-summary-card ${
                                financialSummary.estimatedMargin >= 0 ? "is-positive" : "is-negative"
                            }`}
                        >
                            <span>{t("admin.financialSummary.estimatedMargin")}</span>
                            <strong>{formatCurrency(financialSummary.estimatedMargin)}</strong>
                        </div>
                    </section>

                    <AccordionSection
                        title={t("admin.expenses.sectionTitle")}
                        badge={`${expenses.length} · ${formatCurrency(financialSummary.totalExpenses)}`}
                        open={openSections.expenses}
                        onToggle={() => toggleSection("expenses")}
                        actions={
                            <select
                                value={expenseFilterCategory}
                                onChange={(e) => setExpenseFilterCategory(e.target.value)}
                            >
                                <option value="all">{t("admin.expenses.allCategories")}</option>
                                {expenseCategories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        }
                    >
                        {expenseFeedback.message && (
                            <p className={`admin-feedback admin-feedback--${expenseFeedback.type}`}>
                                {expenseFeedback.message}
                            </p>
                        )}

                        <form className="admin-expense-form" onSubmit={handleCreateExpense}>
                            <select name="category" value={expenseForm.category} onChange={handleExpenseChange}>
                                {expenseCategories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select name="expense_type" value={expenseForm.expense_type} onChange={handleExpenseChange}>
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
                                placeholder={t("admin.expenses.amountPlaceholder")}
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
                                placeholder={t("admin.expenses.descriptionPlaceholder")}
                                value={expenseForm.description}
                                onChange={handleExpenseChange}
                            />

                            <button type="submit" className="admin-button" disabled={expenseCreateLoading}>
                                {expenseCreateLoading
                                    ? t("admin.expenses.saving")
                                    : editingExpenseId
                                      ? t("admin.expenses.saveExpense")
                                      : t("admin.expenses.addExpense")}
                            </button>

                            {editingExpenseId && (
                                <button
                                    type="button"
                                    className="admin-button admin-button--secondary"
                                    onClick={handleCancelExpenseEdit}
                                    disabled={expenseCreateLoading}
                                >
                                    {t("admin.expenses.cancelEdit")}
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
                            <p>{t("admin.expenses.loadingExpenses")}</p>
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
                                                <p>{formatDate(expense.expense_date) ?? t("admin.dateFallback")}</p>
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
                                                {t("common.edit")}
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-link admin-link--danger admin-print-hidden"
                                                onClick={() => openDeleteExpenseConfirm(expense)}
                                            >
                                                {t("common.delete")}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p>
                                {expenseFilterCategory === "all"
                                    ? t("admin.expenses.noExpenses")
                                    : t("admin.expenses.noExpensesInCategory")}
                            </p>
                        )}
                    </AccordionSection>
                </>
            )}

            <AccordionSection
                title={t("admin.form.sectionInfo")}
                open={openSections.info}
                onToggle={() => toggleSection("info")}
            >
                <form id="car-form" className="admin-form" onSubmit={handleSubmit}>
                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.brandRequired")}</span>
                        <ComboboxSelect
                            value={form.brand}
                            options={CAR_MAKES}
                            placeholder={t("admin.form.brand")}
                            onChange={(val) => setForm((f) => ({ ...f, brand: val, model: "" }))}
                        />
                    </div>
                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.modelRequired")}</span>
                        <ComboboxSelect
                            value={form.model}
                            options={getModelsForMake(form.brand)}
                            placeholder={form.brand ? t("admin.form.model") : t("admin.form.modelPlaceholder")}
                            disabled={false}
                            onChange={(val) => setForm((f) => ({ ...f, model: val }))}
                        />
                    </div>
                    <input name="version" placeholder={t("admin.form.version")} value={form.version} onChange={handleChange} />
                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.yearRequired")}</span>
                        <input name="year" type="number" placeholder={t("admin.form.yearPlaceholder")} value={form.year} onChange={handleChange} />
                    </div>
                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.mileageRequired")}</span>
                        <input name="mileage" type="number" placeholder={t("admin.form.mileagePlaceholder")} value={form.mileage} onChange={handleChange} />
                    </div>
                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.salePriceRequired")}</span>
                        <input name="price" type="number" placeholder={t("admin.form.salePricePlaceholder")} value={form.price} onChange={handleChange} />
                    </div>
                    <input name="purchase_price" type="number" placeholder={t("admin.form.purchasePricePlaceholder")} value={form.purchase_price} onChange={handleChange} />

                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.fuelRequired")}</span>
                        <select name="fuel_type" value={form.fuel_type} onChange={handleChange}>
                            <option value="Diesel">Diesel</option>
                            <option value="Essence">Essence</option>
                            <option value="Hybride">Hybride</option>
                            <option value="Électrique">Électrique</option>
                        </select>
                    </div>

                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.transmissionRequired")}</span>
                        <select name="transmission" value={form.transmission} onChange={handleChange}>
                            <option value="Manuelle">Manuelle</option>
                            <option value="Automatique">Automatique</option>
                        </select>
                    </div>

                    <input name="power_hp" type="number" placeholder={t("admin.form.powerPlaceholder")} value={form.power_hp} onChange={handleChange} />
                    <input name="fiscal_power" type="number" placeholder={t("admin.form.fiscalPowerPlaceholder")} value={form.fiscal_power} onChange={handleChange} />
                    <input name="engine_size" type="number" placeholder={t("admin.form.engineSizePlaceholder")} value={form.engine_size} onChange={handleChange} />
                    <input name="doors" type="number" placeholder={t("admin.form.doorsPlaceholder")} value={form.doors} onChange={handleChange} />
                    <input name="seats" type="number" placeholder={t("admin.form.seatsPlaceholder")} value={form.seats} onChange={handleChange} />
                    <input name="color" placeholder={t("admin.form.colorPlaceholder")} value={form.color} onChange={handleChange} />
                    <input name="body_type" placeholder={t("admin.form.bodyTypePlaceholder")} value={form.body_type} onChange={handleChange} />
                    <input name="first_registration_date" type="date" value={form.first_registration_date} onChange={handleChange} />
                    <input name="reference" placeholder={t("admin.form.referencePlaceholder")} value={form.reference} onChange={handleChange} />

                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.statusRequired")}</span>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <option value="available">{t("values.statuses.available")}</option>
                            <option value="reserved">{t("values.statuses.reserved")}</option>
                            <option value="sold">{t("values.statuses.sold")}</option>
                        </select>
                    </div>

                    <div className="admin-form__field">
                        <span className="admin-form__field-label">{t("admin.form.publicationRequired")}</span>
                        <select name="publication_status" value={form.publication_status} onChange={handleChange}>
                            <option value="published">{t("values.publicationStatuses.published")}</option>
                            <option value="draft">{t("values.publicationStatuses.draft")}</option>
                        </select>
                    </div>

                    <label className="admin-checkbox">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={form.featured}
                            onChange={handleChange}
                        />
                        <span>{t("admin.form.featured")}</span>
                    </label>

                    <textarea
                        name="description"
                        placeholder={t("admin.form.descriptionPlaceholder")}
                        rows="5"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <p className="admin-form__required-note">
                        <span className="admin-form__required">{t("admin.form.required")}</span>{" "}
                        {t("admin.form.requiredNote").replace("* ", "")}
                    </p>
                </form>
            </AccordionSection>

            <AccordionSection
                title={t("admin.options.sectionTitle")}
                badge={t("admin.options.selected", { count: selectedOptionIds.length })}
                open={openSections.options}
                onToggle={() => toggleSection("options")}
                actions={isEdit && (
                    <button
                        type="button"
                        className="admin-button"
                        onClick={handleSaveOptionsOnly}
                        disabled={optionsLoading}
                    >
                        {optionsLoading ? t("admin.options.updating") : t("admin.options.updateOptions")}
                    </button>
                )}
            >
                <form className="admin-option-create" onSubmit={handleCreateOption}>
                    <input
                        type="text"
                        value={newOptionName}
                        onChange={(event) => setNewOptionName(event.target.value)}
                        placeholder={t("admin.options.newOptionPlaceholder")}
                    />

                    <button type="submit" className="admin-button" disabled={optionCreateLoading}>
                        {optionCreateLoading ? t("admin.options.creating") : t("admin.options.createOption")}
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
                                    {t("admin.options.deleteOption")}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{t("admin.options.noOptions")}</p>
                )}
            </AccordionSection>

            <AccordionSection
                title={t("admin.images.sectionTitle")}
                badge={images.length > 0 ? t("admin.images.photosCount", { count: images.length }) : undefined}
                open={openSections.images}
                onToggle={() => toggleSection("images")}
            >
                {imageFeedback.message && (
                    <p className={`admin-feedback admin-feedback--${imageFeedback.type}`}>
                        {imageFeedback.message}
                    </p>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="admin-images-input" />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="admin-images-input" />

                <button
                    type="button"
                    className={`admin-upload-dropzone ${isDragOver ? "is-dragover" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <span className="admin-upload-dropzone__icon">+</span>
                    <strong>{t("admin.images.dropzone")}</strong>
                    <span>{t("admin.images.dropzoneHint")}</span>
                </button>

                <button
                    type="button"
                    className="admin-button admin-button--secondary admin-camera-button"
                    onClick={() => cameraInputRef.current?.click()}
                >
                    {t("admin.images.takePhoto")}
                </button>

                {selectedFiles.length > 0 && (
                    <div className="admin-upload-queue">
                        <div className="admin-upload-queue__header">
                            <span>{t("admin.images.selectedCount", { count: selectedFiles.length })}</span>
                            <button
                                type="button"
                                className="admin-link"
                                onClick={clearAllFiles}
                                disabled={imageLoading}
                            >
                                {t("admin.images.removeAll")}
                            </button>
                        </div>

                        <div className="admin-upload-queue__grid">
                            {previewItems.map((item, index) => (
                                <div key={index} className="admin-upload-thumb">
                                    <img src={item.url} alt={item.file.name} />
                                    <button
                                        type="button"
                                        className="admin-upload-thumb__remove"
                                        onClick={() => removeFile(index)}
                                        disabled={imageLoading}
                                        aria-label={t("admin.images.removeThumb")}
                                    >
                                        ×
                                    </button>
                                    {index === 0 && images.length === 0 && (
                                        <span className="admin-upload-thumb__badge">{t("admin.images.mainBadge")}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="admin-upload-queue__actions">
                            {isEdit ? (
                                <button
                                    type="button"
                                    className="admin-button"
                                    onClick={handleImageUpload}
                                    disabled={imageLoading}
                                >
                                    {imageLoading
                                        ? t("admin.images.uploading")
                                        : t("admin.images.sendImages", { count: selectedFiles.length })}
                                </button>
                            ) : (
                                <span className="admin-upload-preview__hint">
                                    {t("admin.images.postCreateHint")}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {isEdit && images.length > 0 ? (
                    <div className="admin-images-grid">
                        {images.map((image) => (
                            <div key={image.id} className={`admin-image-card ${image.is_main ? "is-main" : ""}`}>
                                <img
                                    src={image.image_url}
                                    alt={t("admin.images.imageAlt")}
                                    className="admin-image-card__img"
                                />

                                <div className="admin-image-card__content">
                                    <div className="admin-image-card__meta">
                                        {image.is_main ? (
                                            <span className="admin-image-card__badge">
                                                {t("admin.images.mainImage")}
                                            </span>
                                        ) : (
                                            <span className="admin-image-card__hint">
                                                {t("admin.images.secondaryImage")}
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
                                                {t("admin.images.setMain")}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="admin-link admin-link--danger"
                                            onClick={() => openDeleteImageConfirm(image)}
                                        >
                                            {t("admin.images.deleteImage")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isEdit ? (
                    <p>{t("admin.images.noImages")}</p>
                ) : selectedFiles.length === 0 ? (
                    <p>{t("admin.images.selectImages")}</p>
                ) : null}
            </AccordionSection>

            <div className="admin-form__actions admin-form__actions--final">
                <button
                    type="submit"
                    form="car-form"
                    className="admin-button"
                    disabled={formSaving}
                >
                    {formSaving
                        ? t("admin.form.saving")
                        : isEdit
                          ? t("admin.form.saveChanges")
                          : t("admin.form.addCarAction")}
                </button>
            </div>

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel={t("common.delete")}
                loading={confirmLoading}
                onCancel={closeConfirmDialog}
                onConfirm={handleConfirmAction}
            />
        </main>
    );
}
