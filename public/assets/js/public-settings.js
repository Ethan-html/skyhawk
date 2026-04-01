// public-settings.js
// Reads Firestore document: collection "admin", document ID "settings".
// Fields: maintenanceMode (boolean) → full-page maintenance; announcementBanner (string) → top banner.

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Normalize maintenanceMode (Firestore may store boolean or string "true"/"1").
 */
function isMaintenanceMode(value) {
  if (value === true) return true;
  if (typeof value === "string" && (value.toLowerCase() === "true" || value === "1")) return true;
  return false;
}

/**
 * Normalize announcementBanner to a string (Firestore may store string or other).
 */
function getAnnouncementBanner(value) {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}

/**
 * Fetch public settings from Firestore (admin/settings).
 * Document path: collection "admin", document ID "settings".
 * Expected fields: maintenanceMode (boolean or "true"), announcementBanner (string).
 * @param {FirebaseFirestore.Firestore} db
 * @returns {Promise<{ maintenanceMode: boolean, announcementBanner: string }>}
 */
export async function fetchPublicSettings(db) {
  try {
    const ref = doc(db, "admin", "settings");
    const snap = await getDoc(ref);
    const raw = snap.exists() ? snap.data() : {};
    return {
      maintenanceMode: isMaintenanceMode(raw.maintenanceMode),
      announcementBanner: getAnnouncementBanner(raw.announcementBanner)
    };
  } catch (err) {
    console.warn("[public-settings] Failed to load admin/settings:", err);
    return { maintenanceMode: false, announcementBanner: "" };
  }
}

/**
 * Replace the page with a full-screen maintenance message. No way to bypass.
 */
export function renderMaintenancePage() {
  // Lock scrolling
  document.documentElement.classList.add("overflow-hidden");
  document.body.className = "m-0 p-0 overflow-hidden";

  document.body.innerHTML = `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900">
      <div class="w-[90%] max-w-md rounded-2xl bg-slate-800 p-8 text-center text-slate-100 shadow-2xl">
        
        <div class="mb-4 text-4xl">⚙</div>
        
        <h1 class="mb-3 text-2xl font-semibold">
          We'll be right back
        </h1>
        
        <p class="mb-2 text-base text-slate-300">
          This site is currently under maintenance. Please check back soon.
        </p>
        
        <p class="text-sm text-slate-400">
          Thank you for your patience.
        </p>
      </div>
    </div>
  `;
}

/**
 * Render the announcement banner at the top of the page if announcementBanner is set.
 * Uses existing .special-notice-alert-box styles. Banner can be closed by the user.
 * @param {string} [text] - HTML or plain text for the banner (admin-controlled).
 */
export function initAnnouncementBanner(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return;

  if (document.getElementById("announcement-banner-root")) return;

  const root = document.createElement("div");
  root.id = "announcement-banner-root";

  const box = document.createElement("div");
  box.className = "w-full text-white border-b border-black/40";
  box.style.backgroundColor = "#001489";

  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Announcement");

  box.innerHTML = `
    <div class="relative flex items-center h-14">

      <!-- LEFT RED LABEL (BIGGER + STRONGER) -->
      <div class="bg-red-700 h-full flex items-center px-2 text-base md:text-lg font-bold tracking-wide">
        SPECIAL NOTICE
      </div>

      <!-- CENTER TEXT -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none px-24">
        <p class="announcement-banner-message text-sm md:text-base font-semibold text-center">
        </p>
      </div>

      <!-- RIGHT CLOSE BUTTON (BIGGER BOX) -->
      <div class="ml-auto pr-4 flex items-center h-full">
        <button
          type="button"
          id="close-alert-btn"
          class="flex items-center justify-center h-10 w-10 border-2 border-white hover:bg-white/10 transition"
          aria-label="Close announcement"
        >
          <span class="text-2xl leading-none">&times;</span>
        </button>
      </div>

    </div>
  `;

  const messageEl = box.querySelector(".announcement-banner-message");
  if (messageEl) messageEl.innerHTML = trimmed;

  root.appendChild(box);

  const closeBtn = box.querySelector("#close-alert-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      root.style.display = "none";
    });
  }

  document.body.insertBefore(root, document.body.firstChild);
}