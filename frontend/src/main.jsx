import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <SiteSettingsProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </SiteSettingsProvider>
        </AuthProvider>
    </React.StrictMode>
);
