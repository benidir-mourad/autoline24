import { useContext } from "react";
import { SiteSettingsContext } from "../contexts/site-settings-context";

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);

    if (!context) {
        throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
    }

    return context;
}
