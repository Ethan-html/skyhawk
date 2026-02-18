// /assets/js/slideshow.js
// Uses same source as photos page; repo config in config.js (SITE_CONFIG.github)
import Glide from "https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/glide.esm.min.js";

const CACHE_KEY = "slideshow_urls";

function getSlideshowConfig() {
  const g = typeof window !== "undefined" && window.SITE_CONFIG?.github;
  return {
    owner: g?.owner || "Ethan-html",
    repo: g?.repo || "skyhawk-photos",
    branch: g?.branch || "main",
    folder: g?.slideshowFolder || "slideshow photos"
  };
}

/** GitHub API URL for slideshow.json (bypasses jsDelivr CDN so order/hidden updates on reload) */
function getSlideshowJsonApiUrl() {
  const c = getSlideshowConfig();
  const path = encodeURIComponent(c.folder + "/slideshow.json");
  return `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${path}?ref=${encodeURIComponent(c.branch)}`;
}

function getSlideshowImageBase() {
  const c = getSlideshowConfig();
  return `https://cdn.jsdelivr.net/gh/${c.owner}/${c.repo}@${c.branch}/${encodeURIComponent(c.folder)}/`;
}

function mountGlide() {
  new Glide("#slideshow-container", {
    type: "carousel",
    perView: 1,
    focusAt: "center",
    gap: 0,
    autoplay: 5000,
    hoverpause: true
  }).mount();
}

function renderSlides(urls) {
  const slidesContainer = document.getElementById("glide-slides");
  if (!slidesContainer || !urls.length) return;

  slidesContainer.innerHTML = "";

  const fragment = document.createDocumentFragment();
  urls.forEach((url, i) => {
    const li = document.createElement("li");
    li.className = "glide__slide";
    const img = document.createElement("img");
    img.src = url;
    img.loading = i === 0 ? "eager" : "lazy";
    img.alt = "Slideshow image";
    if (i === 0) img.fetchPriority = "high";
    li.appendChild(img);
    fragment.appendChild(li);
  });
  slidesContainer.appendChild(fragment);

  mountGlide();
}

/**
 * Fetch slideshow order from GitHub repo JSON.
 * JSON shape: [{ "file": "name.webp", "hidden": false }, ...]
 * Returns array of full image URLs (jsDelivr), in order, excluding hidden.
 * Fetches via GitHub API (not jsDelivr) so reload gets current order/hidden from repo.
 */
async function fetchSlideshowFromGitHub() {
  try {
    const apiUrl = getSlideshowJsonApiUrl();
    const imageBase = getSlideshowImageBase();
    const res = await fetch(apiUrl + "&_=" + Date.now(), {
      cache: "no-store",
      headers: { Accept: "application/vnd.github.v3.raw" }
    });
    if (!res.ok) return [];
    const text = await res.text();
    const list = JSON.parse(text);
    if (!Array.isArray(list)) return [];

    return list
      .filter((item) => !item.hidden)
      .map((item) => imageBase + encodeURIComponent(item.file || ""));
  } catch (err) {
    console.warn("Failed to fetch slideshow from GitHub:", err);
    return [];
  }
}

/**
 * @param {object} db - Firestore instance (unused; slideshow now uses GitHub)
 */
export async function initSlideshow(_db) {
  // 1. Render from cache immediately
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.length) renderSlides(cached);
    } catch {}
  }

  // 2. Always fetch fresh from GitHub (cache-busted) so reload shows latest order/hidden
  const fresh = await fetchSlideshowFromGitHub();
  if (!fresh.length) return;

  localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
  renderSlides(fresh);
}
