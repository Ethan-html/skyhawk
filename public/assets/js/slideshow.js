// /assets/js/slideshow.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import Glide from "https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/glide.esm.min.js";

const CACHE_KEY = "slideshow_urls";

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

  urls.forEach(url => {
    const li = document.createElement("li");
    li.className = "glide__slide";

    const img = document.createElement("img");
    img.src = url;
    img.loading = "lazy";
    img.width = 1920;   // actual image width
    img.height = 1080;  // actual image height

    li.appendChild(img);
    slidesContainer.appendChild(li);
  });

  mountGlide();
}

async function fetchSlideshow(db) {
  try {
    const snap = await getDoc(doc(db, "main", "slideshow"));
    if (!snap.exists()) return [];

    const urls = snap.data().urls || "";
    return urls
      .split(",")
      .map(u => u.trim())
      .filter(Boolean);
  } catch (err) {
    console.warn("Failed to fetch slideshow:", err);
    return [];
  }
}

export async function initSlideshow(db) {
  // 🔥 1. Render cached immediately
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      renderSlides(cached);
    } catch {}
  }

  // 🔄 2. Revalidate in background
  const fresh = await fetchSlideshow(db);
  if (!fresh.length) return;

  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    renderSlides(fresh);
  }
}
