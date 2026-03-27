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

    a.className =
      "group block overflow-hidden rounded-xl bg-white/90 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-black/20 dark:hover:border-slate-500";

    const img = document.createElement("img");
    img.src = IMG_BASE_PATH + (box.img || "");
    img.alt = box.title || "Member resource";
    img.loading = "lazy";

    img.className = "h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]";

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