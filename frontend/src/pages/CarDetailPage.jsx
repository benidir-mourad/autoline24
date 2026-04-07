import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/car-detail.css";

export default function CarDetailPage() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        fetchCar();
    }, [id]);

    async function fetchCar() {
        try {
            setLoading(true);
            const response = await api.get(`/cars/${id}`);
            const carData = response.data;

            setCar(carData);

            const firstImage =
                carData?.main_image?.image_url ||
                carData?.images?.[0]?.image_url ||
                "";

            setSelectedImage(firstImage);
        } catch (error) {
            console.error("Erreur lors du chargement de la voiture :", error);
        } finally {
            setLoading(false);
        }
    }

    function goToNext() {
        if (!car?.images?.length) return;

        const currentIndex = car.images.findIndex(
            (img) => img.image_url === selectedImage
        );

        const nextIndex = (currentIndex + 1) % car.images.length;
        setSelectedImage(car.images[nextIndex].image_url);
    }

    function goToPrev() {
        if (!car?.images?.length) return;

        const currentIndex = car.images.findIndex(
            (img) => img.image_url === selectedImage
        );

        const prevIndex = (currentIndex - 1 + car.images.length) % car.images.length;
        setSelectedImage(car.images[prevIndex].image_url);
    }

    const formattedPrice = useMemo(() => {
        if (!car?.price) return "";
        return Number(car.price).toLocaleString("fr-BE", {
            style: "currency",
            currency: "EUR",
        });
    }, [car]);

    if (loading) {
        return (
            <main className="page">
                <p>Chargement...</p>
            </main>
        );
    }

    if (!car) {
        return (
            <main className="page">
                <p>Voiture introuvable.</p>
            </main>
        );
    }

    return (
        <main className="page car-detail">
            <section className="car-detail__top">
                <div className="car-detail__gallery">
                    {selectedImage ? (
                        <div className="car-detail__image-wrapper">
                            {car.images?.length > 1 && (
                                <button
                                    type="button"
                                    className="car-detail__arrow car-detail__arrow--left"
                                    onClick={goToPrev}
                                >
                                    ‹
                                </button>
                            )}

                            <img
                                src={selectedImage}
                                alt={`${car.brand} ${car.model}`}
                                className="car-detail__main-image"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://via.placeholder.com/800x500?text=Voiture";
                                }}
                            />

                            {car.images?.length > 1 && (
                                <button
                                    type="button"
                                    className="car-detail__arrow car-detail__arrow--right"
                                    onClick={goToNext}
                                >
                                    ›
                                </button>
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
                                    className={`car-detail__thumb-button ${
                                        selectedImage === image.image_url ? "is-active" : ""
                                    }`}
                                    onClick={() => setSelectedImage(image.image_url)}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={`${car.brand} ${car.model}`}
                                        className="car-detail__thumb"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://via.placeholder.com/120x80?text=Image";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="car-detail__info">
                    <h1>
                        {car.brand} {car.model}
                    </h1>

                    {car.version && <p className="car-detail__version">{car.version}</p>}

                    <p className="car-detail__price">{formattedPrice}</p>

                    <div className="car-detail__specs">
                        <div className="car-detail__spec">
                            <span>Année</span>
                            <strong>{car.year}</strong>
                        </div>

                        <div className="car-detail__spec">
                            <span>Kilométrage</span>
                            <strong>{Number(car.mileage).toLocaleString("fr-BE")} km</strong>
                        </div>

                        <div className="car-detail__spec">
                            <span>Carburant</span>
                            <strong>{car.fuel_type}</strong>
                        </div>

                        <div className="car-detail__spec">
                            <span>Boîte</span>
                            <strong>{car.transmission}</strong>
                        </div>

                        {car.power_hp && (
                            <div className="car-detail__spec">
                                <span>Puissance</span>
                                <strong>{car.power_hp} ch</strong>
                            </div>
                        )}

                        {car.doors && (
                            <div className="car-detail__spec">
                                <span>Portes</span>
                                <strong>{car.doors}</strong>
                            </div>
                        )}
                    </div>

                    {car.description && (
                        <div className="car-detail__section">
                            <h2>Description</h2>
                            <p>{car.description}</p>
                        </div>
                    )}

                    <div className="car-detail__section">
                        <h2>Options</h2>

                        {car.options?.length > 0 ? (
                            <div className="car-detail__badges">
                                {car.options.map((option) => (
                                    <span key={option.id} className="car-detail__badge">
                    {option.name}
                  </span>
                                ))}
                            </div>
                        ) : (
                            <p>Aucune option renseignée.</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}