import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const APP_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

export async function fetchCsrfToken() {
    await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}

export default api;
