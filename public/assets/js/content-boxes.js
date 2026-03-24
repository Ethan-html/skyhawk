// /assets/js/content-boxes.js

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "contentBoxesChildren";
const IMG_BASE_PATH = "/media/website/content-boxs/";

// Fetch boxes
async function fetchContentBoxes(db) {
  try {
    const colRef = collection(db, "member", "contentBoxes", "children");
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.warn("Failed to fetch content boxes:", err);
    return [];
  }
}

// Render boxes
function renderBoxes(boxes) {
  const container = document.querySelector("#content-boxes-wrapper");
  if (!container) return;

  const fragment = document.createDocumentFragment();

  for (const box of boxes) {
    const a = document.createElement("a");
    a.href = box.url || "#";
    a.target = box.target || "_self";

    // Tailwind classes for hover pop
    a.className = "block transform transition-transform duration-300 hover:scale-105";

    const img = document.createElement("img");
    img.src = IMG_BASE_PATH + (box.img || "");
    img.alt = "";
    img.loading = "lazy";

    // Keep natural size, scale width to column, no cropping
    img.className = "w-full h-auto";

    a.appendChild(img);
    fragment.appendChild(a);
  }

  container.innerHTML = "";
  container.appendChild(fragment);
}

// Init with cache
export async function initContentBoxes(db) {

  const cachedRaw = localStorage.getItem(CACHE_KEY);

  if (cachedRaw) {
    try {
      renderBoxes(JSON.parse(cachedRaw));
    } catch {}
  }

  const fresh = await fetchContentBoxes(db);
  if (!fresh.length) return;

  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    renderBoxes(fresh);
  }
}