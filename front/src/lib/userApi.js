const API_BASE_URL = "http://127.0.0.1:8000";

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
    token = await refreshAccessToken();
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
    const error = new Error(data.message || "Login failed");
    error.status = res.status;
    throw error;
  }

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
}

// 🔹 Refresh Access Token : utilise le refreshToken pour obtenir un nouveau accessToken.
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.access);
  return data.access;
}

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