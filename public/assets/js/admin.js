let keys = [];
const secret = "admin";

document.addEventListener("keydown", (e) => {
  keys.push(e.key.toLowerCase());
  keys = keys.slice(-secret.length);

  if (keys.join("") === secret) {
    window.location.href = "https://skyhawk-admin.onrender.com/";
  }
});