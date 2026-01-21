import React, {  createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";   
import api from "@/src/api/axios";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContext {
    
    user: User|null;
    loading: boolean;
    
    login: (
        email: string, 
        password: string
    ) => Promise<void>;
    
    register: (
        name: string,
        email: string,
        password: string
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
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    return;
                }

                console.log("asdsadasdas", token);
                
                api.get("/users/me")
                    .then(res => {
                        if (isMounted) setUser(res.data);
                    })
                    .catch(async () => {
                        await AsyncStorage.removeItem("token");
                    })
                    .finally(() => {
                        if (isMounted) setLoading(false);
                    });


            } catch (err) {
                console.warn("Não foi possível carregar o user:", err);
                await AsyncStorage.removeItem("token");
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
        setUser(response.data.user);

        await AsyncStorage.setItem("token", response.data.token);
    };

    const register = async (name: string, email: string, password: string) => {

        await api.post("/users/register", {name, email, password});
    }

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('token');
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