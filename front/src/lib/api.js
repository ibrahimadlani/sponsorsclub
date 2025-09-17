
// Prefer env override if provided, fallback to localhost
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";

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

// 🔹 Verify Email
export const verifyEmail = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Échec de la vérification.");
    err.status = res.status;
    throw err;
  }
  return data;
};

// ---------- Public data endpoints ----------

// Helper: attach Authorization header if accessToken is available (for user-scoped fields like is_followed)
const withAuthIfAvailable = () => {
  try {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const getAthletes = async () => {
  const res = await fetch(`${API_BASE_URL}/api/athletes/`, {
    cache: "no-store",
    headers: { ...withAuthIfAvailable() },
  });
  if (!res.ok) throw new Error("Impossible de charger les athlètes");
  const data = await res.json();
  // If paginated (DRF), return results, else assume array
  return Array.isArray(data) ? data : data.results || [];
};

export const getAthleteBySlug = async (slugOrId) => {
  // Try fetch by UUID first, else fallback to list and match by profile_url
  const isUuid = /[0-9a-fA-F-]{36}/.test(slugOrId);
  if (isUuid) {
    const res = await fetch(`${API_BASE_URL}/api/athletes/${slugOrId}/`, {
      cache: "no-store",
      headers: { ...withAuthIfAvailable() },
    });
    if (res.ok) return res.json();
  }
  const list = await getAthletes();
  return list.find((a) => a.profile_url === `/athletes/${slugOrId}` || a.id === slugOrId) || null;
};

export const getAthletesPage = async (limit = 12, offset = 0) => {
  const url = `${API_BASE_URL}/api/athletes/?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger les athlètes");
  const data = await res.json();
  if (Array.isArray(data)) {
    // non-paginated fallback
    return { results: data.slice(offset, offset + limit), next: data.length > offset + limit ? url : null };
  }
  return { results: data.results || [], next: data.next || null };
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
export const changePassword = async (oldPassword, newPassword, confirmNewPassword) => {
  let token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");

  let res = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword ?? newPassword,
    }),
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword ?? newPassword,
      }),
    });
  }

  if (!res.ok) throw new Error("Password change failed");
  return res.json();
};

// 🔹 Delete account (Right to erasure)
export const deleteAccount = async () => {
  let token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");

  let res = await fetch(`${API_BASE_URL}/api/privacy/erase/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/privacy/erase/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (!res.ok) {
    let msg = "Failed to delete account";
    try { const data = await res.json(); msg = data?.message || msg; } catch {}
    throw new Error(msg);
  }

  return res.json();
};
