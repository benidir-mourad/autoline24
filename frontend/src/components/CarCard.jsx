import { Link } from "react-router-dom";
import "../styles/card.css";

const statusLabel = { available: "Disponible", reserved: "Réservé", sold: "Vendu" };
const statusClass = { available: "car-card__status--available", reserved: "car-card__status--reserved", sold: "car-card__status--sold" };

export default function CarCard({ car, contactSettings }) {
    const mainImage =
        car.main_image?.image_url ||
        car.images?.[0]?.image_url ||
        null;

    const formattedPrice = Number(car.price).toLocaleString("fr-BE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    });

    return (
        <article className="car-card">
            <div className="car-card__image-wrapper">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={`${car.brand} ${car.model}`}
                        className="car-card__image"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                        loading="lazy"
                    />
                ) : (
                    <div className="car-card__placeholder">Aucune photo</div>
                )}
                {car.status && (
                    <span className={`car-card__status ${statusClass[car.status] ?? ""}`}>
                        {statusLabel[car.status] ?? car.status}
                    </span>
                )}
            </div>

            <div className="car-card__content">
                <h2 className="car-card__title">
                    {car.brand} {car.model}
                </h2>

                {car.version && <p className="car-card__version">{car.version}</p>}

                <div className="car-card__meta">
                    <span className="car-card__meta-item">{car.year}</span>
                    <span className="car-card__meta-item">
                        {Number(car.mileage).toLocaleString("fr-BE")} km
                    </span>
                    <span className="car-card__meta-item">{car.fuel_type}</span>
                    <span className="car-card__meta-item">{car.transmission}</span>
                </div>

                <p className="car-card__price">{formattedPrice}</p>

                <div className="car-card__contact">
                    <a href={`tel:${contactSettings.contact_phone}`}>
                        {contactSettings.contact_phone}
                    </a>
                    <a href={`mailto:${contactSettings.contact_email}`}>
                        {contactSettings.contact_email}
                    </a>
                </div>

                <div className="car-card__actions">
                    <Link to={`/cars/${car.id}`} className="car-card__button">
                        Voir le détail
                    </Link>
                    <Link to="/contact" className="car-card__button car-card__button--secondary">
                        Contacter
                    </Link>
                </div>
            </div>
        </article>
    );
}
