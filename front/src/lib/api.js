const API_BASE_URL = "http://127.0.0.1:8000";

export const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("Login failed");
    return res.json();
};

export const refreshAccessToken = async (refreshToken) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh: refreshToken })
    });

    if (!res.ok) throw new Error("Token refresh failed");
    return res.json();
};

export const fetchUserProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
};

export const updateUserProfile = async (userId, data) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
};