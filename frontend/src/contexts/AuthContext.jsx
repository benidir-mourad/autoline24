import { useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./auth-context";

function readStoredToken() {
    return localStorage.getItem("token");
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => readStoredToken());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function bootstrapAuth() {
            const storedToken = readStoredToken();

            if (!storedToken) {
                if (!ignore) {
                    setUser(null);
                    setToken(null);
                    setIsLoading(false);
                }
                return;
            }

            try {
                const response = await api.get("/admin/me");

                if (!ignore) {
                    setUser(response.data);
                    setToken(storedToken);
                }
            } catch {
                localStorage.removeItem("token");

                if (!ignore) {
                    setUser(null);
                    setToken(null);
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
        const response = await api.post("/admin/login", credentials);
        const nextToken = response.data.token;
        const nextUser = response.data.user;

        localStorage.setItem("token", nextToken);
        setToken(nextToken);
        setUser(nextUser);

        return response.data;
    }

    async function changePassword(payload) {
        const response = await api.put("/admin/change-password", payload);
        const nextToken = response.data.token;

        localStorage.setItem("token", nextToken);
        setToken(nextToken);

        return response.data;
    }

    async function changeEmail(payload) {
        const response = await api.put("/admin/change-email", payload);
        const nextUser = response.data.user;

        setUser(nextUser);

        return response.data;
    }

    async function logout() {
        try {
            await api.post("/admin/logout");
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        } finally {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
    }

    async function refreshAuth() {
        if (!readStoredToken()) {
            setUser(null);
            setToken(null);
            return null;
        }

        const response = await api.get("/admin/me");
        setUser(response.data);
        setToken(readStoredToken());

        return response.data;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: Boolean(token && user),
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
