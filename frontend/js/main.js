// API base URL
const API_BASE_URL = "http://localhost:5000/api";
// Check authentication status and update UI
async function checkAuth() {
  const accessToken = localStorage.getItem("accessToken");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const profileLink = document.getElementById("profile-link");
  const adminLink = document.getElementById("admin-link");
  const logoutLink = document.getElementById("logout-link");

  if (accessToken) {
    // Hide login/register links
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";

    // Show profile and logout links
    if (profileLink) profileLink.style.display = "block";
    if (logoutLink) logoutLink.style.display = "block";

    // Check if user is admin
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "admin" && adminLink) {
        adminLink.style.display = "block";
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  } else {
    // Show login/register links
    if (loginLink) loginLink.style.display = "block";
    if (registerLink) registerLink.style.display = "block";

    // Hide profile, admin and logout links
    if (profileLink) profileLink.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

// Logout user
async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Clear local storage and redirect
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }
}

// Initialize logout button
function initLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  }
}

// Make authenticated API requests
async function makeAuthRequest(url, method = "GET", body = null) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const headers = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(`${API_BASE_URL}${url}`, options);

  // If token expired, try to refresh it
  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshResponse.json();
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update authorization header with new token
      headers["Authorization"] = `Bearer ${newAccessToken}`;
      options.headers = headers;

      // Retry the original request
      response = await fetch(`${API_BASE_URL}${url}`, options);
    } else {
      // Refresh failed, logout user
      await logout();
      window.location.href = "login.html";
      return;
    }
  }

  return response;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initLogoutButton();
});
