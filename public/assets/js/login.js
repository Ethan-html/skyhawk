// ==============================
// Firebase
// ==============================
import { getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { initHeaderFooter } from "/assets/js/header-footer.js";
  //================== Cookies ============================
  function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie.split("; ").reduce((r, v) => {
      const parts = v.split("=");
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, "");
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

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    errorMsg.style.display = "block";
    errorMsg.style.color = "#333";
    errorMsg.textContent = "Signing in…";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const { creationTime, lastSignInTime } = user.metadata;
      const isFirstLogin = creationTime === lastSignInTime;

      if (isFirstLogin) {
        await sendPasswordResetEmail(auth, email);
        alert("A password reset email has been sent. Please check your inbox to set your password.");
        await auth.signOut();
        return;
      }

      errorMsg.style.color = "green";
      errorMsg.textContent = "Login successful! Redirecting…";
      setCookie("new", user.email);
      setTimeout(() => window.location.href = "/member", 800);

    } catch (err) {
      errorMsg.style.color = "red";

      switch (err.code) {
        case "auth/user-not-found": errorMsg.textContent = "No account found for this email."; break;
        case "auth/wrong-password": errorMsg.textContent = "Incorrect password."; break;
        case "auth/invalid-email": errorMsg.textContent = "Invalid email address."; break;
        default: errorMsg.textContent = "Login failed. Please try again.";
      }
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
    handleCodeInApp: false,
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
    forgotLink.style.display = "none";
    firstTimeSection.style.display = "block";
    firstTimeEmailInput.value = newEmail || "";
    firstTimeEmailInput.focus();
  }

  forgotLink?.addEventListener("click", e => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgotLink.style.display = "none";
    resetSection.style.display = "block";
  });

  backToLogin?.addEventListener("click", e => {
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
        err.code === "auth/user-not-found" ? "No account found with that email." :
        err.code === "auth/invalid-email" ? "Invalid email address." :
        "Failed to send reset email. Please try again later.";
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

  onAuthStateChanged(auth, user => {
    if (user && !isNew) window.location.href = "/member";
  });

  await initHeaderFooter(db);
}