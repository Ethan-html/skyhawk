// /assets/js/menu.js
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "menuPages";

// Helper: fetch menu pages from Firebase
async function fetchMenu(db) {
  try {
    const pagesCollection = collection(db, "main", "menu", "pages");
    const pagesSnap = await getDocs(pagesCollection);

    const pagesWithChildren = await Promise.all(
      pagesSnap.docs.map(async pageDoc => {
        const childrenSnap = await getDocs(
          collection(pagesCollection, pageDoc.id, "children")
        );
        return {
          page: pageDoc.data(),
          children: childrenSnap.docs.map(d => d.data())
        };
      })
    );

    return pagesWithChildren;
  } catch (err) {
    console.warn("Failed to fetch menu:", err);
    return [];
  }
}

// Render desktop menu
function buildMenu(pagesWithChildren, menuRoot) {
  const fragment = document.createDocumentFragment();

  pagesWithChildren.forEach(({ page, children }) => {
    const li = document.createElement("li");
    li.className = "main-li";
    li.id = `menu-item-${page.id || page.title}`;

    const a = document.createElement("a");
    a.href = page.url || "#";
    a.textContent = page.title;
    a.target = "_self";
    a.className = "main-nav-link";
    li.appendChild(a);

    if (children?.length) {
      li.classList.add("has-dropdown");
      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-container";

      const ul = document.createElement("ul");
      ul.className = "dropdown-list";

      children.forEach(child => {
        const cli = document.createElement("li");
        const ca = document.createElement("a");
        ca.href = child.url || "#";
        ca.textContent = child.title;
        ca.target = "_self";
        cli.appendChild(ca);
        ul.appendChild(cli);
      });

      dropdown.appendChild(ul);
      li.appendChild(dropdown);
    }

    fragment.appendChild(li);
  });

  menuRoot.appendChild(fragment);

  // Single delegated listener for all dropdowns (better performance)
  menuRoot.addEventListener("mouseenter", (e) => {
    const li = e.target.closest(".main-li.has-dropdown");
    if (li) li.classList.add("open");
  }, true);
  menuRoot.addEventListener("mouseleave", (e) => {
    const li = e.target.closest(".main-li.has-dropdown");
    if (li && !li.contains(e.relatedTarget)) li.classList.remove("open");
  }, true);
}

// Render mobile menu
function buildMobileMenu(pagesWithChildren, root) {
  root.innerHTML = "";

  pagesWithChildren.forEach(({ page, children }) => {
    const li = document.createElement("li");
    li.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");

    const a = document.createElement("a");
    a.className = "nav-link w-nav-link";
    a.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
    a.href = page.url || "#";
    a.textContent = page.title;

    li.appendChild(a);

    if (children?.length) {
      const ul = document.createElement("ul");

      children.forEach(child => {
        const cli = document.createElement("li");
        cli.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");

        const ca = document.createElement("a");
        ca.className = "nav-link w-nav-link";
        ca.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
        ca.href = child.url || "#";
        ca.textContent = child.title;

        cli.appendChild(ca);
        ul.appendChild(cli);
      });

      li.appendChild(ul);
    }

    root.appendChild(li);
  });
}

// Public function to initialize menu with cache + revalidate
export async function initMenu(db) {
  const desktopRoot = document.getElementById("main-menu");
  const mobileRoot = document.getElementById("mobile-menu-root");

  if (!desktopRoot && !mobileRoot) return;

  // 1️⃣ Render cached menu immediately
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (desktopRoot) buildMenu(cached, desktopRoot);
      if (mobileRoot) buildMobileMenu(cached, mobileRoot);
    } catch {}
  }

  // 2️⃣ Fetch fresh data in background
  const fresh = await fetchMenu(db);
  if (!fresh.length) return;

  // 3️⃣ Only update if changed
  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    if (desktopRoot) {
      desktopRoot.innerHTML = "";
      buildMenu(fresh, desktopRoot);
    }
    if (mobileRoot) {
      buildMobileMenu(fresh, mobileRoot);
    }
  }
}
