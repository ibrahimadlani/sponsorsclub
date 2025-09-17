import { API_BASE_URL, refreshAccessToken as refreshAccessTokenImported } from "./api";

/**
 * Helper function to perform fetch avec authentification.
 * Ajoute le header Authorization avec le token actuel.
 * Si la réponse est 401, tente de rafraîchir le token et recommence la requête.
 */
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("User not authenticated");
  }

  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  let res = await fetch(url, options);
  if (res.status === 401) {
    token = await refreshAccessTokenImported();
    options.headers["Authorization"] = `Bearer ${token}`;
    res = await fetch(url, options);
  }
  return res;
}

/**
 * AUTH ENDPOINTS
 */

// 🔹 Login : envoie email et password, récupère et sauvegarde les tokens.
export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    throw new Error("Internal server error");
  }

  if (!res.ok) {
    // Traduction FR des erreurs courantes (401 identifiants invalides)
    let msg = "Une erreur est survenue.";
    if (res.status === 401) {
      msg = "Identifiants invalides.";
    } else {
      msg = data.error || data.message || data.detail || msg;
    }
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
}

// 🔹 Refresh Access Token : utilise le refreshToken pour obtenir un nouveau accessToken.
// Re-export the shared refresh implementation for consumers of this module
export const refreshAccessToken = refreshAccessTokenImported;

// 🔹 Logout : supprime les tokens et redirige vers la page de login.
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}

// 🔹 Register User : enregistre un nouvel utilisateur.
export async function registerUser(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Registration failed");
  }
  return res.json();
}

// 🔹 Fetch User Profile : récupère les informations de l'utilisateur connecté.
export async function fetchUserProfile() {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/me/`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

// 🔹 Update preferences (language, currency, timezone) for current user
export async function updatePreferences({ language, currency, timezone }) {
  const body = {};
  if (language !== undefined) body.language = language;
  if (currency !== undefined) body.currency = currency;
  if (timezone !== undefined) body.timezone = timezone;
  const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/preferences/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || data.detail || "Failed to update preferences");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// 🔹 Reset Password Request : envoie un email pour réinitialiser le mot de passe.
export async function resetPassword(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Reset password request failed");
  }
  return res.json();
}

// 🔹 Confirm Password Reset : confirme la réinitialisation du mot de passe avec un token.
export async function confirmPasswordReset(token, newPassword) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!res.ok) throw new Error("Password reset confirmation failed");
  return res.json();
}

// 🔹 Change Password : modifie le mot de passe de l'utilisateur connecté.
export async function changePassword(oldPassword, newPassword) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/password/change/`, {
    method: "POST",
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  if (!res.ok) throw new Error("Password change failed");
  return res.json();
}

/**
 * USER ENDPOINTS
 */

// 🔹 Get Users : récupère la liste de tous les utilisateurs.
export async function getUsers() {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/users/`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// 🔹 Get User By ID : récupère les informations d'un utilisateur à partir de son ID.
export async function getUserById(userId) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
  return res.json();
}

// 🔹 Update User Profile : met à jour le profil utilisateur via un PUT.
export async function updateUserProfile(userId, data) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// 🔹 Delete User : supprime un utilisateur à partir de son ID.
export async function deleteUser(userId) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete user ${userId}`);
  return res.json();
}

// ---------- Follows (athletes) ----------

export async function listFollows() {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/follows/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to list follows");
  return res.json();
}

export async function followAthlete(athleteId) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/follows/`, {
    method: "POST",
    body: JSON.stringify({ athlete: athleteId }),
  });
  if (!res.ok) throw new Error("Failed to follow athlete");
  return res.json();
}

export async function unfollow(followId) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/follows/${followId}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unfollow athlete");
  return true;
}

// 🔹 Followed athletes (hydrated Athlete objects)
export async function getFollowedAthletes() {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/followed/athletes/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch followed athletes");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
}

// 🔹 Unfollow by athlete UUID (no need to know follow id)
export async function unfollowByAthlete(athleteId) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/follows/by-athlete/${athleteId}/`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 200 && res.status !== 204) {
    throw new Error("Failed to unfollow by athlete");
  }
  return true;
}
