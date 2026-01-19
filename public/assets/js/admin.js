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

/* ===== Long-press logo & copyright ===== */
window.addEventListener("DOMContentLoaded", () => {
  const targets = [
    document.getElementById("squdron-icon"),
    document.getElementById("copyright-text")
  ];

  const HOLD_TIME = 2500; // 2.5 seconds
  let pressTimer;

  const goAdmin = () => {
    window.location.href = "https://skyhawk-admin.onrender.com/";
  };

  const startPress = (e) => {
    e.preventDefault(); // prevent selection / tap
    pressTimer = setTimeout(goAdmin, HOLD_TIME);
  };

  const cancelPress = () => clearTimeout(pressTimer);

  targets.forEach((el) => {
    if (!el) return;

    // Desktop
    el.addEventListener("mousedown", startPress);
    el.addEventListener("mouseup", cancelPress);
    el.addEventListener("mouseleave", cancelPress);
    el.addEventListener("dragstart", (e) => e.preventDefault());

    // Mobile
    el.addEventListener("touchstart", startPress, { passive: false });
    el.addEventListener("touchend", cancelPress);
    el.addEventListener("touchcancel", cancelPress);
  });
});
