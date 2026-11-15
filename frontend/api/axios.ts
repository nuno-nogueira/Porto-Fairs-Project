import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const host = process.env.EXPO_PUBLIC_HOST;

const api = axios.create({
    baseURL: `http://${host}:8080/api`
});

console.log("API URL:", api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;