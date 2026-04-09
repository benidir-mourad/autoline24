import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { SiteSettingsContext } from "./site-settings-context";

const fallbackSettings = {
    contact_phone: "+32 470 00 00 00",
    contact_email: "contact@autoline24.test",
    contact_address: "Rue de l Exemple 1, 1000 Bruxelles",
    company_vat: "BE 0123.456.789",
    contact_map_embed_url: "https://www.google.com/maps?q=Bruxelles&output=embed",
};

export function SiteSettingsProvider({ children }) {
    const [contactSettings, setContactSettings] = useState(fallbackSettings);
    const [loading, setLoading] = useState(true);

    const refreshContactSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/settings/contact");
            setContactSettings((prev) => ({
                ...prev,
                ...response.data,
            }));
        } catch (error) {
            console.error("Erreur lors du chargement des coordonnées :", error);
            setContactSettings(fallbackSettings);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshContactSettings();
    }, [refreshContactSettings]);

    return (
        <SiteSettingsContext.Provider
            value={{
                contactSettings,
                refreshContactSettings,
                loading,
            }}
        >
            {children}
        </SiteSettingsContext.Provider>
    );
}
