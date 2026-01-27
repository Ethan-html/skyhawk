// open.js
(() => {
  const OPEN_SECRET = "noah";
  let openKeys = [];
  const STORAGE_KEY = "openVidEndTime";

  window.addEventListener("load", () => reviveOpenVidIfNeeded());
  setTimeout(reviveOpenVidIfNeeded, 300);

  document.addEventListener("keydown", (e) => {
    openKeys.push(e.key.toLowerCase());
    openKeys = openKeys.slice(-OPEN_SECRET.length);
    if (openKeys.join("") === OPEN_SECRET) {
      const endTime = Date.now() + 5800; // video duration
      localStorage.setItem(STORAGE_KEY, endTime);
      showOpenVid(endTime);
    }
  });

  function reviveOpenVidIfNeeded() {
    const endTime = Number(localStorage.getItem(STORAGE_KEY));
    if (endTime && Date.now() < endTime) showOpenVid(endTime);
    else localStorage.removeItem(STORAGE_KEY);
  }

  function showOpenVid(endTime) {
    if (!document.body) return setTimeout(() => showOpenVid(endTime), 50);
    if (document.getElementById("openVid")) return;

    // Lock scrolling permanently
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Create iframe underneath video
    const iframe = document.createElement("iframe");
    iframe.src = "/page?page=page/noah";
    iframe.style.position = "absolute";
    iframe.style.top = "100%"; // start below the screen
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.zIndex = "1"; // behind video
    iframe.style.overflow = "auto"; // allow scrolling inside iframe
    iframe.scrolling = "yes";       // ensure iframe scrolls
    iframe.style.pointerEvents = "auto";
    document.body.appendChild(iframe);

    // Create video on top
    const video = document.createElement("video");
    video.id = "openVid";
    video.src = "/assets/easter/open.mp4";
    video.style.position = "fixed";
    video.style.top = "0";
    video.style.left = "0";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    video.style.backgroundColor = "black";
    video.style.zIndex = "2"; // above iframe
    video.style.opacity = "0";
    video.style.transform = "translateY(0)";
    video.style.transition = "opacity 1s ease, transform 1s ease";
    video.autoplay = true;
    video.muted = false;
    video.playsInline = true;

    document.body.appendChild(video);

    // Fade in video
    requestAnimationFrame(() => {
      video.style.opacity = "1";
      video.play().catch(() => console.log("Video autoplay blocked"));
    });

    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) return;

    setTimeout(() => {
      // Slide video up to reveal iframe
      video.style.transform = "translateY(-100%)";
      iframe.style.top = "0"; // slide iframe into view

      setTimeout(() => {
        video.remove();
        // Don't restore body scroll; keep it hidden
        localStorage.removeItem(STORAGE_KEY);
      }, 1000); // match transition duration
    }, timeLeft);
  }
})();
