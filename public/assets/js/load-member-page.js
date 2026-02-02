// /assets/js/load-member-page.js
import { doc, collection, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Load member page with caching, instant render, and background revalidate
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} sectionId - Page ID
 * @param {(data: object) => void} onUpdate - Callback to render page
 */
export async function loadMemberPage(db, sectionId, onUpdate) {
  const cacheKey = `memberPageData_${sectionId}`;
  const cachedRaw = localStorage.getItem(cacheKey);

  // 1️⃣ Instant render from cache
  if (cachedRaw) {
    try { 
      onUpdate(JSON.parse(cachedRaw));
    } catch {}
  }

  // 2️⃣ Load fresh page from Firestore
  try {
    // Member page document
    const pageRef = doc(db, "member", "pages", "children", sectionId);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      window.location.href = "/404"; // Redirect to 404 if not found
      return;
    }

    // Children collection
    const childrenRef = collection(db, "member", "pages", "children", sectionId, "children");
    const childrenSnap = await getDocs(childrenRef);

    const fresh = {
      id: sectionId,
      title: pageSnap.data().title,
      children: {}
    };

    childrenSnap.forEach(c => {
      const d = c.data();
      fresh.children[d.slug] = {
        title: d.title,
        slug: d.slug,
        content: d.content,
        externalUrl: d.externalUrl || null
      };
    });

    // 3️⃣ Update if changed
    if (JSON.stringify(fresh) !== cachedRaw) {
      localStorage.setItem(cacheKey, JSON.stringify(fresh));
      onUpdate(fresh);
    }

  } catch (err) {
    console.error("Failed to load member page:", err);
  }
}

/**
 * Render member page to DOM
 * @param {object} pageData
 */
export function renderMemberPage(pageData) {
  if (!pageData) return;

  const [, childSlug] = (new URLSearchParams(location.search).get("page") || "").split("/");
  const children = Object.values(pageData.children);
  const active = children.find((c) => c.slug === childSlug) || children[0];

  const sideList = document.getElementById("sideNavList");
  const sideTitle = document.getElementById("sideNavTitleLink");
  const pageTitleEl = document.getElementById("pageTitle");
  const pageContentEl = document.getElementById("pageContent");

  sideTitle.textContent = pageData.title;
  sideTitle.href = `/memberpage?page=${pageData.id}`;
  sideList.innerHTML = "";

  const navFragment = document.createDocumentFragment();
  for (const c of children) {
    const li = document.createElement("li");
    li.className = "left-nav-list-item";
    const a = document.createElement("a");
    a.className = "left-nav-list-link";
    a.href = `/memberpage?page=${pageData.id}/${c.slug}`;
    a.textContent = c.title;
    if (c.slug === active.slug) a.classList.add("selected");
    li.append(a, document.createElement("div"));
    navFragment.appendChild(li);
  }
  sideList.appendChild(navFragment);

  pageTitleEl.textContent = active.title;
  if (active.externalUrl) {
    location.href = active.externalUrl;
  } else {
    pageContentEl.innerHTML = active.content;
  }
}
