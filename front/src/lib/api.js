
const API_BASE_URL = "http://127.0.0.1:8001";

// 🔹 Reset Password Request
export const resetPassword = async (email) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Reset password request failed");
  }

  return res.json();
};

// 🔹 Confirm Password Reset
export const confirmPasswordReset = async (token, newPassword) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });

  if (!res.ok) throw new Error("Password reset confirmation failed");
  return res.json();
};

// 🔹 Register a new user
export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    throw new Error("Internal server error");
  }

  if (!res.ok) {
    // Création d'une erreur personnalisée incluant le status
    const error = new Error(data.message || "Login failed");
    error.status = res.status;
    throw error;
  }

  // Sauvegarde des tokens dans le localStorage
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
};

// 🔹 Refresh Access Token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.access);
  return data.access;
};

// 🔹 Logout User
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Redirect to login page
  window.location.href = "/login?origin=logout";
  
};

// 🔹 Fetch User Profile
export const fetchUserProfile = async () => {
  let token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");

  let res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
};

// 🔹 Update User Profile
// 🔹 Mettre à jour le profil utilisateur avec PATCH
export const updateProfile = async (id, data) => {
  let token = localStorage.getItem("accessToken");
  console.log(data);
  if (!token) throw new Error("Utilisateur non authentifié");

  // 🔥 Récupérer l'ID utilisateur via fetchUserProfile()
  const user = await fetchUserProfile();
  const userId = user.id; // Assurez-vous que l'ID est bien récupéré depuis le profil utilisateur

  // ✅ Vérification de la structure du payload avant l'envoi
  if (typeof data !== "object") {
    throw new Error("Les données de mise à jour doivent être un objet JSON valide");
  }

  let res = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
    method: "PATCH", // ✅ Utilisation de PATCH pour ne modifier que certains champs
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), // ✅ S'assurer que data est bien stringifié
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data), // ✅ Même correction ici
    });
  }

  if (!res.ok) {
    const errorResponse = await res.json();
    throw new Error(errorResponse.message || "Échec de la mise à jour du profil");
  }

  return res.json();
};


// 🔹 Request Password Reset
export const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/password/reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Password reset request failed");
  }

  return res.json();
};

// 🔹 Change Password
export const changePassword = async (oldPassword, newPassword) => {
  let token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");

  let res = await fetch(`${API_BASE_URL}/api/auth/password/change/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/auth/password/change/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  }

  if (!res.ok) throw new Error("Password change failed");
  return res.json();
};