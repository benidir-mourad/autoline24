import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/card.css";

export default function CarCard({ car, priority = false }) {
    const { t } = useTranslation();

    const mainImage =
        car.main_image?.image_url ||
        car.images?.[0]?.image_url ||
        null;

    const formattedPrice = Number(car.price).toLocaleString("fr-BE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    });

    const statusKey = {
        available: "carCard.statusAvailable",
        reserved: "carCard.statusReserved",
        sold: "carCard.statusSold",
    };
    const statusClass = {
        available: "car-card__status--available",
        reserved: "car-card__status--reserved",
        sold: "car-card__status--sold",
    };

    const fuelLabel = car.fuel_type
        ? t(`values.fuelTypes.${car.fuel_type}`, { defaultValue: car.fuel_type })
        : "";
    const transmissionLabel = car.transmission
        ? t(`values.transmissions.${car.transmission}`, { defaultValue: car.transmission })
        : "";

    const imageCount = car.images_count ?? car.images?.length ?? 0;

    return (
        <article className="car-card">
            <Link to={`/cars/${car.id}`} className="car-card__image-link">
                <div className="car-card__image-wrapper">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={`${car.brand} ${car.model}${car.version ? ` ${car.version}` : ""} ${car.year}`}
                            className="car-card__image"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            loading={priority ? "eager" : "lazy"}
                            fetchpriority={priority ? "high" : "auto"}
                        />
                    ) : (
                        <div className="car-card__placeholder">{t("carCard.noPhoto")}</div>
                    )}

                    <div className="car-card__badges">
                        {car.status && (
                            <span className={`car-card__status ${statusClass[car.status] ?? ""}`}>
                                {statusKey[car.status] ? t(statusKey[car.status]) : car.status}
                            </span>
                        )}
                        {car.featured && (
                            <span className="car-card__featured">
                                {t("carCard.featured")}
                            </span>
                        )}
                    </div>

                    {imageCount > 1 && (
                        <span className="car-card__photo-count">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            {imageCount}
                        </span>
                    )}
                </div>
            </Link>

            <div className="car-card__content">
                <Link to={`/cars/${car.id}`} className="car-card__title-link">
                    <h2 className="car-card__title">{car.brand} {car.model}</h2>
                </Link>

                {car.version && <p className="car-card__version">{car.version}</p>}

                <div className="car-card__meta">
                    <span className="car-card__meta-item">{car.year}</span>
                    <span className="car-card__meta-item">
                        {t("carCard.mileageUnit", { value: Number(car.mileage).toLocaleString("fr-BE") })}
                    </span>
                    <span className="car-card__meta-item">{fuelLabel}</span>
                    {transmissionLabel && (
                        <span className="car-card__meta-item">{transmissionLabel}</span>
                    )}
                </div>

                <p className="car-card__price">{formattedPrice}</p>

                <Link to={`/cars/${car.id}`} className="car-card__cta">
                    {t("carCard.viewDetail")}
                </Link>
            </div>
        </article>
    );
}
