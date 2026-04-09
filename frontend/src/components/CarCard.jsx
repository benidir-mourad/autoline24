import { Link } from "react-router-dom";
import "../styles/card.css";

export default function CarCard({ car, contactSettings }) {
    const mainImage =
        car.main_image?.image_url ||
        car.images?.[0]?.image_url ||
        "https://via.placeholder.com/400x250?text=Voiture";

    const formattedPrice = Number(car.price).toLocaleString("fr-BE", {
        style: "currency",
        currency: "EUR",
    });

    return (
        <article className="car-card">
            <img
                src={mainImage}
                alt={`${car.brand} ${car.model}`}
                className="car-card__image"
                onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x250?text=Voiture";
                }}
            />

            <div className="car-card__content">
                <h2 className="car-card__title">
                    {car.brand} {car.model}
                </h2>

                {car.version && <p className="car-card__version">{car.version}</p>}

                <div className="car-card__meta">
                    <span>{car.year}</span>
                    <span>{Number(car.mileage).toLocaleString("fr-BE")} km</span>
                </div>

                <div className="car-card__meta">
                    <span>{car.fuel_type}</span>
                    <span>{car.transmission}</span>
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

                    <Link
                        to="/contact"
                        className="car-card__button car-card__button--secondary"
                    >
                        Contacter le vendeur
                    </Link>
                </div>
            </div>
        </article>
    );
}
