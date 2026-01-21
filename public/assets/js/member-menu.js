// /assets/js/member-menu.js
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "menuPagesMember";

// --------------------
// Fetch member menu from Firestore
// --------------------
async function fetchMemberMenu(db) {
  try {
    const pagesCollection = collection(db, "member", "menu", "pages");
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
    console.warn("Failed to fetch member menu:", err);
    return [];
  }
}

// --------------------
// Render menu (desktop & mobile)
// --------------------
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

  // jQuery hover for dropdowns
  if (window.jQuery) {
    jQuery('.main-li.has-dropdown').each(function () {
      const $item = jQuery(this);
      $item.off('mouseenter mouseleave');
      $item.on('mouseenter', () => $item.addClass('open'));
      $item.on('mouseleave', () => $item.removeClass('open'));
    });
  }
}

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

// --------------------
// Public init function
// --------------------
export async function initMemberMenu(db) {
  const desktopRoot = document.getElementById("member-menu");
  const mobileRoot = document.getElementById("mobile-member-menu");

  if (!desktopRoot && !mobileRoot) return;

  // 1️⃣ Render cached menu instantly
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (desktopRoot) buildMenu(cached, desktopRoot);
      if (mobileRoot) buildMobileMenu(cached, mobileRoot);
    } catch {}
  }

  // 2️⃣ Fetch fresh menu from Firestore
  const fresh = await fetchMemberMenu(db);
  if (!fresh.length) return;

  // 3️⃣ Only update if data changed
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
