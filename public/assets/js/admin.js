/* ===== Secret keyboard shortcut ===== */
let keys = [];
const secret = "admin";

document.addEventListener("keydown", (e) => {
  keys.push(e.key.toLowerCase());
  keys = keys.slice(-secret.length);

  if (keys.join("") === secret) {
    window.location.href = "https://skyhawk-admin.onrender.com/";
  }
});

/* ===== Long‑press logo ===== */
window.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("squdron-icon");
  if (!logo) return;

  let pressTimer;
  const HOLD_TIME = 2500; // 2.5 seconds

  const goAdmin = () => {
    window.location.href = "https://skyhawk-admin.onrender.com/";
  };

  const startPress = (e) => {
    e.preventDefault(); // prevent drag/tap highlighting
    pressTimer = setTimeout(goAdmin, HOLD_TIME);
  };

  const cancelPress = () => clearTimeout(pressTimer);

  // Desktop
  logo.addEventListener("mousedown", startPress);
  logo.addEventListener("mouseup", cancelPress);
  logo.addEventListener("mouseleave", cancelPress);
  logo.addEventListener("dragstart", (e) => e.preventDefault()); // prevent dragging

  // Mobile
  logo.addEventListener("touchstart", startPress, { passive: false });
  logo.addEventListener("touchend", cancelPress);
  logo.addEventListener("touchcancel", cancelPress);
});
