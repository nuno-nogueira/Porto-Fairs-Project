import axios from "axios";
import * as SecureStore from "expo-secure-store";

const host = process.env.EXPO_PUBLIC_HOST;

const api = axios.create({
    baseURL: `http://${host}:8080/api`
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("token");

    // Debug: never print the actual token.
    console.log("[API] Request:", config.method?.toUpperCase(), config.url);
    console.log("[API] Token available:", !!token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
        "[API] Authorization header attached:",
        !!config.headers.Authorization
    );

    return config;
});



export default api;