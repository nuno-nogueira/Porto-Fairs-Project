import React, {  createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";  
import * as SecureStore from "expo-secure-store"; 
import api from "@/api/axios";
import { parse } from "graphql";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    current_location: string | null;
    description: string | null;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
    current_location ?: string;
    description ?: string;
}

interface BackendUser {
    _id: string;
    full_name: string;
    email: string;
    role: string;
}

interface CurrentUserResponse {
    user: BackendUser;
    seller: {description ?: string | null} | null;
    questionnaire: {current_location ?: string | null} | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    
    login: (
        email: string, 
        password: string
    ) => Promise<void>;
    
    register: (
        payload: RegisterPayload
    ) => Promise<void>;
    
    logout: () => Promise<void>;
};

const TOKEN_KEY = "token";

const authContext = createContext<AuthContextType | undefined>(undefined);

const mapBasciUser = (backendUser: BackendUser): User => ({
    _id: backendUser._id,
    name: backendUser.full_name,
    email: backendUser.email,
    role: backendUser.role,
    current_location: null,
    description: null
})

// Include additional information based on the user's role
const mapCurrentUser = (response: CurrentUserResponse): User => ({
    ...mapBasciUser(response.user),
    current_location: response.questionnaire?.current_location ?? null,
    description: response.seller?.description ?? null
})

const getStoredToken = async(): Promise<string | null> => {
    const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);

    if (secureToken) {
        await AsyncStorage.multiRemove(["token", "user"]);
        return secureToken;
    }

    const oldToken = await AsyncStorage.getItem(TOKEN_KEY);

    if (oldToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, oldToken);
        await AsyncStorage.multiRemove(["token", "user"]);

        return oldToken;
    }

    return null;
}

const clearStoredSession = async() => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.multiRemove(["token", "user"]);
};

const getErrorStatus = (error: unknown): number | undefined => {
    return (error as {response?: {status ?: number}})?.response?.status;
}

export const AuthProvider = ({ children }: { children: ReactNode}) => {

    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; 

        const loadUser = async () => {
            try {
                const token = await getStoredToken();

                if (!token) return;

                const response = await api.get<CurrentUserResponse>("/users/me");

                if (!response.data?.user) throw new Error("Invalid user response from server.");

                if (isMounted) setUser(mapCurrentUser(response.data));

            } catch (err) {
                const status = getErrorStatus(err);

                if ([401, 403, 404].includes(status ?? 0)) {
                    await clearStoredSession();

                    if (isMounted) setUser(null);
                } else {
                    console.warn("Couldn't validate the stored session ->", err);
                }

            } finally {
                if (isMounted) setLoading(false); 
            }
        };

        loadUser();

        return () => {
            isMounted = false; 
        };
    }, []);


    const login = async (email: string, password: string) => {
        
        const response = await api.post("/users/login", {email, password});
        
        const backendUser = response.data.user;
        const accessToken = response.data.accessToken;

        if (!backendUser || !accessToken) throw new Error("Invalid authentication response");

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await AsyncStorage.multiRemove(["token", "user"]);

        setUser(mapBasciUser(backendUser));

        try {
            const profileResponse = await api.get<CurrentUserResponse>("/users/me");

            setUser(mapCurrentUser(profileResponse.data));
        } catch (err) {
            const status = getErrorStatus(err);

            if ([401, 403, 404].includes(status ?? 0)) {
                await clearStoredSession();
                setUser(null);
                throw err;
            }

            console.warn("Couldn't retrieve complete user profile ->", err);
            
        }
    };

    const register = async (payload: RegisterPayload) => {
        const requestBody: RegisterPayload = {...payload};

        // Optional fields
        if (!requestBody.current_location?.trim()) delete requestBody.current_location;
        if (!requestBody.description?.trim()) delete requestBody.description;

        await api.post('/users/register', requestBody);
    }


    const logout = async () => {
        await clearStoredSession();
        setUser(null);
    };

    return (

        <authContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(authContext);

    if (!context) {
        throw new Error('Context is not working.');
    }

    return context;
}