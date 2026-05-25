import { useEffect, useState } from "react";
import api, { fetchCsrfToken } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function bootstrapAuth() {
            try {
                const response = await api.get("/admin/me");

                if (!ignore) {
                    setUser(response.data);
                }
            } catch {
                if (!ignore) {
                    setUser(null);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        bootstrapAuth();

        return () => {
            ignore = true;
        };
    }, []);

    async function login(credentials) {
        await fetchCsrfToken();
        const response = await api.post("/admin/login", credentials);
        setUser(response.data.user);
        return response.data;
    }

    async function changePassword(payload) {
        const response = await api.put("/admin/change-password", payload);
        return response.data;
    }

    async function changeEmail(payload) {
        const response = await api.put("/admin/change-email", payload);
        setUser(response.data.user);
        return response.data;
    }

    async function logout() {
        try {
            await api.post("/admin/logout");
        } catch {
            // Session may already be invalid; proceed with local cleanup
        } finally {
            setUser(null);
        }
    }

    async function refreshAuth() {
        try {
            const response = await api.get("/admin/me");
            setUser(response.data);
            return response.data;
        } catch {
            setUser(null);
            return null;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: Boolean(user),
                login,
                changeEmail,
                changePassword,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
