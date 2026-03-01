// /assets/js/content-boxes.js
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "contentBoxesChildren";

// Helper: load collection with cache
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

// Render content boxes into DOM (uses DocumentFragment for fewer reflows)
function renderBoxes(boxes) {
  const container = document.querySelector(".cb-wrapper");
  if (!container) return;

  const fragment = document.createDocumentFragment();
  let counter = 0;

  for (const box of boxes) {
    const a = document.createElement("a");
    a.href = box.url || "#";
    a.target = box.target || "_self";
    a.className = `custom-link cb ${box.position || "left"}`;

    const innerDiv = document.createElement("div");
    innerDiv.className = "cb-content w-clearfix";

    const headingDiv = document.createElement("div");
    headingDiv.className = "cb-text-heading";
    const span = document.createElement("span");
    span.textContent = box.title || "No Title";
    headingDiv.appendChild(span);

    const img = document.createElement("img");
    img.src = box.img || "";
    img.alt = box.title || "";
    img.loading = "lazy";
    img.className = "cb-image";
    img.width = 186;
    img.height = 186;

    innerDiv.appendChild(headingDiv);
    innerDiv.appendChild(img);
    a.appendChild(innerDiv);
    fragment.appendChild(a);

    counter++;
    if (counter % 3 === 0) {
      const clearDiv = document.createElement("div");
      clearDiv.className = "w--mehiddendium w-hidden-small w-hidden-tiny clearBoth";
      fragment.appendChild(clearDiv);
    }
  }

  const clearDiv = document.createElement("div");
  clearDiv.className = "w--mehiddendium w-hidden-small w-hidden-tiny clearBoth";
  fragment.appendChild(clearDiv);

  container.innerHTML = "";
  container.appendChild(fragment);
}

// Public function to initialize content boxes with cache + revalidate
export async function initContentBoxes(db) {
  // 1️⃣ Render cached immediately
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      renderBoxes(cached);
    } catch {}
  }

  // 2️⃣ Fetch fresh in background
  const fresh = await fetchContentBoxes(db);
  if (!fresh.length) return;

  // 3️⃣ Only update if changed
  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    renderBoxes(fresh);
  }
}
