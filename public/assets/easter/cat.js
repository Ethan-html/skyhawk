// cat.js
(() => {
  const CAT_SECRET = "allie";
  let catKeys = [];
  const STORAGE_KEY = "catEggEndTime";

  // Wait until full page is ready (safer than DOMContentLoaded alone)
  window.addEventListener("load", () => {
    reviveCatIfNeeded();
  });

  // Also try shortly after in case other scripts delay layout
  setTimeout(reviveCatIfNeeded, 300);

  function reviveCatIfNeeded() {
    const endTime = Number(localStorage.getItem(STORAGE_KEY));
    if (endTime && Date.now() < endTime) {
      showCat(endTime);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Secret key detection
  document.addEventListener("keydown", (e) => {
    catKeys.push(e.key.toLowerCase());
    catKeys = catKeys.slice(-CAT_SECRET.length);

    if (catKeys.join("") === CAT_SECRET) {
      const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes
      localStorage.setItem(STORAGE_KEY, endTime);
      showCat(endTime);
    }
  });

  function showCat(endTime) {
    // Wait until body exists
    if (!document.body) {
      return setTimeout(() => showCat(endTime), 50);
    }

    // Prevent duplicates
    if (document.getElementById("catEggImg")) return;

    const img = document.createElement("img");
    img.id = "catEggImg";
    img.src = "/assets/easter/cat.gif"; // leading slash helps on subpages
    img.style.position = "fixed";
    img.style.bottom = "0";
    img.style.left = "10px";
    img.style.width = "120px";
    img.style.zIndex = "999999";
    img.style.pointerEvents = "none";
    img.style.opacity = "0";
    img.style.transition = "opacity 0.5s ease";

    document.body.appendChild(img);

    requestAnimationFrame(() => {
      img.style.opacity = "1";
    });
    const audio = document.createElement("audio");
    audio.src = "/assets/easter/cat.mp3"; // leading slash = safer path
    audio.volume = 0.8; // optional
    audio.play().catch(() => {
      // Autoplay can fail if user hasn’t interacted with page yet
      console.log("Audio autoplay blocked");
    });
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) return;

    setTimeout(() => {
      img.style.opacity = "0";
      setTimeout(() => {
        img.remove();
        localStorage.removeItem(STORAGE_KEY);
      }, 500);
    }, timeLeft);
  }
})();
