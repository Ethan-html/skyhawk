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

import { initHeaderFooter } from "/assets/js/header-footer.js";
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
const MAX_ATTEMPTS = 5; // attempts before lock
const LOCK_TIME_MS = 3 * 60 * 1000; // 3 minutes

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

export async function initLogin(db) {
  const auth = getAuth();

  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  if (!form) return; // safety if script loads on wrong page

  const params = new URLSearchParams(window.location.search);
  const isNew = params.has("new");
  const newEmail = params.get("new");
  // If user already completed first-time flow on this browser, skip it
  if (isNew && newEmail) {
    const savedEmail = getCookie("new");

    if (savedEmail && savedEmail.toLowerCase() === newEmail.toLowerCase()) {
      // Already handled before → go to normal login
      window.location.replace("/login");
      return;
    }
  }

  // ================= LOGIN =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let state = getLoginState();
    if (state.lockUntil && Date.now() >= state.lockUntil) {
      clearLoginState();
      state = {};
    }

    if (state.lockUntil && Date.now() < state.lockUntil) {
      const timeLeft = state.lockUntil - Date.now();
      if (errorMsg) {
        errorMsg.style.display = "block";
        errorMsg.style.color = "red";
        errorMsg.textContent = `Too many failed attempts. Try again in ${formatTime(timeLeft)}.`;
      }
      return;
    }
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const email = (usernameEl?.value || "").trim();
    const password = passwordEl?.value || "";

    if (usernameEl) usernameEl.removeAttribute("aria-invalid");
    if (passwordEl) passwordEl.removeAttribute("aria-invalid");
    if (errorMsg) {
      errorMsg.style.display = "block";
      errorMsg.style.color = "#333";
      errorMsg.textContent = "Signing in…";
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      clearLoginState(); // reset failures on success
      const user = userCredential.user;

      const { creationTime, lastSignInTime } = user.metadata;
      const isFirstLogin = creationTime === lastSignInTime;

      if (isFirstLogin) {
        await sendPasswordResetEmail(auth, email);
        alert(
          "A password reset email has been sent. Please check your inbox to set your password."
        );
        await signOut(auth);
        return;
      }

      if (errorMsg) {
        errorMsg.style.color = "green";
        errorMsg.textContent = "Login successful! Redirecting…";
      }
      setCookie("new", user.email);
      sessionStorage.setItem("focusMainAfterRedirect", "1");
      setTimeout(() => (window.location.href = "/member"), 800);
    } catch {
      if (errorMsg) {
        errorMsg.style.display = "block";
        errorMsg.style.color = "red";
      }

      // ---------------------------
      // Update rate limit state
      // ---------------------------
      const nextState = getLoginState();
      nextState.failCount = (nextState.failCount || 0) + 1;
      nextState.lastFail = Date.now();

      let rateMessage = "";

      // Lock triggered
      if (nextState.failCount >= MAX_ATTEMPTS) {
        nextState.failCount = 0;
        nextState.lockUntil = Date.now() + LOCK_TIME_MS;
        rateMessage = ` Too many failed attempts. Login locked for ${formatTime(LOCK_TIME_MS)}.`;
      }
      // Show countdown ONLY when 3 or fewer attempts left
      else {
        const remaining = MAX_ATTEMPTS - nextState.failCount;
        if (remaining <= 3) {
          rateMessage = ` ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`;
        }
      }

      setLoginState(nextState);

      // ---------------------------
      // Combine messages + a11y
      // ---------------------------
      if (errorMsg) errorMsg.textContent = "Login failed." + rateMessage;
      if (usernameEl) usernameEl.setAttribute("aria-invalid", "true");
      if (passwordEl) passwordEl.setAttribute("aria-invalid", "true");
    }
  });

  // ================= PASSWORD RESET UI =================
  const loginForm = document.getElementById("loginForm");
  const forgotLink = document.getElementById("forgot-password-link");
  const resetSection = document.getElementById("password-reset-section");
  const firstTimeSection = document.getElementById("first-time-section");
  const backToLogin = document.getElementById("back-to-login");
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

  resendResetLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = firstTimeEmailInput.value.trim() || newEmail;
    if (!email) return alert("Missing email address. Please return to login.");

    resendResetLink.textContent = "Sending…";
    resendResetLink.style.pointerEvents = "none";

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      resendResetLink.textContent = "Email sent!";
    } catch {
      resendResetLink.textContent = "Resend email";
      resendResetLink.style.pointerEvents = "auto";
      alert("Failed to resend email. Please try again.");
    }
  });

  if (isNew && firstTimeSection) {
    loginForm.style.display = "none";
    if (forgotLink) forgotLink.style.display = "none";
    firstTimeSection.style.display = "block";
    firstTimeEmailInput.value = newEmail || "";
    firstTimeEmailInput.focus();
  }

  forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgotLink.style.display = "none";
    resetSection.style.display = "block";
  });

  backToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    resetSection.style.display = "none";
    loginForm.style.display = "block";
    forgotLink.style.display = "inline";
    resetStatus.textContent = "";
    resetEmailInput.value = "";
  });

  resetBtn?.addEventListener("click", async () => {
    const email = resetEmailInput.value.trim();
    if (!email) {
      resetStatus.style.color = "red";
      resetStatus.textContent = "Please enter your email address.";
      return;
    }

    resetStatus.style.color = "#333";
    resetStatus.textContent = "Sending password reset email…";

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      resetStatus.style.color = "green";
      resetStatus.textContent = "Password reset email sent! Please check your inbox.";
      resetEmailInput.value = "";
    } catch (err) {
      resetStatus.style.color = "red";
      resetStatus.textContent =
        err.code === "auth/user-not-found"
          ? "No account found with that email."
          : err.code === "auth/invalid-email"
            ? "Invalid email address."
            : "Failed to send reset email. Please try again later.";
    }
  });

  firstTimeResetBtn?.addEventListener("click", async () => {
    const email = firstTimeEmailInput.value.trim();
    if (!email) {
      firstResetStatus.style.color = "red";
      firstResetStatus.textContent = "Please enter your email address.";
      return;
    }

    firstResetStatus.style.color = "#333";
    firstResetStatus.textContent = "Sending password reset email…";

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      firstTimeSection.style.display = "none";
      firstTimeResetSection.style.display = "block";
    } catch {
      firstResetStatus.style.color = "red";
      firstResetStatus.textContent = "Failed to send reset email. Please try again later.";
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user && !isNew) {
      sessionStorage.setItem("focusMainAfterRedirect", "1");
      window.location.href = "/member";
    }
  });

  await initHeaderFooter(db);
}
