const API_BASE = "http://localhost:5000";

// ─── Cart badge ───────────────────────────────────────────────────────────────
(function initCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        badge.textContent = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    } catch {}
})();

// ─── Logout ───────────────────────────────────────────────────────────────────
function handleLogout() {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${userData.token || ""}` }
    }).finally(() => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
}

// ─── Navbar auth state ────────────────────────────────────────────────────────
(function checkAuthNav() {
    const authNavItem = document.getElementById("auth-nav-item");
    if (!authNavItem) return;
    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user && user.token) {
            const firstName = (user.fullName || user.email || "User").split(" ")[0];
            authNavItem.innerHTML = `
                <div class="user-menu">
                    <button class="user-greeting-btn" type="button">Hi, ${firstName} &#9662;</button>
                    <div class="user-dropdown">
                        <button class="user-logout-btn" type="button">Logout</button>
                    </div>
                </div>
            `;
            const greetingBtn = authNavItem.querySelector(".user-greeting-btn");
            const dropdown = authNavItem.querySelector(".user-dropdown");

            greetingBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.classList.toggle("active");
            });

            document.addEventListener("click", () => {
                dropdown.classList.remove("active");
            });

            authNavItem.querySelector(".user-logout-btn").addEventListener("click", handleLogout);
        } else {
            authNavItem.innerHTML = '<a href="login.html">Login</a>';
        }
    } catch {}
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showError(message) {
    const banner = document.getElementById("error-banner");
    if (!banner) return;
    banner.textContent = message;
    banner.style.display = "block";
}

function hideError() {
    const banner = document.getElementById("error-banner");
    if (banner) banner.style.display = "none";
}

function showSuccess(message) {
    const banner = document.getElementById("success-banner");
    if (!banner) return;
    banner.textContent = message;
    banner.style.display = "block";
}

function setLoading(btn, loading) {
    const text = btn.querySelector(".btn-text");
    const spinner = btn.querySelector(".btn-spinner");
    if (loading) {
        btn.disabled = true;
        btn.dataset.orig = text.textContent;
        spinner.style.display = "inline-block";
        text.textContent = "Please wait...";
    } else {
        btn.disabled = false;
        spinner.style.display = "none";
        text.textContent = btn.dataset.orig || text.textContent;
    }
}

function saveUserAndRedirect(data) {
    localStorage.setItem("user", JSON.stringify({
        token: data.token,
        email: data.user.email,
        fullName: data.user.fullName,
        userId: data.user.id
    }));
    window.location.href = "index.html";
}

// ─── Login form ───────────────────────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
    const eyeToggle = document.getElementById("eye-toggle");
    const pwInput = document.getElementById("password");

    eyeToggle.addEventListener("click", () => {
        const isPassword = pwInput.type === "password";
        pwInput.type = isPassword ? "text" : "password";
        eyeToggle.textContent = isPassword ? "🙈" : "👁";
    });

    loginForm.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", hideError);
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById("email").value.trim();
        const password = pwInput.value;
        const btn = document.getElementById("login-btn");

        if (!email || !password) {
            showError("Please fill in all fields.");
            return;
        }

        setLoading(btn, true);
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                showError(data.error || "Login failed. Please try again.");
                return;
            }
            saveUserAndRedirect(data);
        } catch {
            showError("Unable to reach the server. Is the backend running?");
        } finally {
            setLoading(btn, false);
        }
    });
}

// ─── Signup form ──────────────────────────────────────────────────────────────
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    const emailInput     = document.getElementById("email");
    const passwordInput  = document.getElementById("password");
    const confirmInput   = document.getElementById("confirmPassword");
    const emailStatus    = document.getElementById("email-status");
    const confirmStatus  = document.getElementById("confirm-status");
    const strengthWrap   = document.getElementById("password-strength");
    const strengthFill   = document.getElementById("strength-fill");
    const strengthLabel  = document.getElementById("strength-label");
    const eyeToggle      = document.getElementById("eye-toggle");

    eyeToggle.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        eyeToggle.textContent = isPassword ? "🙈" : "👁";
    });

    signupForm.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", hideError);
    });

    // Email validation indicator
    emailInput.addEventListener("input", () => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        if (!emailInput.value) {
            emailStatus.textContent = "";
            return;
        }
        emailStatus.textContent = valid ? "✅" : "❌";
        emailStatus.style.color = valid ? "#22c55e" : "#ef4444";
    });

    // Password strength indicator
    passwordInput.addEventListener("input", () => {
        const val = passwordInput.value;
        if (!val) {
            strengthWrap.style.display = "none";
            return;
        }
        strengthWrap.style.display = "flex";

        let score = 0;
        if (val.length >= 6)  score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { label: "Weak",   color: "#ef4444", width: "25%" },
            { label: "Fair",   color: "#f97316", width: "50%" },
            { label: "Good",   color: "#eab308", width: "75%" },
            { label: "Strong", color: "#22c55e", width: "100%" },
        ];
        const lvl = levels[Math.min(score - 1, 3)] || levels[0];
        strengthFill.style.width      = lvl.width;
        strengthFill.style.background = lvl.color;
        strengthLabel.textContent     = lvl.label;
        strengthLabel.style.color     = lvl.color;

        if (confirmInput.value) {
            const match = confirmInput.value === val;
            confirmStatus.textContent = match ? "✅" : "❌";
            confirmStatus.style.color = match ? "#22c55e" : "#ef4444";
        }
    });

    // Confirm password match indicator
    confirmInput.addEventListener("input", () => {
        if (!confirmInput.value) { confirmStatus.textContent = ""; return; }
        const match = confirmInput.value === passwordInput.value;
        confirmStatus.textContent = match ? "✅" : "❌";
        confirmStatus.style.color = match ? "#22c55e" : "#ef4444";
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const fullName        = document.getElementById("fullName").value.trim();
        const email           = emailInput.value.trim();
        const password        = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const btn             = document.getElementById("signup-btn");

        if (!fullName || !email || !password || !confirmPassword) {
            showError("Please fill in all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        setLoading(btn, true);
        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName })
            });
            const data = await res.json();
            if (!res.ok) {
                showError(data.error || "Signup failed. Please try again.");
                return;
            }

            if (data.token) {
                saveUserAndRedirect(data);
            } else {
                showSuccess("Account created! Check your email to confirm your account, then login.");
                signupForm.reset();
                strengthWrap.style.display = "none";
                emailStatus.textContent = "";
                confirmStatus.textContent = "";
            }
        } catch {
            showError("Unable to reach the server. Is the backend running?");
        } finally {
            setLoading(btn, false);
        }
    });
}
