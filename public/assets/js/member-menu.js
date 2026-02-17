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
      const orderedChildren = sortByOptionalOrderId([...children]);
      orderedChildren.forEach(child => {
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

  menuRoot.addEventListener("mouseenter", (e) => {
    const li = e.target.closest(".main-li.has-dropdown");
    if (li) li.classList.add("open");
  }, true);
  menuRoot.addEventListener("mouseleave", (e) => {
    const li = e.target.closest(".main-li.has-dropdown");
    if (li && !li.contains(e.relatedTarget)) li.classList.remove("open");
  }, true);
}

function buildMobileMenu(pagesWithChildren, root, isMemberMenu = false) {
  if (!isMemberMenu) root.innerHTML = ""; // clear only if it's main menu
  const fragment = document.createDocumentFragment();

  // --------------------
  // For member menu, add a divider first
  if (isMemberMenu) {
    const menuButtonText = document.getElementById("menu-button-text");
    if (menuButtonText) menuButtonText.textContent = "Member Menu";
    // Top divider
    const topDivider = document.createElement("li");
    topDivider.className = "mobile-menu-divider";
    topDivider.style.borderTop = "2px solid #ccc";
    topDivider.style.margin = "8px 0";
    topDivider.style.height = "0";
    topDivider.style.width = "100%";
    topDivider.style.listStyle = "none"; // remove bullet
    fragment.appendChild(topDivider);

    // Member Menu title
    const titleLi = document.createElement("li");
    titleLi.className = "mobile-menu-title";
    titleLi.textContent = "Member Menu";
    titleLi.style.fontWeight = "bold";
    titleLi.style.fontSize = "1.8em";       // double size (adjust as needed)
    titleLi.style.color = "#fff";           // white text
    titleLi.style.textAlign = "center";     // center text
    titleLi.style.padding = "8px 0";        // vertical padding
    titleLi.style.listStyle = "none";       // remove bullet
    titleLi.style.pointerEvents = "none";   // make it non-clickable
    fragment.appendChild(titleLi);


    // Bottom divider
    const bottomDivider = document.createElement("li");
    bottomDivider.className = "mobile-menu-divider";
    bottomDivider.style.borderTop = "2px solid #ccc";
    bottomDivider.style.margin = "0 0 8px 0";
    bottomDivider.style.height = "0";
    bottomDivider.style.width = "100%";
    bottomDivider.style.listStyle = "none"; // remove bullet
    fragment.appendChild(bottomDivider);
  }

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
      const orderedChildren = sortByOptionalOrderId([...children]);
      orderedChildren.forEach(child => {
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

    fragment.appendChild(li);
  });

  root.appendChild(fragment);
}


export async function initMemberMenu(db) {
  const desktopRoot = document.getElementById("member-menu");
  const mobileRoot = document.getElementById("mobile-menu-root"); // same UL as main menu

  if (!desktopRoot && !mobileRoot) return;

  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (desktopRoot) buildMenu(cached, desktopRoot);
      if (mobileRoot) buildMobileMenu(cached, mobileRoot, true); // <-- pass true
    } catch {}
  }

  const fresh = await fetchMemberMenu(db);
  if (!fresh.length) return;

  if (JSON.stringify(fresh) !== cachedRaw) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    if (desktopRoot) {
      desktopRoot.innerHTML = "";
      buildMenu(fresh, desktopRoot);
    }
    if (mobileRoot) {
      buildMobileMenu(fresh, mobileRoot, true); // <-- pass true
    }
  }
}


