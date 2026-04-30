import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useSiteSettings } from "../hooks/useSiteSettings";
import "../styles/car-detail.css";

export default function CarDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { contactSettings } = useSiteSettings();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const lightboxRef = useRef(null);

    const fetchCar = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/cars/${id}`);
            const carData = response.data;
            setCar(carData);
            const firstImage = carData?.main_image?.image_url || carData?.images?.[0]?.image_url || "";
            setSelectedImage(firstImage);
        } catch (error) {
            console.error("Erreur lors du chargement de la voiture :", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchCar(); }, [fetchCar]);

    useEffect(() => {
        if (!lightboxOpen) return;
        function onKey(e) {
            if (e.key === "Escape") setLightboxOpen(false);
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
        }
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [lightboxOpen, selectedImage]); // eslint-disable-line react-hooks/exhaustive-deps

    function goToNext() {
        if (!car?.images?.length) return;
        const idx = car.images.findIndex((img) => img.image_url === selectedImage);
        setSelectedImage(car.images[(idx + 1) % car.images.length].image_url);
    }

    function goToPrev() {
        if (!car?.images?.length) return;
        const idx = car.images.findIndex((img) => img.image_url === selectedImage);
        setSelectedImage(car.images[(idx - 1 + car.images.length) % car.images.length].image_url);
    }

    async function handleShare() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard unavailable */
        }
    }

    const formattedPrice = useMemo(() => {
        if (!car?.price) return "";
        return Number(car.price).toLocaleString("fr-BE", { style: "currency", currency: "EUR" });
    }, [car]);

    const contactUrl = useMemo(() => {
        if (!car) return "/contact";
        const label = [car.brand, car.model, car.version].filter(Boolean).join(" ");
        const params = new URLSearchParams({ car: label });
        if (car.reference) params.set("ref", car.reference);
        return `/contact?${params.toString()}`;
    }, [car]);

    const currentIndex = car?.images?.findIndex((img) => img.image_url === selectedImage) ?? 0;

    if (loading) return <main className="page"><p>Chargement...</p></main>;
    if (!car) return <main className="page"><p>Voiture introuvable.</p></main>;

    return (
        <main className="page car-detail">
            <div className="page-backlinks">
                <button type="button" className="page-link-button" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
                <Link to="/cars">Catalogue</Link>
            </div>

            <section className="car-detail__top">
                {/* ── Gallery ── */}
                <div className="car-detail__gallery">
                    {selectedImage ? (
                        <div
                            className="car-detail__image-wrapper"
                            onClick={() => setLightboxOpen(true)}
                            title="Cliquer pour agrandir"
                        >
                            {car.images?.length > 1 && (
                                <button
                                    type="button"
                                    className="car-detail__arrow car-detail__arrow--left"
                                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                                >‹</button>
                            )}
                            <img
                                src={selectedImage}
                                alt={`${car.brand} ${car.model}`}
                                className="car-detail__main-image"
                                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x500?text=Voiture"; }}
                            />
                            <span className="car-detail__zoom-hint">🔍</span>
                            {car.images?.length > 1 && (
                                <button
                                    type="button"
                                    className="car-detail__arrow car-detail__arrow--right"
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                >›</button>
                            )}
                        </div>
                    ) : (
                        <div className="car-detail__placeholder">Aucune image</div>
                    )}

                    {car.images?.length > 1 && (
                        <div className="car-detail__thumbs">
                            {car.images.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    className={`car-detail__thumb-button ${selectedImage === image.image_url ? "is-active" : ""}`}
                                    onClick={() => setSelectedImage(image.image_url)}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={`${car.brand} ${car.model}`}
                                        className="car-detail__thumb"
                                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/120x80?text=Image"; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Info panel ── */}
                <div className="car-detail__info">
                    <h1>{car.brand} {car.model}</h1>
                    {car.version && <p className="car-detail__version">{car.version}</p>}

                    <p className="car-detail__price">{formattedPrice}</p>

                    <div className="car-detail__actions">
                        <Link to={contactUrl} className="car-detail__btn-primary">
                            Demander plus d'infos
                        </Link>
                        <button
                            type="button"
                            className={`car-detail__btn-secondary ${copied ? "is-copied" : ""}`}
                            onClick={handleShare}
                        >
                            {copied ? "✓ Lien copié !" : "Partager"}
                        </button>
                    </div>

                    <div className="car-detail__specs">
                        <div className="car-detail__spec"><span>Année</span><strong>{car.year}</strong></div>
                        <div className="car-detail__spec"><span>Kilométrage</span><strong>{Number(car.mileage).toLocaleString("fr-BE")} km</strong></div>
                        <div className="car-detail__spec"><span>Carburant</span><strong>{car.fuel_type}</strong></div>
                        <div className="car-detail__spec"><span>Boîte</span><strong>{car.transmission}</strong></div>
                        {car.power_hp && <div className="car-detail__spec"><span>Puissance</span><strong>{car.power_hp} ch</strong></div>}
                        {car.doors && <div className="car-detail__spec"><span>Portes</span><strong>{car.doors}</strong></div>}
                        {car.seats && <div className="car-detail__spec"><span>Places</span><strong>{car.seats}</strong></div>}
                        {car.color && <div className="car-detail__spec"><span>Couleur</span><strong>{car.color}</strong></div>}
                    </div>

                    <div className="car-detail__contact-panel">
                        <a href={`tel:${contactSettings.contact_phone}`}>{contactSettings.contact_phone}</a>
                        <a href={`mailto:${contactSettings.contact_email}`}>{contactSettings.contact_email}</a>
                    </div>

                    {car.description && (
                        <div className="car-detail__section">
                            <h2>Description</h2>
                            <p>{car.description}</p>
                        </div>
                    )}

                    {car.options?.length > 0 && (
                        <div className="car-detail__section">
                            <h2>Options</h2>
                            <div className="car-detail__badges">
                                {car.options.map((option) => (
                                    <span key={option.id} className="car-detail__badge">{option.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {car.reference && (
                        <p className="car-detail__reference">Réf. {car.reference}</p>
                    )}
                </div>
            </section>

            {/* ── Lightbox ── */}
            {lightboxOpen && (
                <div
                    className="car-lightbox"
                    ref={lightboxRef}
                    onClick={(e) => { if (e.target === lightboxRef.current) setLightboxOpen(false); }}
                >
                    <button
                        type="button"
                        className="car-lightbox__close"
                        onClick={() => setLightboxOpen(false)}
                        aria-label="Fermer"
                    >✕</button>

                    {car.images?.length > 1 && (
                        <button type="button" className="car-lightbox__arrow car-lightbox__arrow--left" onClick={goToPrev}>‹</button>
                    )}

                    <img
                        src={selectedImage}
                        alt={`${car.brand} ${car.model}`}
                        className="car-lightbox__image"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {car.images?.length > 1 && (
                        <button type="button" className="car-lightbox__arrow car-lightbox__arrow--right" onClick={goToNext}>›</button>
                    )}

                    {car.images?.length > 1 && (
                        <div className="car-lightbox__counter">
                            {currentIndex + 1} / {car.images.length}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
