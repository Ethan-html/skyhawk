// boot.js
(function () {
  if (window.self !== window.top) {
    console.log("Easter system blocked inside iframe");
    return;
  }
  const scripts = [
    "/assets/easter/bus.js",
    "/assets/easter/base64.js",
    "/assets/easter/cat.js",
    "/assets/easter/open.js"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  async function init() {
    for (const src of scripts) {
      await loadScript(src); // ensures correct order
    }
    console.log("✅ All scripts loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
