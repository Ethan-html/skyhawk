// /assets/js/load-member-page.js
import {
  doc,
  collection,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Same sanitization as public pages: allow iframes and attributes used in member content
function sanitizeHtml(html) {
  if (typeof window !== "undefined" && window.DOMPurify) {
    return window.DOMPurify.sanitize(html || "", {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["iframe"],
      ADD_ATTR: [
        "src",
        "width",
        "herf",
        "height",
        "frameborder",
        "allow",
        "allowfullscreen",
        "scrolling",
        "style",
        "loading",
        "referrerpolicy"
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^-a-z+.:]|$))/i
    });
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("script").forEach((s) => s.remove());
  return div.innerHTML;
}

/**
 * Load member page with caching, instant render, and background revalidate
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} sectionId - Page ID
 * @param {(data: object) => void} onUpdate - Callback to render page
 */
export async function loadMemberPage(db, sectionId, onUpdate) {
  const cacheKey = `memberPageData_${sectionId}`;
  const cachedRaw = localStorage.getItem(cacheKey);

  // Minimal loading UI (only if nothing cached)
  if (!cachedRaw) {
    const pageTitleEl = document.getElementById("pageTitle");
    const pageContentEl = document.getElementById("pageContent");
    if (pageTitleEl) pageTitleEl.textContent = "Loading…";
    if (pageContentEl) {
      pageContentEl.innerHTML = `
        <div class="not-prose space-y-4">
          <div class="h-4 w-3/4 rounded bg-slate-200/80 dark:bg-slate-700/60 animate-pulse"></div>
          <div class="h-4 w-full rounded bg-slate-200/80 dark:bg-slate-700/60 animate-pulse"></div>
          <div class="h-4 w-11/12 rounded bg-slate-200/80 dark:bg-slate-700/60 animate-pulse"></div>
          <div class="h-4 w-2/3 rounded bg-slate-200/80 dark:bg-slate-700/60 animate-pulse"></div>
        </div>
      `;
    }
  }

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

    childrenSnap.forEach((c) => {
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
// Extend renderMemberPage to attach staff diagram lightbox if relevant
export function renderMemberPage(pageData) {
  if (!pageData) return;

  const [, childSlug] = (new URLSearchParams(location.search).get("page") || "").split("/");
  const children = Object.values(pageData.children);
  const active = children.find((c) => c.slug === childSlug) || children[0];

  const leftNav = document.getElementById("leftNav");
  const mainContent = document.getElementById("mainContentWrap");
  if (pageData.id === "page") {
    leftNav?.classList.add("lg:hidden");
    mainContent?.classList.remove("lg:col-span-9");
    mainContent?.classList.add("lg:col-span-12");
  } else {
    leftNav?.classList.remove("lg:hidden");
    mainContent?.classList.remove("lg:col-span-12");
    mainContent?.classList.add("lg:col-span-9");
  }
  const sideList = document.getElementById("sideNavList");
  const sideTitle = document.getElementById("sideNavTitleLink");
  const pageTitleEl = document.getElementById("pageTitle");
  const pageContentEl = document.getElementById("pageContent");

  if (sideTitle) {
    sideTitle.textContent = pageData.title;
    sideTitle.href = `/memberpage?page=${pageData.id}`;
  }
  sideList.innerHTML = "";

  const navFragment = document.createDocumentFragment();
  for (const c of children) {
    const li = document.createElement("li");
    li.className = "";
    const a = document.createElement("a");
    a.className =
      "relative block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white";
    a.href = `/memberpage?page=${pageData.id}/${c.slug}`;
    a.textContent = c.title;
    if (c.slug === active.slug) {
      a.classList.add(
        "relative",
        "pl-4",

        // background
        "bg-slate-200/70",
        "text-slate-900",
        "dark:bg-slate-700/50",
        "dark:text-white",

        "rounded-lg",

      );

      // 👇 REAL LEFT BAR (not pseudo)
      const bar = document.createElement("span");
      bar.className = "absolute left-0 top-0 h-full w-[4px] bg-capBlue rounded-l-lg";
      a.appendChild(bar);
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    navFragment.appendChild(li);
  }
  sideList.appendChild(navFragment);

  if (pageTitleEl) pageTitleEl.textContent = active.title;
  if (active.externalUrl) {
    location.href = active.externalUrl;
  } else {
    if (pageContentEl) pageContentEl.innerHTML = sanitizeHtml(active.content);
  }

  // -------------------------------------------
  // Attach Staff Diagram Lightbox if relevant
  // -------------------------------------------
  const staffImg = pageContentEl.querySelector("#staffDiagram");
  if (staffImg) {
    // Force newest version immediately
    const version = window.ASSET_VERSION || new Date().getTime();
    const url = new URL(staffImg.src, window.location.origin);
    url.searchParams.set("v", version);
    staffImg.src = url.toString(); // Replace main image immediately

    // Create lightbox once
    let lightbox = document.getElementById("staff-lightbox");
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.id = "staff-lightbox";
      Object.assign(lightbox.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.95)",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
      });
      const imgContainer = document.createElement("div");
      Object.assign(imgContainer.style, {
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        maxHeight: "90vh",
        overflow: "auto"
      });
      const lightboxImg = document.createElement("img");
      lightboxImg.id = "staff-lightbox-img";
      Object.assign(lightboxImg.style, {
        display: "block",
        maxWidth: "100%",
        height: "auto"
      });
      imgContainer.appendChild(lightboxImg);
      lightbox.appendChild(imgContainer);
      document.body.appendChild(lightbox);

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          lightbox.style.display = "none";
          document.body.style.overflow = "";
        }
      });
    }

    // Click handler for lightbox
    staffImg.style.cursor = "pointer";
    staffImg.addEventListener("click", () => {
      const version = window.ASSET_VERSION || new Date().getTime();
      const url = new URL(staffImg.src, window.location.origin);
      url.searchParams.set("v", version);

      const preloaded = new Image();
      preloaded.src = url.toString();
      preloaded.onload = () => {
        staffImg.src = preloaded.src;
        const lbImg = document.getElementById("staff-lightbox-img");
        lbImg.src = preloaded.src;
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
      };
    });
  }

}

