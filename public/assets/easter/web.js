// ethan-glitch.js
(() => {
  const SECRET = "ethan";
  const STORAGE_KEY = "ethanGlitchState";
  const ICON_ID = "squadron-icon";

  let keys = [];

  window.addEventListener("load", () => {
    reviveState();
  });

  document.addEventListener("keydown", (e) => {
    keys.push(e.key.toLowerCase());
    keys = keys.slice(-SECRET.length);

    if (keys.join("") === SECRET) {
      triggerSecret();
    }
  });

  function getState() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { active: false };
  }

  function setState(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function triggerSecret() {
    const state = getState();

    // If already read, do nothing
    if (state.read === true) return;

    // If inactive, activate hint 1
    if (!state.active) {
      setState({ active: true, hint: 1, read: false });
      glitchFade(() => injectGlitchIcon());
      return;
    }

    // Active but unread → show icon
    if (state.active && state.read === false) {
      injectGlitchIcon();
    }
  }

  function reviveState() {
    const state = getState();
    if (state.active && state.read === false) {
      injectGlitchIcon();
    }
  }

  function glitchFade(callback) {
    document.body.style.transition = "opacity 1s ease";
    document.body.style.opacity = "0";

    setTimeout(() => {
      if (callback) callback();
      document.body.style.opacity = "1";
    }, 1000);
  }

  function injectGlitchIcon() {
    const icon = document.getElementById(ICON_ID);
    if (!icon) return;

    icon.src = "/assets/easter/cr.webp";
    icon.style.cursor = "pointer";
    icon.onclick = openClueBox;
  }

  function restoreNormalIcon() {
    const icon = document.getElementById(ICON_ID);
    if (!icon) return;

    icon.src = "/assets/normal-icon.webp"; // replace with your normal icon
    icon.style.cursor = "default";
    icon.onclick = null;
  }

  // -----------------------------
  // First box: SYSTEM DIAGNOSTIC
  // -----------------------------
  function openClueBox() {
    if (document.getElementById("ethanGlitchOverlay")) return;

    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.id = "ethanGlitchOverlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.92)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999999";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease";

    const panel = document.createElement("div");
    panel.style.width = "700px";
    panel.style.maxWidth = "95%";
    panel.style.background = "#fff";
    panel.style.color = "#111";
    panel.style.borderRadius = "10px";
    panel.style.boxShadow = "0 25px 100px rgba(0,0,0,0.8)";
    panel.style.fontFamily = "Consolas, monospace";
    panel.style.overflow = "hidden";

    panel.innerHTML = `
      <div style="background:#202124;color:#fff;padding:15px 20px;font-size:14px;">
        SYSTEM DIAGNOSTIC INTERFACE
      </div>
      <div style="padding:30px 30px 40px;">
        <div style="font-size:16px;margin-bottom:15px;">⚠ Anomaly has been detected.</div>
        <div style="font-size:13px;color:#444;margin-bottom:25px;">
          Unauthorized behavioral pattern located within client runtime.
        </div>
        <button id="readLogBtn" style="
          background:#202124;
          color:#fff;
          border:none;
          padding:10px 20px;
          font-size:13px;
          cursor:pointer;
          border-radius:4px;
        ">Read Log</button>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => (overlay.style.opacity = "1"));

    document.getElementById("readLogBtn").onclick = showLog;
  }

  // -----------------------------
  // Second box: ERROR LOG
  // -----------------------------
  function showLog() {
    const overlay = document.getElementById("ethanGlitchOverlay");
    if (!overlay) return;

    overlay.innerHTML = `
      <div style="
        width:700px;
        max-width:95%;
        background:#fff;
        color:#111;
        border-radius:10px;
        box-shadow:0 25px 100px rgba(0,0,0,0.8);
        font-family:Consolas, monospace;
        overflow:hidden;
      ">
        <div style="background:#202124;color:#fff;padding:15px 20px;font-size:14px;">
          ERROR LOG — TRACE RECORD 01
        </div>
        <div style="padding:25px 30px 40px;font-size:13px;line-height:1.6;">
          <div>[12:04:22] Runtime anomaly confirmed.</div>
          <div>[12:04:23] Pattern source unidentified.</div>
          <div>[12:04:24] Trace vector redirected.</div>
          <div>[12:04:25] Log marker inserted.</div>
          <div style="margin-top:15px;">
            > A Incorect Date was detected in a photo
          </div>
        </div>
        <div style="height:4px;background:#e0e0e0;position:relative;overflow:hidden;">
          <div id="collapseBar" style="height:100%;width:100%;background:#202124;transition:width 4s linear;"></div>
        </div>
      </div>
    `;

    const bar = document.getElementById("collapseBar");
    requestAnimationFrame(() => (bar.style.width = "0%"));

    // ✅ When bar finishes, save state and reload
    setTimeout(() => {
      setState({ active: true, hint: 1, read: true });
      closeOverlay();
    }, 4000);
  }

  function closeOverlay() {
    const overlay = document.getElementById("ethanGlitchOverlay");
    if (!overlay) return;

    overlay.style.opacity = "0";
    restoreNormalIcon();

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
      location.reload(); // reset page
    }, 500);
  }

  // -----------------------------
  // Hint 1 bonus on /photos
  // -----------------------------
  function photoPageHintWatcher() {
    const state = getState();

    // Only run if hint 1 has been read
    if (!state.active || !state.read) return;

    // Only on /photos or /photos/
    if (!window.location.pathname.startsWith("/photos")) return;

    const yearSelect = document.getElementById("yearSelect");
    const monthSelect = document.getElementById("monthSelect");
    const eventSelect = document.getElementById("eventSelect");
    const photoTypeSelect = document.getElementById("photoTypeSelect");

    // Wait until selects exist
    if (!yearSelect || !monthSelect || !eventSelect || !photoTypeSelect) {
      setTimeout(photoPageHintWatcher, 500);
      return;
    }

    // Force photo type to "meeting" (adjust if needed)
    if (photoTypeSelect.value !== "meeting") {
      photoTypeSelect.value = "meeting";
      photoTypeSelect.dispatchEvent(new Event("change"));
      setTimeout(photoPageHintWatcher, 500);
      return;
    }

    // Make sure selects are visible
    yearSelect.style.display = "inline-block";
    monthSelect.style.display = "inline-block";
    eventSelect.style.display = "inline-block";

    const secretYear = "1940";
    const secretMonth = "March";
    const secretEvent = "Historic Flight Event";

    // Add missing options if needed
    if (!Array.from(yearSelect.options).some((o) => o.value === secretYear)) {
      yearSelect.innerHTML += `<option value="${secretYear}">${secretYear}</option>`;
    }
    if (!Array.from(monthSelect.options).some((o) => o.value === secretMonth)) {
      monthSelect.innerHTML += `<option value="${secretMonth}">${secretMonth}</option>`;
    }
    if (!Array.from(eventSelect.options).some((o) => o.value === secretEvent)) {
      eventSelect.innerHTML += `<option value="${secretEvent}">${secretEvent}</option>`;
    }

    // Auto-select the secret values
    yearSelect.value = secretYear;
    monthSelect.value = secretMonth;
    eventSelect.value = secretEvent;

    // Trigger gallery JS to notice changes
    yearSelect.dispatchEvent(new Event("change"));
    monthSelect.dispatchEvent(new Event("change"));
    eventSelect.dispatchEvent(new Event("change"));

    // Show alert once
    if (
      yearSelect.value === secretYear &&
      monthSelect.value === secretMonth &&
      eventSelect.value === secretEvent
    ) {
      if (!window.__hint1AlertShown) {
        alert("⚠ ERROR FOUND AND FIXED");
        window.__hint1AlertShown = true;
      }
    }

    // Repeat every 5 seconds to survive gallery JS overwrites
    setTimeout(photoPageHintWatcher, 5000);
  }

  // Start the watcher after page load
  window.addEventListener("load", () => {
    photoPageHintWatcher();
  });

  // Start the watcher after page load
  window.addEventListener("load", () => {
    photoPageHintWatcher();
  });
})();
