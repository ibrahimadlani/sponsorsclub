"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Ajout de usePathname pour détecter la route actuelle
import { refreshAccessToken } from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const router = useRouter();
    const pathname = usePathname(); // Obtenir la route actuelle

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");

        if (storedToken) {
            setAccessToken(storedToken);

            // 🚀 Bloquer l'accès aux pages d'auth si déjà connecté
            if (["/login", "/register", "/reset-password", "/reset-password/confirm"].includes(pathname)) {
                router.replace("/dashboard");
            }
        } else {
            // 🚀 Rediriger vers /login si l'utilisateur n'est pas connecté et essaie d'aller sur une page protégée
            if (!["/login", "/register", "/reset-password", "/reset-password/confirm", "/", "/settings"].includes(pathname)) {
                router.replace("/login");
            }
        }
    }, [pathname]); // Exécuter l'effet lorsque la route change

    const refreshAuth = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token found");

            const data = await refreshAccessToken(refreshToken);
            localStorage.setItem("accessToken", data.access);
            setAccessToken(data.access);
        } catch (error) {
            console.error("Token refresh failed");
            router.replace("/login"); // Rediriger vers /login si l'auth échoue
        }
    };

    return (
        <AuthContext.Provider value={{ accessToken, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;