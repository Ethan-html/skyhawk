// pig.js
(() => {
  const SECRET = "devon";
  const STORAGE_KEY = "pigVideoPlayed";
  let keys = [];

  console.log("Devon script loaded");

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    console.log("Devon video already played — blocked");
    return;
  }

  document.addEventListener("keydown", (e) => {
    keys.push(e.key.toLowerCase());
    keys = keys.slice(-SECRET.length);

    if (keys.join("") === SECRET) {
      console.log("Devon code detected");
      playVideoOnce();
    }
  });

  function playVideoOnce() {
    if (document.getElementById("devonVideoOverlay")) return;

    localStorage.setItem(STORAGE_KEY, "true");

const overlay = document.createElement("div");
overlay.id = "devonVideoOverlay";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.background = "black";
overlay.style.zIndex = "999999";
overlay.style.opacity = "0";
overlay.style.transition = "opacity 1s ease";
overlay.style.overflow = "hidden";


const video = document.createElement("video");
video.src = "/assets/easter/pig.mp4";
video.autoplay = true;
video.playsInline = true;
video.style.width = "100%";
video.style.height = "100%";
video.style.objectFit = "fill"; // 🔥 stretch to fit screen
video.style.display = "block";
video.style.background = "black";



    // Lock scrolling (safer way)
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    overlay.appendChild(video);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    video.addEventListener("ended", () => {
      fadeOutAndCleanup();
    });

    video.addEventListener("error", (e) => {
      console.error("Video failed to load:", e);
    });

    video.play().catch(err => {
      console.warn("Autoplay prevented:", err);
    });

    function fadeOutAndCleanup() {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }, 1000);
    }
  }
})();
