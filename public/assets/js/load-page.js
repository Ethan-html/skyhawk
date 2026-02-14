// /assets/js/load-page.js
import { doc, collection, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Sanitize HTML to prevent XSS (DOMPurify loaded via script or fallback)
function sanitizeHtml(html) {
  if (typeof window !== "undefined" && window.DOMPurify) {
    return window.DOMPurify.sanitize(html || "", {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['iframe'], // allow iframe
      ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'scrolling'], // common iframe attributes
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // keep safe URLs
    });
  }
  
  // Fallback: if DOMPurify is not loaded, just allow iframes manually
  const div = document.createElement("div");
  div.innerHTML = html; // WARNING: trust your HTML if using this
  // Optional: remove <script> tags manually if you want extra safety
  div.querySelectorAll('script').forEach(s => s.remove());
  return div.innerHTML;
}


/**
 * Load page from Firebase with localStorage caching, instant render, and background revalidate
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} sectionId - Page ID
 * @param {(data: object) => void} onUpdate - Callback to render page
 */
export async function loadPage(db, sectionId, onUpdate) {
  const cacheKey = `pageData_${sectionId}`;
  const cachedRaw = localStorage.getItem(cacheKey);

  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      onUpdate(cached); // 🔥 Instant render
    } catch {}
  }

  // --- Always revalidate in background ---
  const pageSnap = await getDoc(doc(db, "pages", sectionId));
  if (!pageSnap.exists()) {
    window.location.href = "/404";
    return;
  }

  const childrenSnap = await getDocs(collection(db, `pages/${sectionId}/children`));

  const fresh = {
    id: sectionId,
    title: pageSnap.data().title,
    content: pageSnap.data().content,
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

  // Update only if data changed
  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(cacheKey, JSON.stringify(fresh));
    onUpdate(fresh); // 🔁 Re-render with fresh data
  }
}

/**
 * Render page to DOM
 * @param {object} pageData
 */
export function renderPage(pageData) {
  if (!pageData) return;

  const params = new URLSearchParams(location.search);
  const [, childSlug] = (params.get("page") || "").split("/");
  const children = Object.values(pageData.children);
  let active;
  if (childSlug) {
    // Load child page by slug or fallback to first child
    active = children.find(c => c.slug === childSlug) || children[0];
  } else if (pageData.content) {
    // No childSlug → use root page if it has content
    active = {
      title: pageData.title,
      content: pageData.content
    };
  } else if (pageData.id === "page") {
    window.location.href = "/404";
  } else {
    active = children[0];
  }

  const leftNav = document.querySelector(".left-nav-column");
  const mainContent = document.querySelector(".main-content-column");
  if (pageData.id === "page") {
    leftNav.style.display = "none";
    mainContent.style.width = "100%";
    mainContent.style.marginLeft = "0";
  } else {
    leftNav.style.display = "";
    mainContent.style.width = "";
    mainContent.style.marginLeft = "";
  }

  const sideList = document.getElementById("sideNavList");
  const sideTitle = document.getElementById("sideNavTitleLink");
  const pageTitleEl = document.getElementById("pageTitle");
  const pageContentEl = document.getElementById("pageContent");
  document.title = active.title;
  sideTitle.textContent = pageData.title;
  sideTitle.href = `/page?page=${pageData.id}`;
  sideList.innerHTML = "";

  const navFragment = document.createDocumentFragment();
  for (const c of children) {
    const li = document.createElement("li");
    li.className = "left-nav-list-item";
    const a = document.createElement("a");
    a.className = "left-nav-list-link";
    a.href = `/page?page=${pageData.id}/${c.slug}`;
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
    pageContentEl.innerHTML = sanitizeHtml(active.content);
  }
}
