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
  let counter = 0;

  for (const box of boxes) {

    const a = document.createElement("a");
    a.href = box.url || "#";
    a.target = box.target || "_self";
    a.className = `custom-link cb ${box.position || "left"}`;

    const img = document.createElement("img");
    img.src = IMG_BASE_PATH + (box.img || "");
    img.alt = "";
    img.loading = "lazy";
    img.className = "cb-image";

    a.appendChild(img);
    fragment.appendChild(a);

    counter++;

    if (counter % 3 === 0) {
      const clearDiv = document.createElement("div");
      clearDiv.className = "w--mehiddendium w-hidden-small w-hidden-tiny clearBoth";
      fragment.appendChild(clearDiv);
    }
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