import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HelmetProvider>
            <AuthProvider>
                <SiteSettingsProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </SiteSettingsProvider>
            </AuthProvider>
        </HelmetProvider>
    </React.StrictMode>
);
