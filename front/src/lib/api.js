const API_BASE_URL = "http://127.0.0.1:8000";

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

// 🔹 Login User
export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await res.json();
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
  window.location.href = "/login";
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
export const updateUserProfile = async (userId, data) => {
  let token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");

  let res = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  if (!res.ok) throw new Error("Failed to update profile");
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