// Register user
const API_BASE_URL = "http://localhost:5000/api"
document
  .getElementById("register-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        document.getElementById("register-error").textContent =
          data.message || "Registration failed";
        return;
      }

      // Save tokens and redirect
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify({ username, email, role }));

      // Redirect based on role
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "books.html";
      }
    } catch (err) {
      document.getElementById("register-error").textContent =
        "An error occurred during registration";
      console.error("Registration error:", err);
    }
  });

// Login user
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById("login-error").textContent =
        data.message || "Login failed";
      return;
    }

    // Save tokens and redirect
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    

    // Get user info
    const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (userResponse.ok) {


      const user = await userResponse.json();
      localStorage.setItem("user", JSON.stringify(user));


      // Redirect based on role
      if (user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "books.html";
      }


    } else {
      window.location.href = "books.html";
    }
  } catch (err) {
    document.getElementById("login-error").textContent =
      "An error occurred during login";
    console.error("Login error:", err);
  }
});

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

// Load profile data
document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("profile.html")) {
    try {
      const response = await makeAuthRequest("/users/profile");

      if (response.ok) {
        const user = await response.json();
        displayProfile(user);
      } else {
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Profile error:", err);
      window.location.href = "login.html";
    }
  }
});

// Display profile information
function displayProfile(user) {
  const profileInfo = document.getElementById("profile-info");
  if (profileInfo) {
    profileInfo.innerHTML = `
          <h3>User Information</h3>
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
      `;
  }
}



