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
  document.documentElement.style.overflow = "hidden";
  document.body.style.display = "block";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.body.className = "maintenance-page";
  document.body.innerHTML = `
    <div class="maintenance-page-backdrop">
      <div class="maintenance-page-card">
        <div class="maintenance-page-icon" aria-hidden="true">&#9881;</div>
        <h1 class="maintenance-page-title">We'll be right back</h1>
        <p class="maintenance-page-text">This site is currently under maintenance. Please check back soon.</p>
        <p class="maintenance-page-subtext">Thank you for your patience.</p>
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

  const existing = document.getElementById("announcement-banner-root");
  if (existing) return;

  const root = document.createElement("div");
  root.id = "announcement-banner-root";

  const box = document.createElement("div");
  box.className = "special-notice-alert-box";
  box.style.display = "block";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Announcement");

  box.innerHTML = `
    <div class="special-notice-container-2">
      <div class="special-notice-title-holder-2">
        <div class="special-notice-title-2">Special Notice</div>
      </div>
      <div class="special-notice-text-holder-2">
        <div class="slider-alert">
          <div class="div-block-10">
            <div class="div-block-8">
              <div class="text-block-9">
                <div class="bold-text-2">
                  <p class="announcement-banner-message"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="special-notice-close-2" id="close-alert-btn" aria-label="Close announcement">
        <span aria-hidden="true">&times;</span>
      </button>
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
