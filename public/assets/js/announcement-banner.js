import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "site_public_settings";
const BANNER_ID = "global-announcement-banner";

function getBannerText(settings) {
  const value = settings?.announcementBanner;
  if (typeof value !== "string") return "";
  return value.trim();
}

function renderAnnouncementBanner(rawHtml) {
  const existing = document.getElementById(BANNER_ID);
  if (!rawHtml) {
    if (existing) existing.remove();
    return;
  }

  const banner = existing || document.createElement("div");
  banner.id = BANNER_ID;
  banner.className = "special-notice-alert-box";
  banner.style.display = "block";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Announcement banner");

  banner.innerHTML = `
    <div class="special-notice-container-2">
      <div class="special-notice-title-holder-2">
        <div class="special-notice-title-2">Announcement</div>
      </div>
      <div class="special-notice-text-holder-2">
        <div class="slider-alert w-slide">
          <div class="div-block-10">
            <div class="div-block-8">
              <div class="text-block-9">
                <div class="bold-text-2">${rawHtml}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="special-notice-close-2" id="close-alert-btn" type="button" aria-label="Close announcement">&times;</button>
    </div>
  `;

  const closeBtn = banner.querySelector("#close-alert-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      banner.style.display = "none";
    });
  }

  if (!existing) {
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

export async function initAnnouncementBanner(db) {
  const apply = (settings) => renderAnnouncementBanner(getBannerText(settings));

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      apply(JSON.parse(cached));
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    const snap = await getDoc(doc(db, "admin", "public-settings"));
    const settings = snap.exists() ? snap.data() : null;
    const freshRaw = JSON.stringify(settings);

    if (freshRaw !== cached) {
      localStorage.setItem(CACHE_KEY, freshRaw);
      apply(settings);
    }
  } catch (err) {
    console.warn("Failed to load public settings", err);
  }
}
