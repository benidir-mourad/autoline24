import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function GlobalSeo() {
    const { contactSettings } = useSiteSettings();
    const siteUrl = window.location.origin;

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": ["AutoDealer", "LocalBusiness"],
        name: "Autoline24",
        url: siteUrl,
        ...(contactSettings.contact_phone && { telephone: contactSettings.contact_phone }),
        ...(contactSettings.contact_email && { email: contactSettings.contact_email }),
        ...(contactSettings.contact_address && {
            address: {
                "@type": "PostalAddress",
                streetAddress: contactSettings.contact_address,
                addressCountry: "BE",
            },
        }),
        priceRange: "€€",
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Autoline24",
        url: siteUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/cars?search={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        </Helmet>
    );
}
