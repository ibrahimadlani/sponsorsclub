"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "@/lib/api";


const AuthContext = createContext();

export const isAuthenticated = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
        return decoded.exp > currentTime; // True if token is still valid
    } catch (error) {
        console.error("Invalid token", error);
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");

        if (storedToken) {
            const isValid = isAuthenticated(storedToken);
            if (isValid) {
                setAccessToken(storedToken);
                setUser(jwtDecode(storedToken)); // Extraire les infos du token
            } else {
                localStorage.removeItem("accessToken"); // Supprimer le token expiré
                router.replace("/login");
            }
        } else {
            if (!["/","/login", "/register", "/reset-password", "/reset-password/confirm"].includes(pathname)) {
                router.replace("/login");
            }
        }
    }, [router, pathname]);

    // Fonction pour rafraîchir le token et mettre à jour l'utilisateur
    const refreshAuth = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token found");

            const data = await refreshAccessToken(refreshToken);
            localStorage.setItem("accessToken", data.access);
            setAccessToken(data.access);
            setUser(jwtDecode(data.access)); // Mettre à jour l'utilisateur
        } catch (error) {
            console.error("Token refresh failed");
            router.replace("/login");
        }
    };

    

    return (
        <AuthContext.Provider value={{ accessToken, user, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;