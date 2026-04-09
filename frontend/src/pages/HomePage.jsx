import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function HomePage() {
    const { contactSettings } = useSiteSettings();

    return (
        <main className="page home-page">
            <section className="home-hero">
                <span className="page-eyebrow">Accueil</span>
                <h1>Un point d’entrée simple pour trouver votre prochaine voiture</h1>
                <p>
                    Autoline24 vous accompagne de la première sélection jusqu’au
                    rendez-vous. L’accueil sert ici de porte d’entrée rapide vers le
                    stock, les coordonnées et la prise de contact.
                </p>

                <div className="page-actions">
                    <Link to="/cars" className="page-button">
                        Parcourir le stock
                    </Link>
                    <Link to="/contact" className="page-button page-button--secondary">
                        Prendre contact
                    </Link>
                </div>
            </section>

            <section className="home-highlight-grid">
                <article className="page-card">
                    <span>Catalogue</span>
                    <strong>Consultez toutes les voitures disponibles</strong>
                    <p>Filtres, détails, galerie photo et accès rapide au vendeur.</p>
                </article>

                <article className="page-card">
                    <span>Contact direct</span>
                    <strong>{contactSettings.contact_phone}</strong>
                    <p>{contactSettings.contact_email}</p>
                </article>

                <article className="page-card">
                    <span>Visite sur place</span>
                    <strong>{contactSettings.contact_address}</strong>
                    <p>Retrouvez aussi ces coordonnées sur la page contact.</p>
                </article>
            </section>
        </main>
    );
}
