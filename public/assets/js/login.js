// ==============================
// Firebase
// ==============================
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ================= Cookies =================
function setCookie(name, value, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1] || "") : r;
  }, "");
}

// ==============================
// Login Rate Limiting
// ==============================
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 3 * 60 * 1000;

function getLoginState() {
  return JSON.parse(sessionStorage.getItem("loginRateLimit") || "{}");
}

function setLoginState(state) {
  sessionStorage.setItem("loginRateLimit", JSON.stringify(state));
}

function clearLoginState() {
  sessionStorage.removeItem("loginRateLimit");
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

// ==============================
// Initialize Login
// ==============================
export async function initLogin(db) {
  void db;
  const auth = getAuth();

  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const isNew = params.has("new");
  const newEmail = params.get("new");

  // Skip first-time flow if already handled
  if (isNew && newEmail) {
    const savedEmail = getCookie("new");
    if (savedEmail?.toLowerCase() === newEmail.toLowerCase()) {
      window.location.replace("/login");
      return;
    }
  }

  // ================= LOGIN HANDLER =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let state = getLoginState();
    if (state.lockUntil && Date.now() >= state.lockUntil) {
      clearLoginState();
      state = {};
    }

    if (state.lockUntil && Date.now() < state.lockUntil) {
      const timeLeft = state.lockUntil - Date.now();
      errorMsg?.classList.remove("text-green-500");
      errorMsg?.classList.add("text-red-500");
      errorMsg?.classList.remove("hidden");
      errorMsg && (errorMsg.textContent = `Too many failed attempts. Try again in ${formatTime(timeLeft)}.`);
      return;
    }

    const email = document.getElementById("username")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";

    document.getElementById("username")?.removeAttribute("aria-invalid");
    document.getElementById("password")?.removeAttribute("aria-invalid");
    errorMsg?.classList.remove("text-red-500", "text-green-500");
    errorMsg?.classList.remove("hidden");
    errorMsg && (errorMsg.textContent = "Signing in…");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      clearLoginState();
      const user = userCredential.user;

      const { creationTime, lastSignInTime } = user.metadata;
      const isFirstLogin = creationTime === lastSignInTime;

      if (isFirstLogin) {
        await sendPasswordResetEmail(auth, email);
        alert("A password reset email has been sent. Please check your inbox to set your password.");
        await signOut(auth);
        return;
      }

      errorMsg?.classList.add("text-green-500");
      errorMsg && (errorMsg.textContent = "Login successful! Redirecting…");
      setCookie("new", user.email);
      sessionStorage.setItem("focusMainAfterRedirect", "1");
      setTimeout(() => (window.location.href = "/member"), 800);
    } catch {
      const nextState = getLoginState();
      nextState.failCount = (nextState.failCount || 0) + 1;
      nextState.lastFail = Date.now();

      let rateMessage = "";
      if (nextState.failCount >= MAX_ATTEMPTS) {
        nextState.failCount = 0;
        nextState.lockUntil = Date.now() + LOCK_TIME_MS;
        rateMessage = ` Too many failed attempts. Login locked for ${formatTime(LOCK_TIME_MS)}.`;
      } else {
        const remaining = MAX_ATTEMPTS - nextState.failCount;
        if (remaining <= 3) rateMessage = ` ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`;
      }

      setLoginState(nextState);

      errorMsg?.classList.remove("text-green-500");
      errorMsg?.classList.add("text-red-500");
      errorMsg && (errorMsg.textContent = "Login failed." + rateMessage);

      document.getElementById("username")?.setAttribute("aria-invalid", "true");
      document.getElementById("password")?.setAttribute("aria-invalid", "true");
    }
  });

  // ================= PASSWORD RESET =================
  const loginForm = document.getElementById("loginForm");
  const forgotLink = document.getElementById("forgot-password-link");
  const requestlink = document.getElementById("request-account-link");
  const loginheader = document.getElementById("login-header");
  const resetSection = document.getElementById("password-reset-section");
  const firstTimeSection = document.getElementById("first-time-section");
  const resetEmailInput = document.getElementById("reset-email");
  const firstTimeEmailInput = document.getElementById("first-time-email");
  const resetStatus = document.getElementById("reset-status");
  const resetBtn = document.getElementById("reset-password-btn");
  const firstTimeResetBtn = document.getElementById("first-time-reset-btn");
  const firstResetStatus = document.getElementById("first-reset-status");
  const firstTimeResetSection = document.getElementById("first-time-reset-section");
  const resendResetLink = document.getElementById("resend-reset-email");

  const actionCodeSettings = {
    url: "https://skyhawk-cap.org/login",
    handleCodeInApp: false
  };

  // Resend link handler
  resendResetLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = firstTimeEmailInput.value.trim() || newEmail;
    if (!email) return alert("Missing email address. Please return to login.");

    resendResetLink.textContent = "Sending…";
    resendResetLink.disabled = true;

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      resendResetLink.textContent = "Email sent!";
    } catch {
      resendResetLink.textContent = "Resend email";
      resendResetLink.disabled = false;
      alert("Failed to resend email. Please try again.");
    }
  });

  // First-time account flow
  if (isNew && firstTimeSection) {
    loginForm.classList.add("hidden");
    forgotLink?.classList.add("hidden");
    requestlink.classList.add("hidden");
    firstTimeSection.classList.remove("hidden");
    firstTimeEmailInput.value = newEmail || "";
    firstTimeEmailInput.focus();
  }

  // Forgot password toggle
  forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const showingReset = forgotLink.textContent !== "Forgot Password?";
    if (!showingReset) {
      loginForm.classList.add("hidden");
      resetSection.classList.remove("hidden");
      loginheader.textContent = "Reset Your Password";
      forgotLink.textContent = "Back to Login";
      requestlink?.classList.add("hidden");
    } else {
      loginForm.classList.remove("hidden");
      resetSection.classList.add("hidden");
      loginheader.textContent = "Member Login";
      forgotLink.textContent = "Forgot Password?";
      resetEmailInput.value = "";
      resetStatus.textContent = "";
      requestlink?.classList.remove("hidden");
    }
  });

  // Reset password button
  resetBtn?.addEventListener("click", async () => {
    const email = resetEmailInput.value.trim();
    if (!email) {
      resetStatus.className = "text-red-500";
      resetStatus.textContent = "Please enter your email address.";
      return;
    }

    resetStatus.className = "text-gray-800";
    resetStatus.textContent = "Sending password reset email…";

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      resetStatus.className = "text-green-500";
      resetStatus.textContent = "Password reset email sent! Please check your inbox.";
      resetEmailInput.value = "";
    } catch (err) {
      resetStatus.className = "text-red-500";
      resetStatus.textContent =
        err.code === "auth/user-not-found"
          ? "No account found with that email."
          : err.code === "auth/invalid-email"
          ? "Invalid email address."
          : "Failed to send reset email. Please try again later.";
    }
  });

  // First-time reset button
  firstTimeResetBtn?.addEventListener("click", async () => {
    const email = firstTimeEmailInput.value.trim();
    if (!email) {
      firstResetStatus.className = "text-red-500";
      firstResetStatus.textContent = "Please enter your email address.";
      return;
    }

    firstResetStatus.className = "text-gray-800";
    firstResetStatus.textContent = "Sending password reset email…";

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      firstTimeSection.classList.add("hidden");
      firstTimeResetSection.classList.remove("hidden");
    } catch {
      firstResetStatus.className = "text-red-500";
      firstResetStatus.textContent = "Failed to send reset email. Please try again later.";
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user && !isNew) {
      sessionStorage.setItem("focusMainAfterRedirect", "1");
      window.location.href = "/member";
    }
  });
}



