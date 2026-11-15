import React, {  createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";   
import api from "@/api/axios";
import { parse } from "graphql";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
    current_location ?: string;
    description ?: string;
}

interface AuthContext {
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

const authContext = createContext<AuthContext|undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode}) => {

    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; 

        const loadUser = async () => {
            try {
                const [token, storedUser] = await Promise.all([
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('user')
                ])

                if (!token || !storedUser) {
                    await AsyncStorage.multiRemove(['token', 'user']);
                    return;
                }

                const parsedUser: User = JSON.parse(storedUser);

                if (isMounted) setUser(parsedUser);

            } catch (err) {
                console.warn("Não foi possível carregar o user:", err);
                await AsyncStorage.multiRemove(['token', 'user']);
                if (isMounted) setUser(null);

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

        if (!backendUser || !accessToken) throw new Error("Resposta de autenticação inválida!");

        const authenticatedUser: User = {
            _id: backendUser._id,
            name: backendUser.full_name,
            email: backendUser.email,
            role: backendUser.role
        }

        await AsyncStorage.multiSet([
            ['token', accessToken],
            ['user', JSON.stringify(authenticatedUser)]
        ]);

        setUser(authenticatedUser);
    };

    const register = async (payload: RegisterPayload) => {
        const requestBody: RegisterPayload = {...payload};

        console.log('test 2 passed')
        // Optional fields
        if (!requestBody.current_location?.trim()) delete requestBody.current_location;
        if (!requestBody.description?.trim()) delete requestBody.description;

        await api.post('/users/register', requestBody);
    }


    const logout = async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
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